
import { NextResponse } from "next/server"
import { getAuthenticatedSupabaseClient } from "@/lib/auth-helper"

export async function GET(req: Request) {
    try {
        const { user, supabase } = await getAuthenticatedSupabaseClient()
        if (!user || !supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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

        // Fetch Repos
        const githubRes = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100&type=all", {
            headers: {
                Authorization: `Bearer ${pat}`,
                Accept: "application/vnd.github.v3+json",
            },
        })

        if (!githubRes.ok) {
            return NextResponse.json({ error: "Failed to fetch repositories from GitHub" }, { status: githubRes.status })
        }

        const repos = await githubRes.json()

        // precise mapping
        const mappedRepos = repos.map((r: any) => ({
            id: r.id,
            name: r.name,
            full_name: r.full_name,
            private: r.private,
            owner: r.owner.login,
            description: r.description,
            updated_at: r.updated_at
        }))

        return NextResponse.json({ repos: mappedRepos })

    } catch (error) {
        console.error("Repos Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
