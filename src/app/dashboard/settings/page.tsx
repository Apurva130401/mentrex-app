'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trash2, Save } from "lucide-react"
// import { useToast } from "@/hooks/use-toast" // Missing
// import { Separator } from "@/components/ui/separator" // Missing
// import { Label } from "@/components/ui/label" // Missing

export default function AccountSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [name, setName] = useState("")
    const [originalName, setOriginalName] = useState("")
    const [email, setEmail] = useState("")
    const [providers, setProviders] = useState<string[]>([])
    // const { toast } = useToast()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    setUser(user)
                    // Fetch profile data using 'uid' instead of 'id'
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('name, email, providers')
                        .eq('uid', user.id) // Correct column
                        .single()

                    if (error && error.code !== 'PGRST116') {
                        throw error
                    }

                    if (profile) {
                        setName(profile.name || "")
                        setOriginalName(profile.name || "")
                        setEmail(profile.email || user.email || "")
                        setProviders(profile.providers || [])
                    } else {
                        // If no profile exists, fall back to auth email
                        setEmail(user.email || "")
                    }
                }
            } catch (error: any) {
                console.error("Error fetching profile:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    const handleSave = async () => {
        if (!user) return

        setSaving(true)
        try {
            // First try to update
            const { error, data } = await supabase
                .from('profiles')
                .update({
                    name: name,
                    // email: email, // Optional: Update email if needed, or rely on auth
                    updated_at: new Date().toISOString()
                })
                .eq('uid', user.id)
                .select() // To check if a row was actually updated

            let finalError = error

            // If no row updated (and no error), it means we need to insert
            if (!error && (!data || data.length === 0)) {
                const { error: insertError } = await supabase
                    .from('profiles')
                    .insert({
                        uid: user.id, // Explicitly set uid
                        name: name,
                        email: email,
                        updated_at: new Date().toISOString()
                    })
                finalError = insertError
            }

            if (finalError) throw finalError

            setOriginalName(name)
            alert("Profile updated successfully.")
        } catch (error: any) {
            alert("Failed to update profile.")
            console.error("Error updating profile:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        // This usually requires a secure server-side call (Supabase Admin) for full deletion
        // For now, we'll just show a toast as a placeholder or call a client-side method if allowed
        alert("Please contact support to delete your account.")

        // OR if you want to allow self-deletion via RPC or if policies allow
        /*
        const { error } = await supabase.rpc('delete_user')
        if (error) ...
        */
    }

    if (loading) {
        return <div className="flex h-full items-center justify-center text-muted-foreground animate-pulse">Loading settings...</div>
    }

    const hasChanges = name !== originalName

    return (
        <div className="space-y-8 max-w-4xl animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Account Settings</h2>
                <p className="text-muted-foreground mt-2">Manage your account profile and preferences.</p>
            </div>

            <div className="h-[1px] w-full bg-white/10" />

            <div className="grid gap-8">
                {/* Profile Information */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-xl">Profile Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email Address</label>
                            <Input
                                id="email"
                                value={email}
                                disabled
                                className="bg-white/5 border-white/10 text-neutral-400 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-muted-foreground">Email address cannot be changed directly.</p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Display Name</label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                className="bg-white/5 border-white/10 focus:border-amber-500/50 transition-colors"
                            />
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button
                                onClick={handleSave}
                                disabled={!hasChanges || saving}
                                className="bg-white text-black hover:bg-neutral-200"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Connected Identities */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-xl">Connected Identities</CardTitle>
                        <CardDescription>Accounts linked to your profile for easy access.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-4">
                            {/* Google */}
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 ${providers.includes('google') ? 'bg-white/5 border-amber-500/20 text-neutral-200 shadow-sm shadow-amber-500/5' : 'bg-transparent border-white/5 text-neutral-500 opacity-60'}`}>
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill={providers.includes('google') ? "#4285F4" : "currentColor"} />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill={providers.includes('google') ? "#34A853" : "currentColor"} />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill={providers.includes('google') ? "#FBBC05" : "currentColor"} />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill={providers.includes('google') ? "#EA4335" : "currentColor"} />
                                </svg>
                                <span className="font-medium">Google</span>
                                {providers.includes('google') && <span className="ml-auto text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">Connected</span>}
                            </div>

                            {/* GitHub */}
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 ${providers.includes('github') ? 'bg-white/5 border-white/20 text-neutral-200' : 'bg-transparent border-white/5 text-neutral-500 opacity-60'}`}>
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                <span className="font-medium">GitHub</span>
                                {providers.includes('github') && <span className="ml-auto text-xs bg-white/10 text-white px-2 py-0.5 rounded-full border border-white/10">Connected</span>}
                            </div>

                            {/* Discord */}
                            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300 ${providers.includes('discord') ? 'bg-white/5 border-indigo-500/20 text-indigo-200 shadow-sm shadow-indigo-500/5' : 'bg-transparent border-white/5 text-neutral-500 opacity-60'}`}>
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" /></svg>
                                <span className="font-medium">Discord</span>
                                {providers.includes('discord') && <span className="ml-auto text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">Connected</span>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-red-900/30 bg-red-950/10 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-red-500">Danger Zone</CardTitle>
                        <CardDescription className="text-red-400/60">Irreversible actions for your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-medium text-red-200">Delete Account</h4>
                                <p className="text-sm text-red-400/50">Once deleted, your account and all data will be permanently removed.</p>
                            </div>
                            <Button variant="destructive" onClick={handleDeleteAccount} className="bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-100">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
