"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Type definitions
type NotificationType = 'request_response' | 'new_property' | 'rental_request' | 'complaint' | 'tenant_update' | 'payment';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  data: {
    requestId?: string;
    studentName?: string;
    property?: string;
    tenantName?: string;
    amount?: number;
  };
}

interface Review {
  id: string
  targetId: string
  targetType: 'property' | 'landlord' | 'tenant'
  reviewerName: string
  rating: number
  comment: string
  date: string
  helpful: number
  type: 'property' | 'landlord' | 'tenant'  
  verified: boolean
}

interface Tenant {
  id: number;
  name: string;
  email: string;
  phone: string;
  property: string;
  rentAmount: number;
  moveInDate: string;
  status: string;
  rating: number;
  profileImage: string;
  roomNumber: string;
  roomType: string;
}

interface Room {
  id: number;
  propertyId: number;
  propertyName: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  rent: number;
  status: string;
  tenant: {
    id: number;
    name: string;
    email: string;
    moveInDate: string;
  } | null;
  amenities: string[];
  maxOccupancy: number;
  currentOccupancy: number;
}

interface RentalRequest {
  id: string;
  studentName: string;
  studentEmail: string;
  property: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
}

interface Property {
  id: number;
  title: string;
  address_line1?: string;
  state?: string;
  university?: string;
  price_per_room?: number;
  total_rooms?: number;
  available_rooms?: number;
  status?: 'available' | 'occupied' | 'maintenance';
  images?: string[];
}

interface StudentProfile {
  id: string
  first_name: string | null
  surname: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  created_at?: string
  updated_at?: string
  student_id?: string | null
  faculty?: string | null
  program?: string | null
  year_of_study?: string | null
  expected_graduation_date?: string | null
  university?: string | null
  emergency_contact_name?: string | null
  emergency_contact_phone?: string | null
  emergency_contact_relationship?: string | null
}

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedTabs, AnimatedTabsList, AnimatedTabsTrigger, AnimatedTabsContent } from "@/components/ui/animated-tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import ReviewSystem from "@/components/review-system"
import NotificationCenter from "@/components/notification-center"
import MoreMenu from "@/components/more-menu"
import {
  Home,
  Users,
  Bell,
  MessageSquare,
  LogOut,
  Camera,
  Plus,
  Star,
  MapPin,
  DollarSign,
  UserX,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Grid3X3,
  User,
} from "lucide-react"
import Link from "next/link"
import AuthButton from "@/components/auth-button"

// Mock data (will be replaced with student data)
const mockProperties: Property[] = [
  // Properties will be loaded from the database
];

const mockStudentNotifications: Notification[] = [
  // Notifications will be loaded from the database
];

const mockTenantReviews: Review[] = [
  // Reviews will be loaded from the database
]

