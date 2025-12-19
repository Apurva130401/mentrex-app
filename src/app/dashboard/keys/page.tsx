'use client'

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Copy, Trash2, Check, Terminal } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ApiKey {
    id: string
    name: string
    key_hash: string
    created_at: string
    last_used_at: string | null
}

export default function KeysPage() {
    const queryClient = useQueryClient()
    const [generatedKey, setGeneratedKey] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    // Fetch the single active key
    const { data: key, isLoading } = useQuery<ApiKey | null>({
        queryKey: ['api_key'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return null

            const { data, error } = await supabase
                .from('api_keys')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching key:", error)
            }
            return data as ApiKey || null
        }
    })

    const generateKeyMutation = useMutation({
        mutationFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            // 1. Generate Secure Key
            const array = new Uint8Array(24)
            crypto.getRandomValues(array)
            const rawKey = 'sk_live_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')

            // 2. Hash it for storage (SHA-256)
            const encoder = new TextEncoder()
            const data = encoder.encode(rawKey)
            const hashBuffer = await crypto.subtle.digest('SHA-256', data)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

            // 3. Insert Hash into DB
            // Note: DB enforces UNIQUE(user_id), so this will fail if key exists (good)
            const { error } = await supabase
                .from('api_keys')
                .insert({ 
                    user_id: user.id, 
                    name: "Default API Key", // User can adhere to "One Key", no need for names really
                    key_hash: hashHex // Storing HASH only
                })

            if (error) throw error
            
            return rawKey
        },
        onSuccess: (rawKey) => {
            setGeneratedKey(rawKey) // Display to user ONCE
            queryClient.invalidateQueries({ queryKey: ['api_key'] })
        },
        onError: (err) => {
             // If unique violation, user already has a key
             console.error("Failed to create key", err)
        }
    })

    const revokeKeyMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('api_keys').delete().eq('id', id)
            if (error) throw error
        },
        onSuccess: () => {
            setGeneratedKey(null)
            queryClient.invalidateQueries({ queryKey: ['api_key'] })
        }
    })

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    if (isLoading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">API Key</h1>
                <p className="text-muted-foreground mt-2">
                    Use this key to authenticate requests from the Mentrex CLI and VS Code Extension.
                </p>
            </div>

            {/* View: Newly Generated Key (Override everything else) */}
            {generatedKey && (
                <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-6 space-y-4">
                    <div className="flex items-center gap-2 text-green-500 font-semibold text-lg">
                        <Check className="h-5 w-5" /> Key Generated Successfully
                    </div>
                    <p className="text-sm">
                        This is the only time you will see this key. Please save it somewhere safe.
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="flex-1 bg-background p-3 rounded border font-mono text-sm break-all">
                            {generatedKey}
                        </code>
                        <Button onClick={() => copyToClipboard(generatedKey)}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setGeneratedKey(null)}>
                        I have saved this key
                    </Button>
                </div>
            )}

            {/* View: Active Key Exists (and we are not showing the new secret) */}
            {!generatedKey && key && (
                <Card>
                    <CardHeader>
                        <CardTitle>Active API Key</CardTitle>
                        <CardDescription>
                            Created on {new Date(key.created_at).toLocaleDateString()}
                            {key.last_used_at && ` • Last used ${new Date(key.last_used_at).toLocaleDateString()}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 p-4 border rounded-md bg-muted/50">
                            <Terminal className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1 font-mono text-sm text-muted-foreground">
                                sk_live_************************
                            </div>
                            <div className="text-xs text-muted-foreground">
                                (Hidden for security)
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
                         <div className="text-sm text-muted-foreground">
                            Need a new key? Revoking this key will disable all current applications.
                         </div>
                         <Button 
                            variant="destructive" 
                            onClick={() => {
                                if(confirm("Are you sure? This will stop all your running implementation.")) 
                                    revokeKeyMutation.mutate(key.id)
                            }}
                            disabled={revokeKeyMutation.isPending}
                        >
                            {revokeKeyMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Revoke Key
                         </Button>
                    </CardFooter>
                </Card>
            )}

            {/* View: No Key */}
            {!generatedKey && !key && (
                <Card>
                    <CardHeader>
                        <CardTitle>Generate API Key</CardTitle>
                        <CardDescription>You don't have an active API key.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="mb-4 text-sm text-muted-foreground">
                            Create a key to start using Mentrex tools. You are limited to 1 active key.
                         </p>
                         <Button onClick={() => generateKeyMutation.mutate()} disabled={generateKeyMutation.isPending}>
                            {generateKeyMutation.isPending && <Loader2 className="animate-spin mr-2" />}
                            Generate Secret Key
                         </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
