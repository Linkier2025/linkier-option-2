"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"

export default function StudentSignUp() {
  const supabase = createClientComponentClient()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    surname: "",
    gender: "",
    university: "",
    yearOfStudy: "",
    faculty: "",
    department: "",
    program: "",
    studentId: "",
    enrollmentStatus: "full-time",
    expectedGraduation: "",
    email: "",
    phone: "",
    password: "",
    agreeToTerms: false,
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: ""
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
    const requiredFields = [
      { field: 'firstName', label: 'First Name' },
      { field: 'surname', label: 'Surname' },
      { field: 'email', label: 'Email' },
      { field: 'password', label: 'Password' },
      { field: 'university', label: 'University' },
      { field: 'yearOfStudy', label: 'Year of Study' },
      { field: 'faculty', label: 'Faculty' },
      { field: 'department', label: 'Department' },
      { field: 'program', label: 'Program' },
      { field: 'studentId', label: 'Student ID' },
      { field: 'enrollmentStatus', label: 'Enrollment Status' },
      { field: 'expectedGraduation', label: 'Expected Graduation' },
      { field: 'emergencyContactName', label: 'Emergency Contact Name' },
      { field: 'emergencyContactPhone', label: 'Emergency Contact Phone' },
      { field: 'emergencyContactRelationship', label: 'Emergency Contact Relationship' }
    ]

    const missingField = requiredFields.find(field => !formData[field.field as keyof typeof formData])
    if (missingField) {
      setError(`Please fill in the ${missingField.label} field`)
      setIsLoading(false)
      return
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms and Conditions")
      setIsLoading(false)
      return
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[+]?[0-9\s-]{10,20}$/
    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid phone number")
      setIsLoading(false)
      return
    }

    if (!phoneRegex.test(formData.emergencyContactPhone)) {
      setError("Please enter a valid emergency contact phone number")
      setIsLoading(false)
      return
    }

    // Sign up with Supabase
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          surname: formData.surname,
          full_name: `${formData.firstName} ${formData.surname}`.trim(),
          role: "student",
          university: formData.university,
          year_of_study: formData.yearOfStudy,
          faculty: formData.faculty,
          department: formData.department,
          program: formData.program,
          student_id: formData.studentId,
          enrollment_status: formData.enrollmentStatus,
          expected_graduation: formData.expectedGraduation,
          phone: formData.phone,
          gender: formData.gender,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    // If signup is successful, update the user with emergency contact info
    if (authData?.user?.id) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          emergency_contact_name: formData.emergencyContactName,
          emergency_contact_phone: formData.emergencyContactPhone,
          emergency_contact_relationship: formData.emergencyContactRelationship,
          updated_at: new Date().toISOString()
        })
        .eq('id', authData.user.id)

      if (updateError) {
        console.error('Error updating emergency contact info:', updateError)
        // Don't fail the signup if emergency contact update fails
      }
    }

    if (signUpError) {
      setError(signUpError.message || "Failed to create account")
      setIsLoading(false)
      return
    }

    // Redirect to landing page after signup
    window.location.href = "/"
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
              Student Sign Up
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Create your account to start finding accommodation.
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
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Select
                  value={formData.university}
                  onValueChange={(value) => setFormData({ ...formData, university: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university-of-zimbabwe">University of Zimbabwe (UZ)</SelectItem>
                    <SelectItem value="national-university-of-science-and-technology">National University of Science and Technology (NUST)</SelectItem>
                    <SelectItem value="midlands-state-university">Midlands State University (MSU)</SelectItem>
                    <SelectItem value="great-zimbabwe-university">Great Zimbabwe University (GZU)</SelectItem>
                    <SelectItem value="zimbabwe-open-university">Zimbabwe Open University (ZOU)</SelectItem>
                    <SelectItem value="chinhoyi-university-of-technology">Chinhoyi University of Technology (CUT)</SelectItem>
                    <SelectItem value="bindura-university-of-science-education">Bindura University of Science Education (BUSE)</SelectItem>
                    <SelectItem value="lupane-state-university">Lupane State University (LSU)</SelectItem>
                    <SelectItem value="harare-institute-of-technology">Harare Institute of Technology (HIT)</SelectItem>
                    <SelectItem value="catholic-university-in-zimbabwe">Catholic University in Zimbabwe (CUZ)</SelectItem>
                    <SelectItem value="zimbabwe-ezekiel-guti-university">Zimbabwe Ezekiel Guti University (ZEGU)</SelectItem>
                    <SelectItem value="womens-university-in-africa">Women's University in Africa (WUA)</SelectItem>
                    <SelectItem value="solusi-university">Solusi University</SelectItem>
                    <SelectItem value="africa-university">Africa University</SelectItem>
                    <SelectItem value="zimbabwe-national-defence-university">Zimbabwe National Defence University (ZNDU)</SelectItem>
                    <SelectItem value="manicaland-state-university-of-applied-sciences">Manicaland State University of Applied Sciences (MSUAS)</SelectItem>
                    <SelectItem value="gwanda-state-university">Gwanda State University (GSU)</SelectItem>
                    <SelectItem value="marondera-university-of-agricultural-sciences-and-technology">Marondera University of Agricultural Sciences and Technology (MUAST)</SelectItem>
                    <SelectItem value="arrupe-jesuit-university">Arrupe Jesuit University</SelectItem>
                    <SelectItem value="reformed-church-university">Reformed Church University (RCU)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearOfStudy">Year of Study *</Label>
                <Select
                  value={formData.yearOfStudy}
                  onValueChange={(value) => setFormData({ ...formData, yearOfStudy: value })}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st-year">1st Year</SelectItem>
                    <SelectItem value="2nd-year">2nd Year</SelectItem>
                    <SelectItem value="3rd-year">3rd Year</SelectItem>
                    <SelectItem value="4th-year">4th Year</SelectItem>
                    <SelectItem value="5th-year">5th Year</SelectItem>
                    <SelectItem value="postgraduate">Postgraduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="faculty">Faculty *</Label>
                  <Input
                    id="faculty"
                    value={formData.faculty}
                    onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="program">Program *</Label>
                  <Input
                    id="program"
                    value={formData.program}
                    onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="enrollmentStatus">Enrollment Status *</Label>
                  <Select
                    value={formData.enrollmentStatus}
                    onValueChange={(value) => setFormData({ ...formData, enrollmentStatus: value })}
                    required
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="distance-learning">Distance Learning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedGraduation">Expected Graduation *</Label>
                  <Input
                    id="expectedGraduation"
                    type="month"
                    value={formData.expectedGraduation}
                    onChange={(e) => setFormData({ ...formData, expectedGraduation: e.target.value })}
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  required
                />
              </div>

              {/* Emergency Contact Information */}
              <div className="space-y-4 pt-4 border-t border-border/30">
                <h3 className="text-lg font-semibold text-foreground/90">Emergency Contact</h3>
                <p className="text-sm text-muted-foreground -mt-2">Who should we contact in case of an emergency?</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName" className="text-sm font-medium">
                      Full Name *
                    </Label>
                    <Input
                      id="emergencyContactName"
                      value={formData.emergencyContactName}
                      onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactRelationship" className="text-sm font-medium">
                      Relationship *
                    </Label>
                    <Select 
                      value={formData.emergencyContactRelationship}
                      onValueChange={(value) => setFormData({ ...formData, emergencyContactRelationship: value })}
                      required
                    >
                      <SelectTrigger className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Parent</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="relative">Relative</SelectItem>
                        <SelectItem value="friend">Friend</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone" className="text-sm font-medium">
                    Phone Number *
                  </Label>
                  <Input
                    id="emergencyContactPhone"
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="h-11 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
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
                  className="h-6 w-6 shrink-0 rounded-sm border border-muted-foreground/60 bg-white ring-1 ring-border data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors"
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
                  href="/student/signin"
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
