import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
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
            <CardTitle className="text-3xl font-bold">Terms and Conditions – Linkier</CardTitle>
            <p className="text-sm font-medium text-muted-foreground">Effective Date: December 2024</p>
            <p className="text-sm text-muted-foreground">
              Welcome to Linkier! These Terms and Conditions ("Terms") explain how you can use our app. By creating an
              account or using Linkier, you agree to these Terms. If you don't agree, please don't use the app.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">1. Who Can Use Linkier</h3>
              <div className="space-y-2 text-sm">
                <p>You must be at least 16 years old to create an account.</p>
                <p>
                  Linkier is designed for students looking for boarding houses and landlords/property owners offering
                  student accommodation.
                </p>
                <p>All information you provide must be true and accurate.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">2. What Linkier Does</h3>
              <div className="space-y-2 text-sm">
                <p>Linkier is a platform that connects students and landlords.</p>
                <p>We are not a landlord, property agent, or property manager.</p>
                <p>
                  Any rental agreements, payments, or arrangements happen directly between the student and the landlord.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">3. What Users Must Do</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Students:</strong> Provide correct details and use the app respectfully.
                </p>
                <p>
                  <strong>Landlords:</strong> Make sure property listings are accurate, honest, and up-to-date.
                </p>
                <p>
                  <strong>All users:</strong> Use the app fairly and do not post anything false, harmful, or illegal.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">4. Things You Cannot Do</h3>
              <div className="text-sm">
                <p>Please don't:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Post fake or misleading property listings.</li>
                  <li>Harass or abuse other users.</li>
                  <li>Use Linkier for scams or fraud.</li>
                  <li>Try to hack or misuse the app.</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">5. Your Data</h3>
              <div className="space-y-2 text-sm">
                <p>
                  We collect basic information so the app can work (like your name, contact details, and property info).
                </p>
                <p>For more details, see our Privacy Policy.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">6. Payments & Disputes</h3>
              <div className="space-y-2 text-sm">
                <p>Linkier does not handle rent payments.</p>
                <p>Any payment or agreement is between the student and the landlord.</p>
                <p>If there's a dispute, it is the responsibility of the people involved, not Linkier.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">7. Our Responsibility</h3>
              <div className="space-y-2 text-sm">
                <p>We provide Linkier "as is" with no promises that everything will always be perfect.</p>
                <p>
                  We are not responsible for inaccurate listings, user behavior, or any loss/damage from rental
                  agreements.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">8. Ending Accounts</h3>
              <p className="text-sm">
                If someone breaks these Terms or misuses the app, we may suspend or close their account.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">9. Updates to These Terms</h3>
              <p className="text-sm">Sometimes we may update these Terms. If we do, we'll let you know in the app.</p>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Contact Us</h3>
              <p className="text-sm">If you have questions, please reach out at: support@linkier.com</p>
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
