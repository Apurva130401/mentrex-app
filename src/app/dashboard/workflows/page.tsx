'use client'

import { Workflow, GitPullRequest, Zap, Bot } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function WorkflowsPage() {
    const [email, setEmail] = useState("")
    const [notified, setNotified] = useState(false)

    const handleNotify = (e: React.FormEvent) => {
        e.preventDefault()
        setNotified(true)
        // In a real app, we would save this to a database
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                <div className="relative p-6 rounded-2xl bg-neutral-900/50 border border-white/10 shadow-2xl">
                    <Workflow className="h-16 w-16 text-indigo-400" />
                </div>
            </div>

            <div className="space-y-4 max-w-lg">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
                    Mentrex <span className="text-indigo-400">Automations</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                    Automate your dev workflow visually. Connect AI reviews, tests, and deployments into powerful logic flows without writing a single script.
                </p>
                <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full text-xs font-medium inline-flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Coming Soon
                </div>
            </div>

            {!notified ? (
                <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
                    <input
                        type="email"
                        placeholder="Enter your email for early access"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2"
                    >
                        Notify Me <Zap className="h-4 w-4" />
                    </button>
                </form>
            ) : (
                <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-6 py-3 rounded-xl border border-indigo-500/20 animate-in fade-in slide-in-from-bottom-2">
                    <Workflow className="h-4 w-4" />
                    <span className="font-medium">You're on the list! Get ready to automate.</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 border-t border-white/5 w-full max-w-2xl">
                <FeatureCard icon={Bot} title="AI Agents" desc="Trigger AI reviews on PRs automatically" />
                <FeatureCard icon={GitPullRequest} title="CI/CD Logic" desc="Block merges based on AI scores" />
                <FeatureCard icon={Workflow} title="Visual Builder" desc="Drag & drop logic nodes" />
            </div>
        </div>
    )
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ElementType, title: string, desc: string }) {
    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center hover:bg-white/10 transition-colors">
            <Icon className="h-6 w-6 text-indigo-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
    )
}
