import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"
import { Link as ChainIcon } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div className="fixed inset-0 -z-10">
        <img 
          src="/modern-apartment-living.png" 
          alt="Modern apartment living space" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/70" />
      </div>
      
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg overflow-hidden">
                <img 
                  src="/placeholder-logo.png" 
                  alt="Linkier Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Linkier</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex items-center space-x-4">
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Developer
                </Link>
              </nav>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="max-w-2xl mx-auto text-center space-y-8 px-4">
          {/* Logo */}
          <div className="w-64 h-32 mx-auto">
            <img 
              src="/placeholder-logo.png" 
              alt="Linkier Logo" 
              className="h-full w-full object-contain drop-shadow-lg"
            />
          </div>

          {/* Tagline */}
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">
            Find Your Perfect Match
          </h2>
          <p className="text-xl text-white/90 drop-shadow-md">
            Students find accommodation, landlords find tenants
          </p>

          {/* Buttons */}
          <div className="flex flex-col space-y-4 w-full max-w-xs mx-auto pt-8">
            <Button asChild size="lg" className="w-full bg-transparent hover:bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white shadow-lg hover:shadow-xl transition-all hover:border-white/60">
              <Link href="/student/signin">Sign in as Student</Link>
            </Button>
            <Button asChild size="lg" className="w-full bg-transparent hover:bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white shadow-lg hover:shadow-xl transition-all hover:border-white/60">
              <Link href="/landlord/signin">Sign in as Landlord</Link>
            </Button>
          </div>

          <div className="pt-8 text-sm text-white/90 drop-shadow-md">
            <p>Don't have an account?{' '}
              <Link href="/student/signup" className="text-blue-400 font-medium hover:underline hover:text-blue-300">Sign up as Student</Link>
              {' '}or{' '}
              <Link href="/landlord/signup" className="text-blue-400 font-medium hover:underline hover:text-blue-300">Landlord</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <span className="text-foreground font-semibold">Linkier</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Terms & Conditions
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Privacy Policy
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                Contact Developer
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}