export default function StudentDashboard() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [properties, setProperties] = useState<Property[]>(mockProperties)
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [propertiesError, setPropertiesError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>(mockStudentNotifications)
  const [reviews, setReviews] = useState<Review[]>(mockTenantReviews)

  // Student profile state (from Supabase)
  const [studentProfile, setStudentProfile] = useState<StudentProfile>({
    id: '',
    first_name: null,
    surname: null,
    email: null,
    phone: null,
    avatar_url: null,
    student_id: null,
    faculty: null,
    program: null,
    year_of_study: null,
    expected_graduation_date: null,
    university: null,
    emergency_contact_name: null,
    emergency_contact_phone: null,
    emergency_contact_relationship: null,
  })
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Form state for profile editing
  const [formData, setFormData] = useState({
    first_name: "",
    surname: "",
    email: "",
    phone: "",
    student_id: "",
    faculty: "",
    program: "",
    year_of_study: "",
    expected_graduation_date: "",
    university: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
  })

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true)
      setProfileError(null)
      try {
        const { data: { user }, error: userErr } = await supabase.auth.getUser()
        if (userErr) throw userErr
        if (!user) {
          router.push('/')
          return
        }
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        if (error) throw error
        const profile: StudentProfile = {
          id: data.id,
          first_name: data.first_name ?? null,
          surname: data.surname ?? null,
          email: data.email ?? user.email ?? null,
          phone: data.phone ?? null,
          avatar_url: data.avatar_url ?? null,
          created_at: data.created_at,
          updated_at: data.updated_at,
          student_id: data.student_id ?? null,
          faculty: data.faculty ?? null,
          program: data.program ?? null,
          year_of_study: data.year_of_study ?? null,
          expected_graduation_date: data.expected_graduation_date ?? null,
          university: data.university ?? null,
          emergency_contact_name: data.emergency_contact_name ?? null,
          emergency_contact_phone: data.emergency_contact_phone ?? null,
          emergency_contact_relationship: data.emergency_contact_relationship ?? null,
        }
        setStudentProfile(profile)
        setFormData({
          first_name: profile.first_name ?? '',
          surname: profile.surname ?? '',
          email: profile.email ?? '',
          phone: profile.phone ?? '',
          student_id: profile.student_id ?? '',
          faculty: profile.faculty ?? '',
          program: profile.program ?? '',
          year_of_study: profile.year_of_study ?? '',
          expected_graduation_date: profile.expected_graduation_date ?? '',
          university: profile.university ?? '',
          emergency_contact_name: profile.emergency_contact_name ?? '',
          emergency_contact_phone: profile.emergency_contact_phone ?? '',
          emergency_contact_relationship: profile.emergency_contact_relationship ?? '',
        })
      } catch (e: any) {
        console.error('Failed to load profile', e)
        setProfileError(e.message || 'Failed to load profile')
      } finally {
        setProfileLoading(false)
      }
    }
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase])

  // Load all active properties for students to browse
  useEffect(() => {
    const fetchProperties = async () => {
      setLoadingProperties(true)
      setPropertiesError(null)
      try {
        const { data } = await supabase
          .from('properties')
          .select('id, title, address_line1, state, university, price_per_room, total_rooms, available_rooms, images, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .throwOnError()

        setProperties((data as any) || [])
      } catch (err: any) {
        // If projection/filter is wrong, try a broad fallback to help diagnose quickly
        console.error('Fetch attempt 1 failed:', err)
        try {
          const { data: fallbackData } = await supabase
            .from('properties')
            .select('*')
            .limit(24)
            .order('id', { ascending: false })
            .throwOnError()

          setProperties((fallbackData as any) || [])
          // Also inform UI that we used a fallback (likely a column mismatch)
          setPropertiesError('Using fallback fields. Verify columns like is_active/status/images exist in properties table.')
        } catch (fallbackErr: any) {
          console.error('Fetch fallback failed:', fallbackErr)
          const msgParts = [
            fallbackErr?.message,
            fallbackErr?.hint,
            fallbackErr?.code,
          ].filter(Boolean)
          setPropertiesError(msgParts.join(' · ') || 'Failed to load properties')
        }
      } finally {
        setLoadingProperties(false)
      }
    }

    fetchProperties()
  }, [supabase])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveChanges = async () => {
    if (!studentProfile) return;
    
    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      const updates = {
        id: user.id,
        first_name: formData.first_name || null,
        surname: formData.surname || null,
        phone: formData.phone || null,
        email: formData.email || null,
        student_id: formData.student_id || null,
        faculty: formData.faculty || null,
        program: formData.program || null,
        year_of_study: formData.year_of_study || null,
        expected_graduation_date: formData.expected_graduation_date || null,
        university: formData.university || null,
        emergency_contact_name: formData.emergency_contact_name || null,
        emergency_contact_phone: formData.emergency_contact_phone || null,
        emergency_contact_relationship: formData.emergency_contact_relationship || null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)

      if (error) throw error

      // Update email if changed
      if (formData.email && formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser(
          { email: formData.email }
        )
        if (emailError) throw emailError
      }

      // Update local state
      setStudentProfile(prev => ({
        ...prev,
        ...updates
      }));

      setIsEditing(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error('Error updating profile:', error)
      setProfileError(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      // Force a full page reload to ensure clean state
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      // Still redirect even if there's an error
      window.location.href = '/'
    }
  }

  const handleDeleteAccount = () => {
    // In a real app, make an API call then redirect
    console.log("Student account deletion requested")
    alert("Your account deletion request has been received.")
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const handleSubmitPropertyReview = (rating: number, comment: string) => {
    console.log("Property review submitted:", { rating, comment })
    // In real app, would send to backend
    alert("Thank you for your review!")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Linkier</h1>
                <p className="text-xs text-muted-foreground">Student Dashboard</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {studentProfile?.first_name || '...'}</span>
              <NotificationCenter
                userType="student"
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
              />
              <MoreMenu />
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <AnimatedTabs 
          defaultValue="overview" 
          className="space-y-6"
          onValueChange={(value) => {
            const tabs = ["overview", "properties", "my-room", "rent", "complaints", "profile"]
            setActiveTabIndex(tabs.indexOf(value))
          }}
        >
          <AnimatedTabsList className="w-full overflow-x-auto no-scrollbar">
            <div className="flex w-full relative">
              {["Overview", "Properties", "My Room", "Rent", "Complaints", "Profile"].map((tab, index) => (
                <AnimatedTabsTrigger 
                  key={tab} 
                  value={tab.toLowerCase().replace(' ', '-')}
                  className="flex-1 min-w-max px-2 text-sm"
                  activeTabIndex={activeTabIndex}
                  totalTabs={6}
                >
                  {tab}
                </AnimatedTabsTrigger>
              ))}
            </div>
          </AnimatedTabsList>

          {/* Overview Tab */}
          <AnimatedTabsContent value="overview" className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">My Room</p>
                      <p className="text-2xl font-bold">Not Assigned</p>
                    </div>
                    <Home className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">My Rent</p>
                      <p className="text-2xl font-bold">R0.00</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Notifications</p>
                      <p className="text-2xl font-bold">{notifications.filter(n => !n.read).length}</p>
                    </div>
                    <Bell className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">My Landlord</p>
                      <p className="text-2xl font-bold">Not Assigned</p>
                    </div>
                    <User className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${notification.read ? "bg-muted" : "bg-primary"}`} />
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>My Favorite Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {properties.slice(0, 3).map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <p className="text-sm text-muted-foreground">{[property.address_line1 as any, property.state as any].filter(Boolean).join(', ')}</p>
                        </div>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                          <Link href={`/property/${property.id}`}>View</Link>
                        </Button>
                      </div>
                    ))}
                     {properties.length === 0 && (
                      <p className="text-sm text-muted-foreground">You have no favorite properties yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

          </AnimatedTabsContent>

          {/* Properties Tab */}
          <AnimatedTabsContent value="properties" className="space-y-6">
            
          <AnimatedTabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Find a Property</h2>
                <p className="text-muted-foreground">Search for your next home</p>
              </div>
            </div>

            {propertiesError && (
              <p className="text-sm text-red-500 whitespace-pre-line">{propertiesError}</p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loadingProperties && properties.length === 0 && (
                <p className="text-sm text-muted-foreground">Loading properties...</p>
              )}
              {!loadingProperties && !propertiesError && properties.length === 0 && (
                <p className="text-sm text-muted-foreground">No properties found.</p>
              )}
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={(property.images && (property.images as any)[0]) || "/placeholder.svg"}
                      alt={property.title}
                      className="w-full h-48 object-cover"
                    />
                    <Badge
                      className="absolute top-2 right-2"
                      variant={(property.available_rooms !== undefined && property.available_rooms === 0) ? 'default' : 'secondary'}
                    >
                      {(property.available_rooms !== undefined && property.available_rooms === 0) ? 'Occupied' : 'Available'}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{property.title}</h3>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {[property.address_line1 as any, property.state as any].filter(Boolean).join(', ')}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-primary font-semibold">
                          <DollarSign className="w-4 h-4 mr-1" />${property.price_per_room ?? '-'} /month
                        </div>
                        <span className="text-sm text-muted-foreground">{property.total_rooms ?? '-'} rooms</span>
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                          <Link href={`/property/${property.id}`}>View</Link>
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          <Star className="w-4 h-4 mr-1" />
                          Favorite
                        </Button>
                        <Button size="sm" className="flex-1">
                          Request to Rent
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedTabsContent>

          </AnimatedTabsContent>

          {/* My Room Tab */}
          <AnimatedTabsContent value="my-room" className="space-y-6">
            {/* My Room content will be added here */}
          </AnimatedTabsContent>

          {/* Rent Tab */}
          <AnimatedTabsContent value="rent" className="space-y-6">
            {/* Rent content will be added here */}
          </AnimatedTabsContent>

          {/* Complaints Tab */}
          <AnimatedTabsContent value="complaints" className="space-y-6">
            {/* Complaints content will be added here */}
          </AnimatedTabsContent>

          {/* Profile Tab */}
          <AnimatedTabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" /> My Profile
                </CardTitle>
                <CardDescription>Manage your personal and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4 pb-6 border-b">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={studentProfile?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {(studentProfile?.first_name?.[0] || '')}
                      {(studentProfile?.surname?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="icon">
                    <Camera className="w-4 h-4" />
                  </Button>
                  <h3 className="text-2xl font-medium">
                    {formData.first_name} {formData.surname}
                  </h3>
                  <Badge variant="outline">Student</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing
                          ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                          : ""
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Surname</Label>
                    <Input
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing
                          ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                          : ""
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing
                          ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                          : ""
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={
                        isEditing
                          ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                          : ""
                      }
                    />
                  </div>
                </div>

                {/* Academic & Emergency Info */}
                <div className="space-y-4">
                  <Separator />
                  <h4 className="text-lg font-medium">Academic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      {isEditing ? (
                        <Input
                          id="university"
                          name="university"
                          value={formData.university}
                          onChange={handleInputChange}
                          className={isEditing ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary" : ""}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{studentProfile.university || '-'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="faculty">Faculty</Label>
                      {isEditing ? (
                        <Input
                          id="faculty"
                          name="faculty"
                          value={formData.faculty}
                          onChange={handleInputChange}
                          className={isEditing ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary" : ""}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{studentProfile.faculty || '-'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="program">Program</Label>
                      {isEditing ? (
                        <Input
                          id="program"
                          name="program"
                          value={formData.program}
                          onChange={handleInputChange}
                          className={isEditing ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary" : ""}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{studentProfile.program || '-'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year_of_study">Year of Study</Label>
                      {isEditing ? (
                        <Select
                          value={formData.year_of_study}
                          onValueChange={(value) => handleSelectChange("year_of_study", value)}
                        >
                          <SelectTrigger className={isEditing ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary" : ""}>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="First Year">First Year</SelectItem>
                            <SelectItem value="Second Year">Second Year</SelectItem>
                            <SelectItem value="Third Year">Third Year</SelectItem>
                            <SelectItem value="Fourth Year">Fourth Year</SelectItem>
                            <SelectItem value="Fifth Year">Fifth Year</SelectItem>
                            <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-muted-foreground">{studentProfile.year_of_study || '-'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expected_graduation_date">Expected Graduation</Label>
                      {isEditing ? (
                        <Input
                          type="month"
                          id="expected_graduation_date"
                          name="expected_graduation_date"
                          value={formData.expected_graduation_date}
                          onChange={handleInputChange}
                          className={isEditing ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary" : ""}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {studentProfile.expected_graduation_date 
                            ? new Date(studentProfile.expected_graduation_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                            : '-'}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="student_id">Student ID</Label>
                      {isEditing ? (
                        <Input
                          id="student_id"
                          name="student_id"
                          value={formData.student_id}
                          onChange={handleInputChange}
                          className={isEditing ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary" : ""}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{studentProfile.student_id || '-'}</p>
                      )}
                    </div>
                  </div>

                  <h4 className="text-lg font-medium">Emergency Contact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_name">Name</Label>
                      {isEditing ? (
                        <Input
                          id="emergency_contact_name"
                          name="emergency_contact_name"
                          value={formData.emergency_contact_name}
                          onChange={handleInputChange}
                          className={isEditing ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary" : ""}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{studentProfile.emergency_contact_name || '-'}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_phone">Phone</Label>
                      {isEditing ? (
                        <Input
                          id="emergency_contact_phone"
                          name="emergency_contact_phone"
                          value={formData.emergency_contact_phone}
                          onChange={handleInputChange}
                          className={isEditing ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary" : ""}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">{studentProfile.emergency_contact_phone || '-'}</p>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                      {isEditing ? (
                        <Select
                          value={formData.emergency_contact_relationship}
                          onValueChange={(value) => handleSelectChange("emergency_contact_relationship", value)}
                        >
                          <SelectTrigger className={isEditing ? "border-primary ring-1 ring-primary ring-offset-1 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary" : ""}>
                            <SelectValue placeholder="Select relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Parent">Parent</SelectItem>
                            <SelectItem value="Guardian">Guardian</SelectItem>
                            <SelectItem value="Sibling">Sibling</SelectItem>
                            <SelectItem value="Spouse">Spouse</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="text-sm text-muted-foreground">{studentProfile.emergency_contact_relationship || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove your
                          data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <div className="space-x-2">
                    {!isEditing ? (
                      <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Edit Profile
                      </Button>
                    ) : (
                      <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </AnimatedTabsContent>
        </AnimatedTabs>
      </div>
    </div>
  )
}