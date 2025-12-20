
import { NextResponse } from "next/server"
import { getAuthenticatedSupabaseClient } from "@/lib/auth-helper"

export async function POST(req: Request) {
    try {
        const { user, supabase } = await getAuthenticatedSupabaseClient()
        if (!user || !supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { error } = await supabase
            .from("github_configs")
            .delete()
            .eq("user_id", user.id)

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Disconnect Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
