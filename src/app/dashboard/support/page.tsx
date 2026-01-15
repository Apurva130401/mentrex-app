'use client'

import { Mail, MessageSquare, LifeBuoy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useChat } from "@/components/chat-context"
import { TicketList } from "@/components/ticket-list"

export default function SupportPage() {
    const { openChat } = useChat()

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

            <div className="grid gap-6 md:grid-cols-3">
                {/* Email Support */}
                <div className="relative group overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 p-6 transition-all hover:border-white/10 hover:bg-neutral-900/50">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="p-3 rounded-lg bg-white/5 text-white">
                            <Mail className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Email Support</h3>
                        <p className="text-sm text-neutral-400">
                            For technical issues, billing questions, or general inquiries.
                        </p>
                        <Button
                            className="mt-auto w-full"
                            variant="outline"
                            onClick={() => window.location.href = "mailto:support@mentrex.shop"}
                        >
                            support@mentrex.shop
                        </Button>
                    </div>
                </div>

                {/* Chat with Eva */}
                <div className="relative group overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 p-6 transition-all hover:border-white/10 hover:bg-neutral-900/50">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">Chat with Eva</h3>
                        <p className="text-sm text-neutral-400">
                            Get instant answers to your questions from our AI assistant.
                        </p>
                        <Button
                            className="mt-auto w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                            onClick={openChat}
                        >
                            Open Chat
                        </Button>
                    </div>
                </div>

                {/* Discord Community */}
                <div className="relative group overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 p-6 transition-all hover:border-white/10 hover:bg-neutral-900/50">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" /></svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white">Discord Community</h3>
                        <p className="text-sm text-neutral-400">
                            Join our Discord to chat with other developers and the team.
                        </p>
                        <Button
                            className="mt-auto w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10"
                            onClick={() => window.open("https://discord.gg/yq5sUumr", "_blank")}
                        >
                            Join Discord
                        </Button>
                    </div>
                </div>

                {/* GitHub Issues */}
                <div className="relative group overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 p-6 transition-all hover:border-white/10 hover:bg-neutral-900/50">
                    <div className="absolute inset-0 bg-linear-to-br from-neutral-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                        <div className="p-3 rounded-lg bg-white/10 text-white">
                            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        </div>
                        <h3 className="text-xl font-semibold text-white">GitHub Issues</h3>
                        <p className="text-sm text-neutral-400">
                            Want to raise an issue? Report it on our GitHub Issues page.
                        </p>
                        <Button
                            className="mt-auto w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10"
                            onClick={() => window.open("https://github.com/mentrexai/mentrex-issues/issues", "_blank")}
                        >
                            Open Issue
                        </Button>
                    </div>
                </div>
            </div>

            <TicketList />

            <div className="text-center pt-8 border-t border-white/5">
                <p className="text-sm text-muted-foreground">
                    Operating hours: Mon-Fri, 9AM - 6PM EST
                </p>
            </div>
        </div>
    )
}
