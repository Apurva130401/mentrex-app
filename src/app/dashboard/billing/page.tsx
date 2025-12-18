'use client'

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface Payment {
    id: string
    created_at: string
    amount_cents: number
    credits: number
}

export default function BillingPage() {
    const { data: payments, isLoading } = useQuery<Payment[]>({
        queryKey: ['payments'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return []

            const { data } = await supabase
                .from('payment_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
            return (data as Payment[]) || []
        }
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Billing & Credits</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Top Up Options */}
                {[10, 50, 100].map((amount) => (
                    <Card key={amount}>
                        <CardHeader>
                            <CardTitle>${amount}</CardTitle>
                            <CardDescription>Add {amount} credits to your account</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full">Purchase</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Payment History</h2>
                <Card>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
                        ) : payments?.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">No payment history found</div>
                        ) : (
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm text-left">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Amount</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Credits</th>
                                            <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {payments?.map((payment) => (
                                            <tr key={payment.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">{new Date(payment.created_at).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle">${(payment.amount_cents / 100).toFixed(2)}</td>
                                                <td className="p-4 align-middle">{payment.credits}</td>
                                                <td className="p-4 align-middle">Paid</td>
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
