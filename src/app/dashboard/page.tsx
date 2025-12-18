'use client'

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
    const { data: creditData, isLoading } = useQuery<{ balance: number }>({
        queryKey: ['credits'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            const { data, error } = await supabase
                .from('user_credits')
                .select('balance')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') throw error
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const balance = (data as any)?.balance || 0
            return { balance }
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Current Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <div className="text-2xl font-bold">
                                ${((creditData?.balance || 0)).toFixed(2)}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Available credits for use
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
