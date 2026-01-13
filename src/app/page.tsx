"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white selection:bg-neutral-800">
      {/* Background Gradients/Orbs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-neutral-900/40 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-neutral-800/20 blur-[100px]" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 max-w-2xl px-4 text-center space-y-8"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-400 border border-neutral-800">
              v2.0 Dashboard
            </span>
          </motion.div>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500">
            Mentrex <br />
            <span className="text-white">Dashboard</span>
          </h1>

          <p className="mx-auto max-w-lg text-lg text-neutral-400">
            Monitor usage, manage API keys, and track your credits with the all-new Mentrex Coding Agent dashboard.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full min-w-[160px] bg-white text-black hover:bg-neutral-200 transaction-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] font-semibold">
              Log In
            </Button>
          </Link>
          <Link href="https://mentrex.shop" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full min-w-[160px] border-neutral-800 bg-black/50 hover:bg-neutral-900 text-neutral-300 hover:text-white backdrop-blur-sm">
              Visit Website
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* Footer minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 text-sm text-neutral-600"
      >
        © 2026 Mentrex. All rights reserved.
      </motion.div>
    </div>
  )
}
