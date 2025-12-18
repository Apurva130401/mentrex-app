'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginPage() {
    const router = useRouter()

    const handleLogin = async () => {
        const redirectUrl = `${window.location.origin}/dashboard`
        console.log("Attempting login with redirect to:", redirectUrl)

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectUrl,
            },
        })
        if (error) {
            console.error("Login failed:", error.message)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login to Mentrex</CardTitle>
                    <CardDescription>
                        Enter your details below to access your dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <Button variant="outline" className="w-full" onClick={handleLogin}>
                            Sign in with Google
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
