'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Trash2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

export default function AccountSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [name, setName] = useState("")
    const [originalName, setOriginalName] = useState("")
    const [email, setEmail] = useState("")
    const { toast } = useToast()

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    setUser(user)
                    // Fetch profile data
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('name, email')
                        .eq('id', user.id)
                        .single()

                    if (error && error.code !== 'PGRST116') {
                        throw error
                    }

                    if (profile) {
                        setName(profile.name || "")
                        setOriginalName(profile.name || "")
                        setEmail(profile.email || user.email || "")
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
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    name: name,
                    email: email, // Keeping email in sync if needed, though usually read-only
                    updated_at: new Date().toISOString()
                })

            if (error) throw error

            setOriginalName(name)
            toast({
                title: "Profile updated",
                description: "Your changes have been saved successfully.",
            })
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive"
            })
            console.error("Error updating profile:", error)
        } finally {
            setSaving(false)
        }
    }

    const handleDeleteAccount = async () => {
        // This usually requires a secure server-side call (Supabase Admin) for full deletion
        // For now, we'll just show a toast as a placeholder or call a client-side method if allowed
        toast({
            title: "Account Deletion",
            description: "Please contact support to delete your account permanently for security reasons, or verify your identity.",
            variant: "destructive"
        })

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

            <Separator className="bg-white/10" />

            <div className="grid gap-8">
                {/* Profile Information */}
                <Card className="border-white/10 bg-black/40 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-xl">Profile Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                value={email}
                                disabled
                                className="bg-white/5 border-white/10 text-neutral-400 cursor-not-allowed"
                            />
                            <p className="text-[10px] text-muted-foreground">Email address cannot be changed directly.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
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
