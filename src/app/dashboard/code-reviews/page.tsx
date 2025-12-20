
import { Metadata } from "next"
import CodeReviewsView from "./code-reviews-view"

export const metadata: Metadata = {
    title: "Code Reviews | Mentrex",
    description: "AI-powered code reviews",
}

export default function CodeReviewsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    Code Review AI
                    <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-full font-mono font-medium tracking-wide">
                        BETA
                    </span>
                </h1>
                <p className="text-muted-foreground">Automated PR analysis for security, performance, and style.</p>
            </div>

            <CodeReviewsView />
        </div>
    )
}
