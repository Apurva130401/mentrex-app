
import { NextResponse } from "next/server"
import { getAuthenticatedSupabaseClient } from "@/lib/auth-helper"
import { parseDiff } from "@/lib/diff-parser"

export async function POST(req: Request) {
    try {
        const { user, supabase } = await getAuthenticatedSupabaseClient()
        if (!user || !supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { repoOwner, repoName, prNumber, comments } = await req.json()

        if (!repoOwner || !repoName || !prNumber || !comments) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
        }

        // Get PAT
        const { data: config, error: dbError } = await supabase
            .from("github_configs")
            .select("encrypted_pat")
            .eq("user_id", user.id)
            .single()

        if (dbError || !config) {
            return NextResponse.json({ error: "GitHub config not found" }, { status: 404 })
        }

        const pat = config.encrypted_pat

        // 1. Fetch PR Diff to validate line numbers
        const diffRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}`, {
            headers: {
                Authorization: `Bearer ${pat}`,
                Accept: "application/vnd.github.v3.diff", // Request raw diff
            },
        })

        if (!diffRes.ok) {
            return NextResponse.json({ error: "Failed to fetch PR diff for validation" }, { status: diffRes.status })
        }

        const diffText = await diffRes.text()
        const parsedDiff = parseDiff(diffText)

        // Create a set of valid (file, line) pairs
        // validLines = "src/app/page.tsx:42"
        const validLines = new Set<string>()
        parsedDiff.forEach(file => {
            file.lines.forEach(line => {
                if (line.type === 'add' && line.newLine) {
                    validLines.add(`${file.file}:${line.newLine}`)
                }
            })
        })

        // Filter comments against valid lines AND clean up paths
        // GitHub API expects path to NOT start with "/" or "b/"
        // Fuzzy Path Matching Function
        function findMatchingFile(aiPath: string, validPaths: string[]): string | null {
            // 1. Exact match
            if (validPaths.includes(aiPath)) return aiPath

            // 2. Try removing leading slash
            if (aiPath.startsWith("/") && validPaths.includes(aiPath.substring(1))) return aiPath.substring(1)

            // 3. Try partial match (end of string)
            // e.g. AI says "app/page.tsx", valid is "src/app/page.tsx"
            const partialMatch = validPaths.find(p => p.endsWith(aiPath))
            if (partialMatch) return partialMatch

            return null
        }

        const validFilePaths = Array.from(new Set(parsedDiff.map(f => f.file)))

        const validReviewComments = comments
            .map((c: any) => {
                let cleanPath = c.file
                if (cleanPath.startsWith("b/")) cleanPath = cleanPath.substring(2)

                // Try to find the REAL path in the diff
                const matchedPath = findMatchingFile(cleanPath, validFilePaths)

                return { ...c, file: matchedPath || cleanPath } // Use matched path if found, else original
            })
            .filter((c: any) => {
                const key = `${c.file}:${c.lineNumber}`
                // We keep the check to prevent 422s, but we log strictly
                const isValid = validLines.has(key)
                if (!isValid) {
                    console.log(`Skipping invalid comment: ${key}`)
                }
                return isValid
            })
            .map((c: any) => ({
                path: c.file,
                line: c.lineNumber,
                side: "RIGHT",
                body: `**[AI Review] ${c.type.toUpperCase()}**\n\n${c.message}\n\n${c.codeSuggestion ? '```suggestion\n' + c.codeSuggestion + '\n```' : ''}`
            }))

        // Post the Review
        // Even if validReviewComments is empty, we post the summary to confirm the action happened.
        const summaryBody = `🤖 **AI Code Review Completed**\n\n` +
            `I analyzed the changes and found **${comments.length} potential issues**.\n` +
            (validReviewComments.length > 0
                ? `I have posted **${validReviewComments.length} inline comments** below.`
                : `However, I could not map them to specific lines in the diff (likely due to context mismatch or strict line checks). Please view the dashboard for full details.`)

        const githubRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/pulls/${prNumber}/reviews`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${pat}`,
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                event: "COMMENT",
                body: summaryBody,
                comments: validReviewComments
            })
        })

        if (!githubRes.ok) {
            const errorText = await githubRes.text()
            console.error("GitHub API Error", errorText)
            return NextResponse.json({ error: "Failed to post review to GitHub: " + githubRes.statusText }, { status: githubRes.status })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Publish Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
