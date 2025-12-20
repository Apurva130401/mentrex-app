
import { NextResponse } from "next/server"
import { getAuthenticatedSupabaseClient } from "@/lib/auth-helper"

export async function POST(req: Request) {
    try {
        const { user, supabase } = await getAuthenticatedSupabaseClient()
        if (!user || !supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { pat } = await req.json()

        if (!pat) {
            return NextResponse.json({ error: "PAT is required" }, { status: 400 })
        }

        // Validate PAT by making a simple call to GitHub
        const githubRes = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${pat}`,
                Accept: "application/vnd.github.v3+json",
            },
        })

        if (!githubRes.ok) {
            return NextResponse.json({ error: "Invalid GitHub PAT" }, { status: 400 })
        }

        const githubUser = await githubRes.json()

        // Upsert config
        const { error } = await supabase
            .from("github_configs")
            .upsert(
                {
                    user_id: user.id,
                    encrypted_pat: pat, // Storing as-is for MVP
                    github_username: githubUser.login,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "user_id" }
            )

        if (error) {
            console.error("DB Error:", error)
            return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 })
        }

        return NextResponse.json({ success: true, username: githubUser.login })

    } catch (error) {
        console.error("Connect Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
