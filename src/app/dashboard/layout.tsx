'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, CreditCard, Key, LogOut, BookOpen, ExternalLink, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

const sidebarItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
    { href: "/dashboard/keys", icon: Key, label: "API Keys" },
]

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
            }
            setLoading(false)
        }
        checkUser()
    }, [router])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const SidebarContent = () => (
        <div className="flex h-full flex-col font-sans">
            <div className="p-8 border-b border-border/40">
                <h2 className="text-2xl font-bold tracking-tight bg-linear-to-r from-white to-neutral-400 bg-clip-text text-transparent">Mentrex</h2>
            </div>
            <nav className="flex-1 p-6 space-y-2">
                {sidebarItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                            <span className={cn(
                                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-sm shadow-white/5"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}>
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </span>
                        </Link>
                    )
                })}

                <div className="pt-4 mt-4 border-t border-border/40">
                    <Link href="https://docs.mentrex.shop" target="_blank" rel="noopener noreferrer">
                        <span className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-muted/50 hover:text-foreground group">
                            <BookOpen className="h-4 w-4" />
                            Documentation
                            <ExternalLink className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </span>
                    </Link>
                </div>
            </nav>
            <div className="p-6 border-t border-border/40">
                <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg px-4 text-muted-foreground hover:text-foreground hover:bg-muted/50" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )

    if (loading) return <div className="flex h-screen items-center justify-center bg-background text-foreground">Loading...</div>

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar */}
            <aside className="w-72 border-r border-border/40 bg-card/30 hidden md:flex flex-col backdrop-blur-xl">
                <SidebarContent />
            </aside>

            {/* Mobile Header & Sidebar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-border/40 bg-background/80 px-6 py-4 backdrop-blur-md md:hidden">
                <span className="font-bold text-lg">Mentrex</span>
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-mr-4">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-72 p-0 bg-background border-r border-border/40">
                        <SheetTitle className="sr-only">Menu</SheetTitle>
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-20 md:pt-0">
                <div className="h-full p-8 md:p-12 max-w-7xl mx-auto space-y-10">
                    {children}
                </div>
            </main>
        </div>
    )
}
