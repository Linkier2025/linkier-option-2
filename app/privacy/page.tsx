import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back navigation */}
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Privacy Policy – Linkier</CardTitle>
            <p className="text-sm font-medium text-muted-foreground">Effective Date: December 2024</p>
            <p className="text-sm text-muted-foreground">
              This Privacy Policy explains how we handle your information when you use Linkier.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">1. Information We Collect</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Students:</strong> name, email, contact details, and basic profile information.
                </p>
                <p>
                  <strong>Landlords:</strong> property details (location, price, features) and contact information.
                </p>
                <p>
                  <strong>App Usage:</strong> when you log in, view properties, or interact with the app.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
              <div className="text-sm">
                <p>We use your data to:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Create and manage your account.</li>
                  <li>Show property listings and connect students with landlords.</li>
                  <li>Improve the app and fix problems.</li>
                  <li>Send updates or notifications when needed.</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3. Sharing of Information</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>With other users:</strong> Students may see property details, landlords may see student
                  interest.
                </p>
                <p>
                  <strong>With services we use to run the app:</strong> (like hosting, analytics, or cloud services).
                </p>
                <p>We do not sell or rent your personal data.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">4. Data Security</h3>
              <p className="text-sm">We take reasonable steps to keep your data safe, but no system is 100% secure.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">5. Your Choices</h3>
              <div className="text-sm">
                <p>You can:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Update or correct your profile details.</li>
                  <li>Ask us to delete your account and information (unless we need it for running the app).</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">6. Data Retention</h3>
              <p className="text-sm">
                We only keep your data as long as your account is active or as needed to run the app.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">7. Changes to This Policy</h3>
              <p className="text-sm">If we make changes, we'll update this document and let you know in the app.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
              <p className="text-sm">If you have any questions, contact us at: support@linkier.com</p>
            </div>

            <div className="pt-6 border-t">
              <Button asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
