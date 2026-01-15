import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getEmbedding } from "@/lib/embeddings"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json()
        const lastMessage = messages[messages.length - 1]
        const userQuery = lastMessage.content
        const currentPage = context?.currentPage || "Unknown Page"

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
You are Eva, the intelligent and friendly AI assistant for the Mentrex Dashboard.
Your goal is to be a proactive, warm, and helpful partner to the user.

***CURRENT USER CONTEXT***
- Current Page: ${currentPage}

***KNOWLEDGE BASE***
${contextText}

***YOUR PERSONA***
- **Warm & Friendly**: Start with a friendly tone. Use casual but professional language.
- **Observant**: You know where the user is (Current Page). Use this to give specific advice.
  - Example: If on /billing, assume questions might be about credits or payments.
- **Proactive**: If a user asks about a feature, suggest where to find it or how to use it.
- **Humble**: If you don't know the answer, admit it gracefully.

***CAPABILITIES***
- You can raise support tickets for the user if they report a bug or need assistance you cannot provide.
- **IMPORTANT**: Before calling the "createTicket" tool, you MUST ask the user for confirmation.
  - Say something like: "I can raise a ticket for this. The description will be: '[Summary]'. Is that okay?"
  - ONLY call the tool after the user agrees.
- Use the **createTicket** tool for this.

***FALLBACK PROTOCOL (CRITICAL)***
If the user's question is NOT answered by the Knowledge Base or Context:
1.  **Acknowledge & Empathize**: "I understand you're looking for help with [topic]..."
2.  **Be Honest**: "I don't have that specific information handy right now, and I want to make sure you get the right answer."
3.  **Direct to Humans**: "The best way to get this resolved quickly is to chat with our team on Discord or check the support page."
    - Discord Link: [Join Community](https://discord.gg/yq5sUumr)
    - Support Page: /dashboard/support
    - **OR**: Ask if they want you to raise a ticket for them.

Question: ${userQuery}
`

        // 5. Generate Response with Tools
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const tools = [
            {
                functionDeclarations: [
                    {
                        name: "createTicket",
                        description: "Raises a support ticket for the user. Use this when the user reports a bug, asks for help that requires human intervention, or explicitly asks to create a ticket.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                issue_summary: {
                                    type: SchemaType.STRING,
                                    description: "A concise summary of the issue or request."
                                },
                            },
                            required: ["issue_summary"]
                        }
                    }
                ]
            }
        ]

        // Convert previous messages to Gemini format
        const history = messages.slice(0, -1).map((m: any) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }))

        // First generation pass
        const result = await model.generateContent({
            contents: [
                ...history,
                { role: "user", parts: [{ text: systemPrompt }] }
            ],
            tools: tools as any
        })
        const response = result.response
        const functionCall = response.functionCalls()?.[0]

        if (functionCall && functionCall.name === "createTicket") {
            const { issue_summary } = functionCall.args as any
            console.log("TOOL CALL: createTicket", issue_summary)

            // 1. Get User ID from Context
            // Since this is an API route called from client, we rely on the client passing the ID
            // In a production app, you'd verify the session token via RLS/Middleware for security
            const userId = context?.userId

            if (!userId) {
                return NextResponse.json({ role: "assistant", content: "I couldn't raise the ticket because I can't verify your identity. Please try logging in again." })
            }

            // 2. Insert into Supabase
            const { data: ticket, error } = await supabase
                .from('tickets')
                .insert({
                    user_id: userId,
                    message: issue_summary,
                    status: 'OPEN'
                })
                .select()
                .single()

            if (error) {
                console.error("Ticket Creation Error:", error)
                return NextResponse.json({ role: "assistant", content: "I tried to raise a ticket, but something went wrong on my end. Please try again later." })
            }

            // 3. Send Telegram Alert
            const { sendTelegramAlert } = await import("@/lib/telegram")
            await sendTelegramAlert(`🎫 **New Ticket Raised**\n\n**User ID**: \`${userId}\`\n**Issue**: ${issue_summary}\n**Ticket ID**: \`${ticket.id}\``)

            // 4. Return success message
            return NextResponse.json({ role: "assistant", content: `I've successfully raised a ticket for you (Ticket ID: #${ticket.id.slice(0, 8)}). Our team has been notified and will get back to you via your registered email in under 24 hrs.` })
        }

        // Normal response
        return NextResponse.json({ role: "assistant", content: response.text() })

    } catch (error: any) {
        console.error("Chat Error Details:", {
            message: error.message,
            stack: error.stack,
            cause: error.cause
        })
        return NextResponse.json({ error: "Failed to process message: " + error.message }, { status: 500 })
    }
}
