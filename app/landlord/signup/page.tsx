"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

export default function LandlordSignUp() {
  const supabase = createClientComponentClient()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    company: "",
    agreeToTerms: false,
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    strength = Object.values(checks).filter(Boolean).length
    return { strength, checks }
  }

  const passwordAnalysis = getPasswordStrength(formData.password)
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"]
  const strengthColors = ["text-red-500", "text-orange-500", "text-yellow-500", "text-blue-500", "text-green-500"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Validation
    if (!formData.firstName || !formData.surname || !formData.email || !formData.password) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms and Conditions")
      setIsLoading(false)
      return
    }

    // Sign up with Supabase
    const { error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          surname: formData.surname,
          full_name: `${formData.firstName} ${formData.surname}`.trim(),
          role: "landlord",
          phone: formData.phone,
          company: formData.company,
        },
        emailRedirectTo: `${window.location.origin}/landlord/signin`,
      },
    })

    if (signUpError) {
      setError(signUpError.message || "Failed to create account")
      setIsLoading(false)
      return
    }

    // If email confirmations are enabled, user must verify email first
    window.location.href = "/landlord/signin?checkEmail=1"
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
          <CardHeader className="text-center pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-primary-foreground font-bold text-2xl">L</span>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Landlord Sign Up
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Create your account to start connecting with student tenants.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname" className="text-sm font-medium">
                    Surname *
                  </Label>
                  <Input
                    id="surname"
                    placeholder="Doe"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+27 12 345 6789"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="Your company name"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, agreeToTerms: checked as boolean })}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms and Conditions
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all duration-200 text-base font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center pt-4 border-t border-border/50">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/landlord/signin"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
