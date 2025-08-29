"use client"

import { useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface AuthButtonProps {
  session?: any;
  onSignOut?: () => void;
}

export default function AuthButton({ session, onSignOut }: AuthButtonProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initials = (session?.user?.email || "U").slice(0, 2).toUpperCase()

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      setOpen(false)
      setEmail("")
      setPassword("")
    } catch (e: any) {
      setError(e.message || "Authentication failed")
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    if (onSignOut) {
      onSignOut()
    } else {
      await supabase.auth.signOut()
      // Redirect to landing page after sign out
      window.location.href = '/'
    }
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <Button variant="outline" onClick={signOut} disabled={loading}>
          {loading ? 'Signing out...' : 'Sign Out'}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Link href="/signup" passHref>
          <Button variant="outline">Sign Up</Button>
        </Link>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Sign In</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign In</DialogTitle>
              <DialogDescription>
                Enter your credentials to access your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              {error && (
                <div className="text-sm text-red-500">{error}</div>
              )}
              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <div className="text-center text-sm">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary underline">
                  Sign up
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
