'use client'

import { Mail, MessageSquare, LifeBuoy } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SupportPage() {
    return (
        <div className="max-w-4xl mx-auto py-8 space-y-12">
            <div className="space-y-4 text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-neutral-900 border border-white/5">
                        <LifeBuoy className="h-10 w-10 text-white" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-white">How can we help?</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    We're here to help you get the most out of Mentrex.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <div className="relative group overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 p-8 transition-all hover:border-white/10 hover:bg-neutral-900/50">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="p-3 rounded-lg bg-white/5 text-white">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Email Support</h3>
                        <p className="text-muted-foreground">
                            For technical issues, billing questions, or general inquiries.
                        </p>
                        <Button
                            className="mt-4"
                            variant="outline"
                            onClick={() => window.location.href = "mailto:support@mentrex.shop"}
                        >
                            support@mentrex.shop
                        </Button>
                    </div>
                </div>

                <div className="relative group overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 p-8 transition-all hover:border-white/10 hover:bg-neutral-900/50">
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="p-3 rounded-lg bg-white/5 text-white">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Community</h3>
                        <p className="text-muted-foreground">
                            Join our Discord to chat with other developers and the team.
                        </p>
                        <Button className="mt-4" variant="outline" disabled>
                            Coming Soon
                        </Button>
                    </div>
                </div>
            </div>

            <div className="text-center pt-8 border-t border-white/5">
                <p className="text-sm text-muted-foreground">
                    Operating hours: Mon-Fri, 9AM - 6PM EST
                </p>
            </div>
        </div>
    )
}
