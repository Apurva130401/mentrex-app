'use client'

import { Workflow } from "lucide-react"

export default function WorkflowsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
            <div className="p-4 rounded-full bg-indigo-500/10 mb-6 relative group">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Workflow className="h-12 w-12 text-indigo-400 relative z-10" />
            </div>

            <h1 className="text-3xl font-bold text-white mb-3">Workflows Coming Soon</h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
                We're building a powerful visual automation builder to help you streamline your development process.
            </p>

            <div className="flex items-center gap-2 text-sm text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-4 py-2 rounded-full">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Under active development
            </div>
        </div>
    )
}
