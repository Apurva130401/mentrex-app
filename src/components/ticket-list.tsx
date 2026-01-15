'use client'

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Ticket {
    id: string
    message: string
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
    created_at: string
}

export function TicketList() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchTickets() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data } = await supabase
                    .from('tickets')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })

                if (data) setTickets(data)
            } catch (error) {
                console.error("Error fetching tickets:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTickets()
    }, [])

    if (isLoading) {
        return <div className="text-center text-muted-foreground text-sm py-4">Loading tickets...</div>
    }

    if (tickets.length === 0) {
        return null // Don't show anything if no tickets
    }

    return (
        <div className="w-full space-y-4">
            <h2 className="text-xl font-semibold text-white">My Support Tickets</h2>
            <div className="grid gap-4">
                {tickets.map((ticket) => (
                    <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-neutral-900 border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-muted-foreground">
                                    #{ticket.id.slice(0, 8)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    • {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-white font-medium line-clamp-1">
                                {ticket.message}
                            </p>
                        </div>
                        <div>
                            <StatusBadge status={ticket.status} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: Ticket['status'] }) {
    if (status === 'RESOLVED') {
        return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Resolved
            </span>
        )
    }
    if (status === 'IN_PROGRESS') {
        return (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium border border-blue-500/20">
                <Clock className="h-3.5 w-3.5" />
                In Progress
            </span>
        )
    }
    return (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20">
            <AlertCircle className="h-3.5 w-3.5" />
            Open
        </span>
    )
}
