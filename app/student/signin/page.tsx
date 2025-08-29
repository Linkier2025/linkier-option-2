"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react"
import { useSearchParams } from "next/navigation"

export default function StudentSignIn() {
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Check for signup success in URL
    if (searchParams.get('signup') === 'success') {
      setShowSuccess(true)
      // Clear the URL without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields")
      setIsLoading(false)
      return
    }

    try {
      // Sign in with Supabase
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (signInError) throw signInError
      if (!signInData.user) throw new Error('No user returned from sign in')

      // Get user's role from their profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', signInData.user.id)
        .single()

      if (profileError) throw profileError
      
      // Verify the user is a student
      if (profileData.role !== 'student') {
        // Sign out the user if they're not a student
        await supabase.auth.signOut()
        throw new Error('Please use the landlord portal to sign in')
      }

      // Success: redirect to dashboard with full reload
      window.location.href = "/student/dashboard"
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to sign in')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to home */}
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <Card className="backdrop-blur-sm bg-card/95 shadow-2xl border-0 ring-1 ring-border/50">
          <CardHeader className="text-center pb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl">L</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Student Sign In
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Welcome back! Sign in to find your perfect accommodation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {showSuccess && (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Account created successfully! Please sign in with your credentials.
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 pr-12"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-4 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/student/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/student/signup"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign up as Student
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
