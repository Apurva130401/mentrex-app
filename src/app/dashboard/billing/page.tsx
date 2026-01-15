'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Key, Info, ShieldCheck } from "lucide-react"

export default function BillingPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-semibold tracking-tight text-white">Billing & Usage</h1>
                <p className="text-neutral-400">Manage your subscription and credits.</p>
            </div>

            <div className="grid gap-6">
                <Card className="bg-neutral-900 border border-white/10 shadow-2xl overflow-hidden relative group">
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <CardHeader className="relative z-10 pb-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">

                                <div>
                                    <CardTitle className="text-xl font-medium text-white mb-1">Mentrex Free Tier</CardTitle>
                                    <p className="text-sm text-neutral-400 font-medium">Early Access Program</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                                    Active
                                </span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="relative z-10 p-8 space-y-8">
                        <div className="space-y-4">
                            <p className="text-neutral-300 text-base leading-relaxed max-w-3xl">
                                You are currently using the public beta version of Mentrex. This tier provides complete access to all platform features without any subscription fees.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-neutral-950 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-neutral-900 text-white border border-white/10">
                                        <Key className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white mb-2">Bring Your Own Keys</h3>
                                        <p className="text-sm text-neutral-400 leading-relaxed">
                                            Usage is controlled entirely by you. Simply plug in your API keys for the models you wish to use. We do not charge for model usage.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-neutral-950 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 rounded-lg bg-neutral-900 text-white border border-white/10">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-white mb-2">Future Billing</h3>
                                        <p className="text-sm text-neutral-400 leading-relaxed">
                                            Native billing features, including credit purchases and usage analytics, will be available in upcoming releases.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
