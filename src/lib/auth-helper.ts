
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"

// This returns a client scoped to the user, bypassing RLS issues for their own data
export async function getAuthenticatedSupabaseClient() {
    const headersList = await headers()
    const authHeader = headersList.get("authorization")

    if (!authHeader) {
        return { user: null, supabase: null }
    }

    const token = authHeader.replace("Bearer ", "")

    // Create a scoped client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
        {
            global: {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        }
    )

    // Verify the user
    // We already passed the token in headers, so getUser() will use it too
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return { user: null, supabase: null }
    }

    return { user, supabase }
}
