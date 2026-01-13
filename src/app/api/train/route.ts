import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { getEmbedding } from "@/lib/embeddings"

// Initialize Supabase Client (needs Service Role Key for writing to vectors if policies are strict, 
// but assuming Anon Key works if RLS allows or we use Service Role)
// IMPORTANT: For production, use SERVICE_ROLE_KEY to bypass RLS for admin tasks
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
    // SECURITY: Block public access to training
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: "Training is disabled in production" }, { status: 403 })
    }

    try {
        const { text } = await req.json()
        if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 })

        // 1. Generate Embedding
        const embedding = await getEmbedding(text)

        // 2. Insert into DB
        const { error } = await supabase
            .from('documents')
            .insert({
                content: text,
                embedding: embedding,
                metadata: { source: 'admin-upload', date: new Date().toISOString() }
            })

        if (error) throw error

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Training Error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
