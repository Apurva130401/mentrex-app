'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Save, Loader2, Lock } from "lucide-react"

export default function AdminPage() {
    const [isDev, setIsDev] = useState(true)

    useEffect(() => {
        // Simple client-side check to hide UI in production
        // For stricter security, this should be done in Middleware, 
        // but this effectively "hides" it as requested.
        if (process.env.NODE_ENV === 'production') {
            setIsDev(false)
        }
    }, [])

    if (!isDev) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="p-4 rounded-full bg-red-500/10 text-red-500">
                    <Lock className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold">Restricted Area</h1>
                <p className="text-muted-foreground">This page is only available in local development environment.</p>
            </div>
        )
    }

    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)

    const handleTrain = async () => {
        if (!text.trim()) return

        setLoading(true)
        try {
            const res = await fetch('/api/train', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            })
            const data = await res.json()
            if (data.error) throw new Error(data.error)

            alert("Brain updated! I now know this.")
            setText("")
        } catch (error: any) {
            alert("Training failed: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    <Bot className="h-8 w-8 text-indigo-500" />
                    Agent Training
                </h2>
                <p className="text-muted-foreground mt-2">Feed raw text into the knowledge base.</p>
            </div>

            <Card className="bg-black/40 border-indigo-500/20 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle>Knowledge Upload</CardTitle>
                    <CardDescription>Paste documentation, FAQs, or any text you want the AI to know.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Paste text here..."
                        className="w-full h-64 bg-neutral-900/50 border border-white/10 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end">
                        <Button
                            onClick={handleTrain}
                            disabled={loading || !text.trim()}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Update Brain
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
