'use client'

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react"
import { useChat } from "@/components/chat-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import { usePathname } from "next/navigation"
import ReactMarkdown from "react-markdown"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
    role: "user" | "assistant"
    content: string
}

export function DashboardChatbot() {
    const { isOpen, toggleChat, closeChat } = useChat()
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm Eva. How can I help you today?" }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const pathname = usePathname()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isLoading) return

        const userMessage: Message = { role: "user", content: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    context: {
                        currentPage: pathname,
                        userId: user?.id
                    }
                })
            })

            const data = await response.json()
            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, { role: "assistant", content: data.content }])
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting right now." }])
        } finally {
            setIsLoading(false)
        }
    }

    const [isLabelVisible, setIsLabelVisible] = useState(true)

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-[350px] sm:w-[400px] h-[500px] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white text-sm">Eva</h3>
                                    <span className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Online
                                    </span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={closeChat}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex w-max max-w-[80%]",
                                        message.role === "user" ? "ml-auto" : "mr-auto"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "p-3 rounded-2xl text-sm leading-relaxed",
                                            message.role === "user"
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white/10 text-white/90 rounded-bl-none"
                                        )}
                                    >
                                        {message.role === 'assistant' ? (
                                            <ReactMarkdown
                                                components={{
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    strong: ({ node, ...props }: any) => <span className="font-bold text-white" {...props} />,
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    ul: ({ node, ...props }: any) => <ul className="list-disc pl-4 space-y-1 mt-1" {...props} />,
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    li: ({ node, ...props }: any) => <li className="pl-1" {...props} />
                                                }}
                                            >
                                                {message.content}
                                            </ReactMarkdown>
                                        ) : (
                                            message.content
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex w-max mr-auto">
                                    <div className="p-3 rounded-2xl bg-white/5 rounded-bl-none">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/5 bg-white/2">
                            <form onSubmit={handleSubmit} className="relative">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask Eva..."
                                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-muted-foreground"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={isLoading || !input.trim()}
                                    className="absolute right-1.5 top-1.5 h-8 w-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex items-center gap-4">
                <AnimatePresence>
                    {isLabelVisible && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white text-neutral-950 font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                        >
                            Talk to Eva
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsLabelVisible(false)
                                }}
                                className="ml-1 p-0.5 hover:bg-neutral-200 rounded-full transition-colors"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        toggleChat()
                        if (!isOpen) setIsLabelVisible(false)
                    }}
                    className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 flex items-center justify-center transition-colors border border-white/10"
                >
                    {isOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <MessageCircle className="h-6 w-6" />
                    )}
                </motion.button>
            </div>
        </div>
    )
}
