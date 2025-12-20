
import { NextResponse } from "next/server"
import { getAuthenticatedSupabaseClient } from "@/lib/auth-helper"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

export async function POST(req: Request) {
    try {
        const { user, supabase } = await getAuthenticatedSupabaseClient()
        if (!user || !supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { repoOwner, repoName, prNumber } = await req.json()

        if (!repoOwner || !repoName || !prNumber) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        // Get PAT
        const { data: config, error: dbError } = await supabase
            .from("github_configs")
            .select("encrypted_pat")
            .eq("user_id", user.id)
            .single()

        if (dbError || !config) {
            return NextResponse.json({ error: "GitHub not connected" }, { status: 404 })
        }

        const pat = config.encrypted_pat

        // 1. Fetch PR Details (for title/url)
        const prRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}`, {
            headers: {
                Authorization: `Bearer ${pat}`,
                Accept: "application/vnd.github.v3+json",
            },
        })

        if (!prRes.ok) {
            return NextResponse.json({ error: "Failed to fetch PR details" }, { status: prRes.status })
        }

        const prData = await prRes.json()

        // 2. Fetch Diff
        const diffRes = await fetch(prData.diff_url, {
            headers: {
                Authorization: `Bearer ${pat}`,
            },
        })

        if (!diffRes.ok) {
            return NextResponse.json({ error: "Failed to fetch PR diff" }, { status: diffRes.status })
        }

        const diffText = await diffRes.text()

        if (diffText.length > 50000) {
            return NextResponse.json({ error: "PR is too large for AI analysis currently." }, { status: 400 })
        }

        // 3. AI Analysis
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const prompt = `
You are a Senior Software Engineer acting as a Code Reviewer.
Analyze the following Git Diff for a Pull Request.

Your goal is to provide specific, line-level feedback in JSON format.
Identify potential bugs, security issues, and suggestions.

**Input Diff:**
\`\`\`diff
${diffText}
\`\`\`

**Instructions:**
1. Return ONLY a valid JSON array. Do not wrap in markdown code blocks.
2. Each item in the array must be an object with:
   - "file": The file path (e.g., "src/app/page.tsx") derived from the diff header (+++ b/...).
   - "lineNumber": The line number in the NEW file where the issue exists. Calculate this carefully from the @@ ... @@ headers.
   - "type": One of "critical", "warning", "suggestion", or "commendation".
   - "message": A concise explanation of the issue.
   - "codeSuggestion": (Optional) A code snippet showing how to fix it.

If there are no issues, return an empty array [].
`

        const result = await model.generateContent(prompt)
        let responseText = result.response.text()

        // Cleanup markdown if present
        responseText = responseText.replace(/```json/g, "").replace(/```/g, "").trim()

        // 4. Save Record
        const { data: reviewRecord, error: insertError } = await supabase
            .from("code_reviews")
            .insert({
                user_id: user.id,
                repo_owner: repoOwner,
                repo_name: repoName,
                pr_number: prNumber,
                pr_title: prData.title,
                pr_url: prData.html_url,
                analysis_result: responseText, // Saving JSON string
                status: 'completed'
            })
            .select()
            .single()

        // Return parsed JSON to frontend
        let parsedResult = []
        try {
            parsedResult = JSON.parse(responseText)
        } catch (e) {
            console.error("Failed to parse AI JSON", e)
            // Fallback
            parsedResult = [{ type: 'warning', message: 'Failed to parse AI response. Raw output: ' + responseText }]
        }

        if (insertError) {
            console.error("DB Insert Error:", insertError)
        }

        return NextResponse.json({ result: parsedResult, review: reviewRecord, diff: diffText })

    } catch (error) {
        console.error("Analysis Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
