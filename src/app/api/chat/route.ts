
import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")

const MENTREX_CONTEXT = `
You are the AI Assistant for Mentrex, a premium AI-powered IDE dashboard.
Your goal is to help users navigate the dashboard and understand the features of Mentrex.

Mentrex Dashboard Features:
1.  **Overview**: Shows the user's current credits balance and a personalized greeting.
2.  **Billing**: Allows users to view their invoices and credit usage history.
3.  **API Keys**: Users can create, manage, and revoke API keys for the Mentrex API.
4.  **Support**: Provides contact information (support@mentrex.shop) and operating hours.

Tone & Style:
-   Professional, concise, and helpful.
-   Use markdown for formatting (lists, bold text).
-   If asked about coding or complex topics outside the dashboard, politely mention that your primary purpose is to help with the dashboard, but answer briefly if you can.
-   Always be polite and "premium" in your language (e.g., "Certainly," "I can help with that," "Feature available").

Current Context:
The user is currently logged into the dashboard.
`

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()

        // Get the last message from the user
        const lastMessage = messages[messages.length - 1]

        // Create the model
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        // Start chat
        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: MENTREX_CONTEXT }],
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am the Mentrex AI Assistant, ready to help users with their dashboard, billing, API keys, and more." }],
                },
                // Convert previous messages to history if needed, for now we just take the last query for simplicity in this stateless example or build full history
                // A robust impl would map 'messages' to history.
            ],
        })

        const result = await chat.sendMessage(lastMessage.content)
        const response = result.response.text()

        return NextResponse.json({ role: "assistant", content: response })

    } catch (error) {
        console.error("Chat Error:", error)
        return NextResponse.json({ error: "Failed to process message" }, { status: 500 })
    }
}
