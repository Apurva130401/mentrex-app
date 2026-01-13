import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getEmbedding } from "@/lib/embeddings"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()
        const lastMessage = messages[messages.length - 1]
        const userQuery = lastMessage.content

        // 1. Generate Embedding for the User's Query
        const embedding = await getEmbedding(userQuery)

        // 2. Retrieve Relevant Documents
        const { data: documents } = await supabase.rpc('match_documents', {
            query_embedding: embedding,
            match_threshold: 0.5, // Only relevant matches
            match_count: 3        // Top 3 chunks
        })

        // 3. Construct Context
        let contextText = ""
        if (documents && documents.length > 0) {
            contextText = documents.map((doc: any) => doc.content).join("\n---\n")
        }

        // 4. Build System Prompt with RAG
        const systemPrompt = `
You are the AI Assistant for Mentrex, a premium AI-powered IDE dashboard.
Use the Context below to answer the user.

Tone & Style:
-   **Empathetic & Helpful**: If a user is frustrated (e.g., waiting for support), acknowledge it and show you care. Don't be "bogus" or "robotic".
-   **Direct & Clear**: Give straight answers. No fluff.
-   **Unknown Info**: If the answer isn't in the Context, SAY SO politely, but try to offer a helpful alternative (e.g., "I don't track live email queues, but support usually responds within 24-48 hours. Please check your spam folder or try the Discord community for faster help.").
-   **Professional but Cool**: Use a modern, slightly tech-savvy tone.

Context:
${contextText}

Question: ${userQuery}
`

        // 5. Generate Response
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
        const result = await model.generateContent(systemPrompt)
        const response = result.response.text()

        return NextResponse.json({ role: "assistant", content: response })

    } catch (error) {
        console.error("Chat Error:", error)
        return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
    }
}
