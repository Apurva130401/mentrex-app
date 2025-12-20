
'use client'

import React, { useState, useEffect } from "react"
import { Loader2, Github, ArrowRight, CheckCircle2, AlertTriangle, FileCode, Check, ChevronDown, ChevronRight, XCircle, Info, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { parseDiff, DiffFile, DiffLine } from "@/lib/diff-parser"

type ViewState = 'loading' | 'connect' | 'repos' | 'prs' | 'analysis'

interface Repo {
    id: number
    name: string
    full_name: string
    private: boolean
    owner: string
    description: string
}

interface PR {
    number: number
    title: string
    user: { login: string; avatar_url: string }
    created_at: string
    url: string
}

interface AIReviewComment {
    file: string
    lineNumber: number
    type: 'critical' | 'warning' | 'suggestion' | 'commendation'
    message: string
    codeSuggestion?: string
}

export default function CodeReviewsView() {
    const [view, setView] = useState<ViewState>('loading')
    const [pat, setPat] = useState("")
    const [isConnecting, setIsConnecting] = useState(false)
    const [error, setError] = useState("")

    const [repos, setRepos] = useState<Repo[]>([])
    const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null)

    const [prs, setPrs] = useState<PR[]>([])
    const [selectedPR, setSelectedPR] = useState<PR | null>(null)

    const [aiComments, setAiComments] = useState<AIReviewComment[]>([])
    const [diffFiles, setDiffFiles] = useState<DiffFile[]>([])
    const [isAnalyzing, setIsAnalyzing] = useState(false)

    // Check connection on mount
    useEffect(() => {
        checkConnection()
    }, [])

    async function getAuthHeaders() {
        const { data: { session } } = await supabase.auth.getSession()
        return {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session?.access_token || ""}`
        }
    }

    async function checkConnection() {
        try {
            const headers = await getAuthHeaders()
            const res = await fetch("/api/github/repos", { headers })
            if (res.ok) {
                const data = await res.json()
                setRepos(data.repos)
                setView('repos')
            } else {
                setView('connect')
            }
        } catch (e) {
            setView('connect')
        }
    }

    async function handleConnect(e: React.FormEvent) {
        e.preventDefault()
        setIsConnecting(true)
        setError("")

        try {
            const headers = await getAuthHeaders()
            const res = await fetch("/api/github/connect", {
                method: "POST",
                headers,
                body: JSON.stringify({ pat })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to connect")
            }

            // Connection successful, fetch repos
            await checkConnection()

        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            setView('connect')
        } finally {
            setIsConnecting(false)
        }
    }

    async function handleSelectRepo(repo: Repo) {
        setSelectedRepo(repo)
        setView('loading')
        try {
            const headers = await getAuthHeaders()
            const res = await fetch(`/api/github/prs?owner=${repo.owner}&repo=${repo.name}`, { headers })
            const data = await res.json()
            if (res.ok) {
                setPrs(data.prs)
                setView('prs')
            } else {
                setError(data.error)
                setView('repos') // Fallback
            }
        } catch (e) {
            setError("Failed to fetch PRs")
            setView('repos')
        }
    }

    async function handleAnalyze(pr: PR) {
        if (!selectedRepo) return
        setSelectedPR(pr)
        setIsAnalyzing(true)
        setAiComments([])
        setDiffFiles([])

        try {
            const headers = await getAuthHeaders()
            const res = await fetch("/api/reviews/analyze", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    repoOwner: selectedRepo.owner,
                    repoName: selectedRepo.name,
                    prNumber: pr.number
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Parse Diff and Comments
            const comments = Array.isArray(data.result) ? data.result : []
            setAiComments(comments)

            if (data.diff) {
                const parsed = parseDiff(data.diff)
                setDiffFiles(parsed)
            }

            setView('analysis')

        } catch (e) {
            setError(e instanceof Error ? e.message : "Analysis failed")
        } finally {
            setIsAnalyzing(false)
        }
    }


    // Toast State
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    async function handlePublish() {
        if (!selectedRepo || !selectedPR || aiComments.length === 0) return

        setIsAnalyzing(true) // Reuse loading state for now
        try {
            const headers = await getAuthHeaders()
            const res = await fetch("/api/reviews/publish", {
                method: "POST",
                headers,
                body: JSON.stringify({
                    repoOwner: selectedRepo.owner,
                    repoName: selectedRepo.name,
                    prNumber: selectedPR.number,
                    comments: aiComments
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setToast({ message: "Review posted to GitHub successfully!", type: 'success' })

        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to publish")
            setToast({ message: "Failed to post review. Check logs.", type: 'error' })
        } finally {
            setIsAnalyzing(false)
        }
    }

    // Helper to render Toast
    const renderToast = () => {
        if (!toast) return null
        return (
            <div className="fixed top-24 right-8 z-50 animate-in slide-in-from-top-5 fade-in duration-300">
                <div className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl overflow-hidden relative",
                    toast.type === 'success' ? "bg-neutral-900 border-emerald-500/20 text-white" : "bg-neutral-900 border-red-500/20 text-white"
                )}>
                    {/* Progress Bar */}
                    <div className={cn(
                        "absolute bottom-0 left-0 h-0.5 bg-current opacity-50 animate-[progresstimer_3s_linear_forwards]",
                        toast.type === 'success' ? "text-emerald-500" : "text-red-500"
                    )} />

                    {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertTriangle className="h-5 w-5 text-red-500" />}
                    <span className="font-medium text-sm">{toast.message}</span>
                    <button onClick={() => setToast(null)} className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors">
                        <XCircle className="h-4 w-4 opacity-50" />
                    </button>
                </div>
            </div>
        )
    }

    if (view === 'loading') {
        return (
            <>
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-white/50" />
                </div>
                {renderToast()}
            </>
        )
    }

    if (view === 'connect') {
        return (
            <>
                <div className="max-w-md mx-auto mt-12 p-8 rounded-xl bg-neutral-900 border border-white/10">
                    <div className="flex items-center justify-center mb-6 text-white">
                        <Github className="h-10 w-10" />
                    </div>
                    <h2 className="text-xl font-bold text-center text-white mb-2">Connect GitHub</h2>
                    <p className="text-sm text-center text-muted-foreground mb-6">
                        Enter a Personal Access Token (PAT) with `repo` scope to allow AI to read your PRs.
                    </p>

                    <form onSubmit={handleConnect} className="space-y-4">
                        <div>
                            <input
                                type="password"
                                value={pat}
                                onChange={(e) => setPat(e.target.value)}
                                placeholder="ghp_..."
                                className="w-full bg-neutral-950 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                required
                            />
                        </div>
                        {error && <p className="text-xs text-red-500">{error}</p>}
                        <button
                            type="submit"
                            disabled={isConnecting}
                            className="w-full bg-white text-black font-semibold py-2 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
                        >
                            {isConnecting ? "Connecting..." : "Connect GitHub"}
                        </button>
                        <div className="text-center">
                            <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" className="text-xs text-emerald-400 hover:underline">
                                Generate a PAT here
                            </a>
                        </div>
                    </form>
                </div>
                {renderToast()}
            </>
        )
    }

    async function handleDisconnect() {
        if (!confirm("Are you sure you want to disconnect your GitHub account?")) return

        try {
            const headers = await getAuthHeaders()
            const res = await fetch("/api/github/disconnect", { method: "POST", headers })
            if (res.ok) {
                setRepos([])
                setPat("")
                setView('connect')
            }
        } catch (e) {
            console.error("Failed to disconnect", e)
        }
    }

    if (view === 'repos') {
        return (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <p className="text-sm text-muted-foreground">Select a repository to analyze</p>
                    <button
                        onClick={handleDisconnect}
                        className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    >
                        Disconnect GitHub
                    </button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {repos.map(repo => (
                        <button
                            key={repo.id}
                            onClick={() => handleSelectRepo(repo)}
                            className="text-left group p-4 rounded-xl bg-card border border-white/5 hover:border-white/20 transition-all hover:shadow-lg hover:shadow-emerald-900/10"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                    {repo.private ? "Private" : "Public"}
                                </span>
                                <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>
                            <h3 className="text-lg font-semibold text-white truncate">{repo.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{repo.full_name}</p>
                        </button>
                    ))}
                </div>
                {renderToast()}
            </div>
        )
    }

    if (view === 'prs') {
        return (
            <div>
                <button onClick={() => setView('repos')} className="text-sm text-muted-foreground hover:text-white mb-6 flex items-center gap-1">
                    ← Back to Repositories
                </button>
                <h2 className="text-xl font-semibold text-white mb-6">Open Pull Requests in <span className="text-emerald-400">{selectedRepo?.name}</span></h2>

                {prs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 rounded-xl bg-white/2">
                        <div className="p-4 rounded-full bg-neutral-900 mb-4">
                            <Github className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-white mb-2">No Open Pull Requests</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
                            This repository doesn't have any open pull requests to analyze. Create one to see the AI in action.
                        </p>
                        <a
                            href={`https://github.com/${selectedRepo?.full_name}/pulls`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                        >
                            <Github className="h-4 w-4" />
                            Go to Repository
                        </a>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {prs.map(pr => (
                            <div key={pr.number} className="flex items-center justify-between p-4 rounded-xl bg-card border border-white/5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <FileCode className="h-4 w-4 text-white/60" />
                                        <h3 className="text-base font-medium text-white">#{pr.number} {pr.title}</h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Opened by {pr.user.login}</p>
                                </div>
                                <button
                                    onClick={() => handleAnalyze(pr)}
                                    disabled={isAnalyzing}
                                    className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isAnalyzing && selectedPR?.number === pr.number ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                                    Analyze
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                {renderToast()}
            </div>
        )
    }

    if (view === 'analysis') {
        return (
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button onClick={() => setView('prs')} className="text-sm text-muted-foreground hover:text-white flex items-center gap-1">
                        ← Back
                    </button>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-white">#{selectedPR?.number} {selectedPR?.title}</h1>
                        <a href={selectedPR?.url} target="_blank" className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                            <Github className="h-5 w-5" />
                        </a>
                    </div>
                </div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-2">AI Review: #{selectedPR?.number} {selectedPR?.title}</h1>
                        <a href={selectedPR?.url} target="_blank" className="text-sm text-emerald-400 hover:underline flex items-center gap-1">
                            View on GitHub <ArrowRight className="h-3 w-3" />
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePublish}
                            disabled={isAnalyzing}
                            className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
                            Post to GitHub
                        </button>
                        <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium flex items-center gap-2">
                            <CheckCircle2 className="h-3 w-3" /> Review Complete
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {diffFiles.map((file, i) => (
                        <FileDiffViewer key={i} file={file} comments={aiComments} />
                    ))}
                    {diffFiles.length === 0 && (
                        <div className="p-12 text-center text-muted-foreground">
                            No viewable changes found in this PR.
                        </div>
                    )}
                </div>
                {renderToast()}
            </div>
        )
    }

    return null
}

function FileDiffViewer({ file, comments }: { file: DiffFile, comments: AIReviewComment[] }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    // Filter comments for this file
    // Note: AI might return "src/app/page.tsx", diff says "b/src/app/page.tsx" or "src/app/page.tsx"
    // We try loosely matching end of path
    const fileComments = comments.filter(c => file.file.endsWith(c.file) || c.file.endsWith(file.file))

    return (
        <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0d1117]">
            <div
                className="flex items-center justify-between px-4 py-3 bg-[#161b22] border-b border-white/10 cursor-pointer hover:bg-[#1f2937] transition-colors"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center gap-2 text-sm font-mono text-white/90">
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {file.file}
                </div>
                <div className="flex items-center gap-4">
                    {fileComments.length > 0 && (
                        <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                            {fileComments.length} Issues
                        </span>
                    )}
                </div>
            </div>

            {!isCollapsed && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed font-mono text-xs md:text-sm">
                        <tbody>
                            {file.lines.map((line, idx) => {
                                const lineComments = fileComments.filter(c => c.lineNumber === line.newLine)

                                return (
                                    <React.Fragment key={idx}>
                                        <tr className={cn(
                                            "hover:bg-white/5 transition-colors",
                                            line.type === 'add' && "bg-emerald-900/10",
                                            line.type === 'remove' && "bg-red-900/10",
                                            line.type === 'header' && "bg-[#161b22] text-white/50"
                                        )}>
                                            <td className="w-12 px-2 py-0.5 text-right select-none text-white/30 border-r border-white/10 bg-[#0d1117]">
                                                {line.oldLine || ""}
                                            </td>
                                            <td className="w-12 px-2 py-0.5 text-right select-none text-white/30 border-r border-white/10 bg-[#0d1117]">
                                                {line.newLine || ""}
                                            </td>
                                            <td className="w-6 px-2 py-0.5 text-center select-none text-white/30">
                                                {line.type === 'add' && '+'}
                                                {line.type === 'remove' && '-'}
                                            </td>
                                            <td className={cn(
                                                "px-2 py-0.5 whitespace-pre-wrap break-all text-white/80",
                                                line.type === 'add' && "text-emerald-100",
                                                line.type === 'remove' && "text-red-100 line-through opacity-70",
                                            )}>
                                                {line.content.substring(1)}
                                            </td>
                                        </tr>

                                        {/* Render Comments */}
                                        {lineComments.length > 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-2 bg-[#1c2128] border-y border-white/5">
                                                    <div className="space-y-3 pl-12">
                                                        {lineComments.map((comment, i) => (
                                                            <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-top-2">
                                                                <div className="mt-0.5">
                                                                    {comment.type === 'critical' && <XCircle className="h-4 w-4 text-red-400" />}
                                                                    {comment.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-400" />}
                                                                    {comment.type === 'suggestion' && <Info className="h-4 w-4 text-blue-400" />}
                                                                    {comment.type === 'commendation' && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <p className="text-sm text-white/90 font-medium">
                                                                        {comment.message}
                                                                    </p>
                                                                    {comment.codeSuggestion && (
                                                                        <div className="mt-2 p-2 rounded bg-black/30 border border-white/10 font-mono text-xs text-white/70">
                                                                            {comment.codeSuggestion}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
