'use client'

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Loader2, Coins, ArrowUpRight, Zap, Shield, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

function getGreeting() {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
}

export default function DashboardPage() {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboard-data'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error("No user")

            const { data, error } = await supabase
                .from('user_credits')
                .select('balance')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') throw error
            const balance = (data as { balance: number } | null)?.balance || 0

            return {
                user,
                balance
            }
        }
    })

    const greeting = getGreeting()
    const userName = dashboardData?.user?.user_metadata?.full_name ||
        dashboardData?.user?.user_metadata?.name ||
        dashboardData?.user?.email?.split('@')[0] ||
        "there"

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                <div className="space-y-2">
                    <p className="text-muted-foreground font-medium tracking-wide uppercase text-sm">Overview</p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                        {greeting}, <br />
                        <span className="text-white/60">{userName}</span>
                    </h1>
                </div>

                {/* Premium Credits Card */}
                <div className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 p-6 transition-all hover:border-white/20 hover:shadow-2xl hover:shadow-neutral-900/50 min-w-[300px]">
                    <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10 flex flex-col justify-between h-full gap-6">
                        <div className="flex items-center justify-between">
                            <div className="p-2 rounded-lg bg-white/5 text-white/80">
                                <Coins className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">Active</span>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Available Credits</p>
                            {isLoading ? (
                                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                            ) : (
                                <div className="text-4xl font-mono font-bold tracking-tighter text-white">
                                    {dashboardData?.balance?.toFixed(2) || "0.00"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-white/70" />
                    Quick Actions
                </h3>
                <div className="grid gap-6 md:grid-cols-3">
                    {[
                        { title: "Manage Keys", description: "Create and revoke API keys", icon: Shield, href: "/dashboard/keys" },
                        { title: "Billing", description: "View invoices and usage", icon: CreditCard, href: "/dashboard/billing" },
                        { title: "Documentation", description: "Read the integration guides", icon: ArrowUpRight, href: "https://docs.mentrex.shop", external: true },
                    ].map((action, i) => (
                        <a
                            key={i}
                            href={action.href}
                            target={action.external ? "_blank" : undefined}
                            rel={action.external ? "noopener noreferrer" : undefined}
                            className="group relative p-6 rounded-xl bg-card border border-white/5 transition-all hover:bg-white/2 hover:border-white/10"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2 rounded-lg bg-neutral-900/50 text-white/70 group-hover:text-white group-hover:bg-neutral-900 transition-colors">
                                    <action.icon className="h-5 w-5" />
                                </div>
                                {action.external && <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors" />}
                            </div>
                            <h4 className="text-base font-semibold text-white mb-1 group-hover:text-white/90">{action.title}</h4>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}
