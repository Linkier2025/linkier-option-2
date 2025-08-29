"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { MoreHorizontal, Mail, Info, HelpCircle, Shield, FileText, Star, Bug } from "lucide-react"

export default function MoreMenu() {
  const [showAbout, setShowAbout] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showTerms, setShowTerms] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4 mr-2" />
            More
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem className="flex items-center justify-between">
            <span className="flex items-center">
              <span className="mr-2">🌙</span>
              Theme
            </span>
            <ThemeToggle />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowAbout(true)}>
            <Info className="w-4 h-4 mr-2" />
            About Linkier
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowContact(true)}>
            <Mail className="w-4 h-4 mr-2" />
            Contact Developer
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <HelpCircle className="w-4 h-4 mr-2" />
            Help & Support
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowPrivacy(true)}>
            <Shield className="w-4 h-4 mr-2" />
            Privacy Policy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowTerms(true)}>
            <FileText className="w-4 h-4 mr-2" />
            Terms of Service
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Star className="w-4 h-4 mr-2" />
            Rate Linkier
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bug className="w-4 h-4 mr-2" />
            Report Bug
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* About Dialog */}
      <Dialog open={showAbout} onOpenChange={setShowAbout}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              About Linkier
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>
                <strong>Linkier v1.0</strong>
              </p>
              <p>
                Linkier is a modern student-landlord matching platform designed to connect university students with
                quality accommodation and trusted landlords.
              </p>
              <p>
                Our mission is to make finding student accommodation simple, safe, and transparent for everyone
                involved.
              </p>
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">Built with ❤️ for students and landlords</p>
                <p className="text-sm text-muted-foreground">© 2024 Linkier. All rights reserved.</p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Contact Developer Dialog */}
      <Dialog open={showContact} onOpenChange={setShowContact}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Developer</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>Have questions, suggestions, or need technical support? We'd love to hear from you!</p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@linkier.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Bug className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Bug Reports</p>
                    <p className="text-sm text-muted-foreground">bugs@linkier.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Star className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Feature Requests</p>
                    <p className="text-sm text-muted-foreground">features@linkier.com</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                We typically respond within 24 hours during business days.
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Privacy Policy – Linkier</DialogTitle>
            <DialogDescription className="space-y-4 pt-4 text-left">
              <p className="text-sm font-medium">Effective Date: December 2024</p>
              <p className="text-sm">
                This Privacy Policy explains how we handle your information when you use Linkier.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Information We Collect</h4>
                  <div className="text-sm space-y-2">
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
                  <h4 className="font-semibold mb-2">2. How We Use Your Information</h4>
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
                  <h4 className="font-semibold mb-2">3. Sharing of Information</h4>
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>With other users:</strong> Students may see property details, landlords may see student
                      interest.
                    </p>
                    <p>
                      <strong>With services we use to run the app:</strong> (like hosting, analytics, or cloud
                      services).
                    </p>
                    <p>We do not sell or rent your personal data.</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">4. Data Security</h4>
                  <p className="text-sm">
                    We take reasonable steps to keep your data safe, but no system is 100% secure.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">5. Your Choices</h4>
                  <div className="text-sm">
                    <p>You can:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Update or correct your profile details.</li>
                      <li>Ask us to delete your account and information (unless we need it for running the app).</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">6. Data Retention</h4>
                  <p className="text-sm">
                    We only keep your data as long as your account is active or as needed to run the app.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">7. Changes to This Policy</h4>
                  <p className="text-sm">If we make changes, we'll update this document and let you know in the app.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Contact Us</h4>
                  <p className="text-sm">If you have any questions, contact us at: support@linkier.com</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Terms of Service Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms and Conditions – Linkier</DialogTitle>
            <DialogDescription className="space-y-4 pt-4 text-left">
              <p className="text-sm font-medium">Effective Date: December 2024</p>
              <p className="text-sm">
                Welcome to Linkier! These Terms and Conditions ("Terms") explain how you can use our app. By creating an
                account or using Linkier, you agree to these Terms. If you don't agree, please don't use the app.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Who Can Use Linkier</h4>
                  <div className="text-sm space-y-2">
                    <p>You must be at least 16 years old to create an account.</p>
                    <p>
                      Linkier is designed for students looking for boarding houses and landlords/property owners
                      offering student accommodation.
                    </p>
                    <p>All information you provide must be true and accurate.</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. What Linkier Does</h4>
                  <div className="text-sm space-y-2">
                    <p>Linkier is a platform that connects students and landlords.</p>
                    <p>We are not a landlord, property agent, or property manager.</p>
                    <p>
                      Any rental agreements, payments, or arrangements happen directly between the student and the
                      landlord.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. What Users Must Do</h4>
                  <div className="text-sm space-y-2">
                    <p>
                      <strong>Students:</strong> Provide correct details and use the app respectfully.
                    </p>
                    <p>
                      <strong>Landlords:</strong> Make sure property listings are accurate, honest, and up-to-date.
                    </p>
                    <p>
                      <strong>All users:</strong> Use the app fairly and do not post anything false, harmful, or
                      illegal.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">4. Things You Cannot Do</h4>
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
                  <h4 className="font-semibold mb-2">5. Your Data</h4>
                  <div className="text-sm space-y-2">
                    <p>
                      We collect basic information so the app can work (like your name, contact details, and property
                      info).
                    </p>
                    <p>For more details, see our Privacy Policy.</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">6. Payments & Disputes</h4>
                  <div className="text-sm space-y-2">
                    <p>Linkier does not handle rent payments.</p>
                    <p>Any payment or agreement is between the student and the landlord.</p>
                    <p>If there's a dispute, it is the responsibility of the people involved, not Linkier.</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">7. Our Responsibility</h4>
                  <div className="text-sm space-y-2">
                    <p>We provide Linkier "as is" with no promises that everything will always be perfect.</p>
                    <p>
                      We are not responsible for inaccurate listings, user behavior, or any loss/damage from rental
                      agreements.
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">8. Ending Accounts</h4>
                  <p className="text-sm">
                    If someone breaks these Terms or misuses the app, we may suspend or close their account.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">9. Updates to These Terms</h4>
                  <p className="text-sm">
                    Sometimes we may update these Terms. If we do, we'll let you know in the app.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Contact Us</h4>
                  <p className="text-sm">If you have questions, please reach out at: support@linkier.com</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
