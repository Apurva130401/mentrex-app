'use client'

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Trash2 } from "lucide-react"
import { useState } from "react"

interface ApiKey {
    id: string
    name: string
    key_hash: string
    created_at: string
}

export default function KeysPage() {
    const queryClient = useQueryClient()
    const [newKeyName, setNewKeyName] = useState("")

    const { data: keys, isLoading } = useQuery<ApiKey[]>({
        queryKey: ['api_keys'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            // Fallback: This might fail if table doesn't exist, we will handle error gracefully in a real app
            const { data, error } = await supabase
                .from('api_keys')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.warn("Could not fetch keys (table might be missing)", error)
                return []
            }
            return (data as ApiKey[]) || []
        }
    })

    const createKey = useMutation({
        mutationFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            const key = `mk_${Math.random().toString(36).substring(2, 15)}_${Date.now()}` // Mock generation

            const { error } = await supabase
                .from('api_keys')
                .insert({ user_id: user.id, name: newKeyName || 'Untitled Key', key_hash: key }) // Storing raw for demo, usually hash

            if (error) throw error
        },
        onSuccess: () => {
            setNewKeyName("")
            queryClient.invalidateQueries({ queryKey: ['api_keys'] })
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Create New Key</CardTitle>
                    <CardDescription>Generate a new API key for your applications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4">
                        <Input
                            placeholder="Key Name (e.g. CI/CD)"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                        />
                        <Button onClick={() => createKey.mutate()} disabled={createKey.isPending}>
                            {createKey.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Key
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Active Keys</h2>
                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
                        ) : keys?.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No API keys found. Create one above.</div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b">
                                            <th className="h-12 px-4 font-medium text-muted-foreground">Name</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground">Key</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground">Created</th>
                                            <th className="h-12 px-4 font-medium text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {keys?.map((k) => (
                                            <tr key={k.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4">{k.name}</td>
                                                <td className="p-4 font-mono">mk_...{k.key_hash?.slice(-4)}</td>
                                                <td className="p-4">{new Date(k.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 text-right">
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
