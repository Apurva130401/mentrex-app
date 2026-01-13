'use client'

import { Workflow, Plus, GitBranch, Clock, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface WorkflowItem {
    id: string
    name: string
    description: string
    updated_at: string
    is_active: boolean
}

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<WorkflowItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()

    useEffect(() => {
        loadWorkflows()
    }, [])

    async function loadWorkflows() {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const { data, error } = await supabase
                .from('workflows')
                .select('*')
                .order('updated_at', { ascending: false })

            if (error) throw error
            setWorkflows(data || [])
        } catch (e) {
            console.error(e)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCreate() {
        const name = prompt("Enter workflow name:")
        if (!name) return

        setIsCreating(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                alert("Please log in first")
                return
            }

            const { data, error } = await supabase
                .from('workflows')
                .insert({
                    name,
                    description: "New automated workflow",
                    user_id: session.user.id,
                    nodes: [],
                    edges: []
                })
                .select()
                .single()

            if (error) throw error
            router.push(`/dashboard/workflows/${data.id}`)
        } catch (e) {
            console.error(e)
            alert("Failed to create workflow")
        } finally {
            setIsCreating(false)
        }
    }

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Automations</h1>
                    <p className="text-muted-foreground">Manage and monitor your automated workflows</p>
                </div>
                <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" />
                    {isCreating ? "Creating..." : "New Workflow"}
                </button>
            </div>

            {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 rounded-xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : workflows.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 border border-dashed border-white/10 rounded-xl bg-white/2">
                    <div className="p-4 rounded-full bg-indigo-500/10 mb-4">
                        <Workflow className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No Workflows Yet</h3>
                    <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                        Create your first automation workflow to streamline your development process.
                    </p>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        Create Workflow <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {workflows.map(workflow => (
                        <Link
                            key={workflow.id}
                            href={`/dashboard/workflows/${workflow.id}`}
                            className="group relative p-6 rounded-xl bg-card border border-white/5 hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowRight className="h-5 w-5 text-indigo-400 -rotate-45 group-hover:rotate-0 transition-transform" />
                            </div>
                            
                            <div className="mb-4">
                                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                    <GitBranch className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-1 truncate">{workflow.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{workflow.description}</p>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-4 border-t border-white/5">
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(workflow.updated_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className={cn("h-2 w-2 rounded-full", workflow.is_active ? "bg-emerald-500" : "bg-neutral-600")} />
                                    {workflow.is_active ? "Active" : "Draft"}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}
