import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">Mentrex Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Manage your account, credits, and API keys for the Mentrex Coding Agent.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Log In</Button>
          </Link>
          <Link href="https://mentrex.shop">
            <Button variant="outline" size="lg">Go to Website</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
