
import { NextResponse } from "next/server"
import { getAuthenticatedSupabaseClient } from "@/lib/auth-helper"

export async function GET(req: Request) {
    try {
        const { user, supabase } = await getAuthenticatedSupabaseClient()
        if (!user || !supabase) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const owner = searchParams.get("owner")
        const repo = searchParams.get("repo")

        if (!owner || !repo) {
            return NextResponse.json({ error: "Owner and Repo are required" }, { status: 400 })
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

        // Fetch PRs
        const githubRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open`, {
            headers: {
                Authorization: `Bearer ${pat}`,
                Accept: "application/vnd.github.v3+json",
            },
        })

        if (!githubRes.ok) {
            return NextResponse.json({ error: "Failed to fetch PRs from GitHub" }, { status: githubRes.status })
        }

        const prs = await githubRes.json()

        const mappedPRs = prs.map((pr: any) => ({
            number: pr.number,
            title: pr.title,
            user: {
                login: pr.user.login,
                avatar_url: pr.user.avatar_url
            },
            created_at: pr.created_at,
            url: pr.html_url
        }))

        return NextResponse.json({ prs: mappedPRs })

    } catch (error) {
        console.error("PRs Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
