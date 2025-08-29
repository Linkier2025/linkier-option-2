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
  propertyId: string;
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
  studentPhone?: string;
  studentUniversity?: string;
  submittedAt?: string;
  updatedAt?: string;
}

interface Property {
  id: string;
  landlord_id: string;
  title: string;
  description: string;
  location: string;
  university: string;
  monthly_rent: number;
  rooms: number;
  gender_preference: 'male' | 'female' | 'mixed';
  amenities: string[];
  images: string[];
  status: 'available' | 'occupied' | 'maintenance';
  address?: string;
  address_line1?: string;
  state?: string;
  property_type?: string;
  bathrooms?: number;
  size_sqft?: number;
  is_furnished?: boolean;
  available_from?: string;
  minimum_stay_months?: number;
  deposit_amount?: number;
  pets_allowed?: boolean;
  smoking_allowed?: boolean;
  is_active?: boolean;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface LandlordProfile {
  id: string
  first_name: string | null
  surname: string | null
  email: string | null
  phone: string | null
  avatar_url: string | null
  created_at?: string
  updated_at?: string
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

// Mock data
const mockTenants: Tenant[] = []
const mockRooms: Room[] = []
const mockAvailableStudents: Array<{ id: number; name: string; email: string; university: string; yearOfStudy: string; profileImage: string; }> = []
const mockProperties: Property[] = []
const mockLandlordNotifications: Notification[] = []
const mockRentalRequests: RentalRequest[] = []
const mockTenantReviews: Review[] = []

export default function LandlordDashboard() {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants)
  const [properties, setProperties] = useState<Property[]>(mockProperties)
  const [notifications, setNotifications] = useState<Notification[]>(mockLandlordNotifications)
  const [rentalRequests, setRentalRequests] = useState<RentalRequest[]>(mockRentalRequests)
  const [reviews, setReviews] = useState<Review[]>(mockTenantReviews)
  const [rooms, setRooms] = useState<Room[]>(mockRooms)
  const [selectedProperty, setSelectedProperty] = useState<string>("all")

  // Landlord profile state (from Supabase)
  const [landlordProfile, setLandlordProfile] = useState<LandlordProfile>({
    id: '',
    first_name: null,
    surname: null,
    email: null,
    phone: null,
    avatar_url: null,
  })
  const [profileLoading, setProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Fetch properties when component mounts
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: properties, error } = await supabase
          .from('properties')
          .select('*')
          .eq('landlord_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        if (properties) {
          setProperties(properties)
        }
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoadingProperties(false)
      }
    }

    fetchProperties()
  }, [supabase])

  // Fetch rooms for landlord properties to compute per-room-type availability and pricing
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const propertyIds = properties.map(p => p.id)
        if (propertyIds.length === 0) {
          setRooms([])
          return
        }
        const { data, error } = await supabase
          .from('rooms')
          .select('id, property_id, room_type, monthly_rent, status, amenities')
          .in('property_id', propertyIds)
        if (error) {
          console.error('Error fetching rooms:', {
            message: error.message,
            details: (error as any).details,
            hint: (error as any).hint,
            code: (error as any).code,
          })
          return
        }
        setRooms((data || []) as any)
      } catch (e: any) {
        console.error('Error fetching rooms (unexpected):', {
          message: e?.message,
          stack: e?.stack,
          ...e,
        })
      }
    }
    fetchRooms()
  }, [supabase, properties])

  // Fetch rental requests for landlord's properties (guarded + with logs)
  useEffect(() => {
    const fetchRentalRequests = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          console.log('[requests] No auth user; skipping fetch')
          return
        }
        if (!properties || properties.length === 0) {
          console.log('[requests] No properties for landlord; clearing list')
          setRentalRequests([])
          return
        }

        const propertyIds = properties.map(p => p.id)
        console.log('[requests] Fetching rental_requests for propertyIds:', propertyIds)

        const { data: reqRows, error: reqErr } = await supabase
          .from('rental_requests')
          .select('id, student_profile_id, user_id, property_id, status, created_at, updated_at, message')
          .in('property_id', propertyIds)
          .order('created_at', { ascending: false })

        if (reqErr) {
          console.error('[requests] Error fetching rental_requests:', {
            message: reqErr.message,
            details: (reqErr as any).details,
            hint: (reqErr as any).hint,
            code: (reqErr as any).code,
          })
          setRentalRequests([])
          return
        }

        const rows = reqRows || []
        console.log('[requests] Rows fetched:', rows.length)

        if (rows.length === 0) {
          setRentalRequests([])
          return
        }

        // Batch fetch profiles
        const studentIds = Array.from(new Set(rows.map(r => r.student_profile_id).filter(Boolean))) as string[]
        let profilesById: Record<string, { id: string; first_name: string | null; surname: string | null; email: string | null; phone: string | null; university: string | null }> = {}
        if (studentIds.length > 0) {
          const { data: profs, error: profErr } = await supabase
            .from('profiles')
            .select('id, first_name, surname, email, phone, university')
            .in('id', studentIds)
          if (profErr) {
            console.warn('[requests] profiles join failed:', profErr)
          } else {
            profilesById = (profs || []).reduce((acc, p) => {
              acc[p.id] = p as any
              return acc
            }, {} as Record<string, any>)
          }
        }

        // Property title map from already-fetched properties
        const titleByPropertyId: Record<string, string> = {}
        for (const p of properties) titleByPropertyId[p.id] = p.title

        const mapped: RentalRequest[] = rows.map((r: any) => {
          const prof = r.student_profile_id ? profilesById[r.student_profile_id] : null
          const fullName = [prof?.first_name, prof?.surname].filter(Boolean).join(' ')
          return {
            id: String(r.id),
            studentName: fullName || 'Unknown Student',
            studentEmail: prof?.email || '—',
            property: titleByPropertyId[r.property_id] || String(r.property_id),
            requestDate: r.created_at ? new Date(r.created_at).toLocaleString() : '',
            status: (r.status === 'accepted' ? 'approved' : r.status) || 'pending',
            message: (r as any).message || '',
            studentPhone: (prof as any)?.phone || '—',
            studentUniversity: (prof as any)?.university || '—',
            submittedAt: r.created_at ? new Date(r.created_at).toLocaleString() : '',
            updatedAt: r.updated_at ? new Date(r.updated_at).toLocaleString() : '',
          }
        })

        console.log('[requests] Mapped requests:', mapped.length)
        setRentalRequests(mapped)
      } catch (e: any) {
        console.error('[requests] Unexpected error:', {
          message: e?.message,
          details: e?.details,
          hint: e?.hint,
          stack: e?.stack,
        })
        setRentalRequests([])
      }
    }

    if (loadingProperties) {
      // Wait until properties loaded
      return
    }

    fetchRentalRequests()
  }, [supabase, properties, loadingProperties])

  // Profile editing state (mirrors student profile UX)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Form state for profile editing
  const [formData, setFormData] = useState({
    first_name: "",
    surname: "",
    email: "",
    phone: "",
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
        const profile: LandlordProfile = {
          id: data.id,
          first_name: data.first_name ?? null,
          surname: data.surname ?? null,
          email: data.email ?? user.email ?? null,
          phone: data.phone ?? null,
          avatar_url: data.avatar_url ?? null,
          created_at: data.created_at,
          updated_at: data.updated_at,
        }
        setLandlordProfile(profile)
        setFormData({
          first_name: profile.first_name ?? '',
          surname: profile.surname ?? '',
          email: profile.email ?? '',
          phone: profile.phone ?? '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSaveChanges = async () => {
    if (!landlordProfile) return;
    
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
      setLandlordProfile(prev => ({
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

  const handleDeleteProperty = async (propertyId: string, title: string) => {
    try {
      setDeletingId(propertyId)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('landlord_id', user.id)

      if (error) throw error

      setProperties(prev => prev.filter(p => p.id !== propertyId))
      alert(`"${title}" deleted successfully.`)
    } catch (e) {
      console.error('Failed to delete property:', e)
      alert('Failed to delete property. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleDeleteAccount = () => {
    // In a real app, make an API call then redirect
    console.log("Landlord account deletion requested")
    alert("Your account deletion request has been received.")
  }

  const updateTenantStatus = (tenantId: number, newStatus: "active" | "moved_out" | "inactive") => {
    setTenants(prevTenants => 
      prevTenants.map(tenant => 
        tenant.id === tenantId 
          ? { ...tenant, status: newStatus } 
          : tenant
      )
    )

    const tenant = tenants.find((t) => t.id === tenantId)
    if (tenant) {
      const newNotification: Notification = {
        id: Date.now().toString(),
        type: "tenant_update",
        title: "Tenant Status Updated",
        message: `${tenant.name} has been marked as ${newStatus.replace("_", " ")}`,
        time: "Just now",
        read: false,
        data: {
          tenantName: tenant.name,
          property: tenant.property,
        },
      }
      setNotifications((prev) => [newNotification, ...prev])
    }
  }

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const handleRentalRequest = async (requestId: string, action: "accept" | "reject", reason?: string) => {
    const request = rentalRequests.find((r) => r.id.toString() === requestId)
    if (!request) return

    // Optimistic UI update
    const prevRequests = rentalRequests
    setRentalRequests((requests) =>
      requests.map((r) =>
        r.id.toString() === requestId
          ? { ...r, status: action === "accept" ? "approved" : "rejected" }
          : r,
      )
    )

    try {
      const dbStatus = action === 'accept' ? 'accepted' : 'rejected'
      const updates: any = {
        status: dbStatus,
        updated_at: new Date().toISOString(),
      }
      if (dbStatus === 'rejected') {
        updates.rejection_reason = reason ?? null
      }
      const { error } = await supabase
        .from('rental_requests')
        .update(updates)
        .eq('id', requestId)
      if (error) {
        console.error('[requests] Failed to persist status update:', error)
        setRentalRequests(prevRequests)
        return
      }
    } catch (e) {
      console.error('[requests] Unexpected error updating request status:', e)
      setRentalRequests(prevRequests)
      return
    }

    setNotifications((prev) => prev.filter((n) => n.data?.requestId !== requestId))

    const responseNotification = {
      id: Date.now().toString(),
      type: "request_response",
      title: `Rental Request ${action === "accept" ? "Accepted" : "Rejected"}`,
      message: `Your request for ${request.property} has been ${action === "accept" ? "accepted" : "rejected"}`,
      time: "Just now",
      read: false,
      data: {
        status: action,
        propertyTitle: request.property,
        landlordName: `${landlordProfile?.first_name ?? ''} ${landlordProfile?.surname ?? ''}`,
        reason: reason,
      },
    }

    console.log("Response notification for student:", responseNotification)

    if (action === "accept") {
      const newTenant: Tenant = {
        id: Date.now(),
        name: request.studentName,
        email: request.studentEmail,
        phone: "+27 12 345 6789",
        property: request.property,
        rentAmount: 4500,
        moveInDate: new Date().toISOString().split("T")[0],
        status: "active",
        rating: 0,
        profileImage: "/placeholder.svg?key=newTenant",
        roomNumber: "TBD", // Default value that can be updated later
        roomType: "single" // Default value that can be updated later
      }
      setTenants((prev) => [...prev, newTenant])
    }
  }

  const handleSubmitTenantReview = (rating: number, comment: string) => {
    console.log("Tenant review submitted:", { rating, comment })
    // In real app, would send to backend
    alert("Thank you for your review!")
  }

  const assignStudentToRoom = (roomId: number, studentId: number) => {
    const student = mockAvailableStudents.find((s) => s.id === studentId)
    if (!student) return

    setRooms(
      rooms.map((room) =>
        room.id === roomId
          ? {
              ...room,
              status: "occupied" as const,
              tenant: {
                id: student.id,
                name: student.name,
                email: student.email,
                moveInDate: new Date().toISOString().split("T")[0],
              },
              currentOccupancy: room.currentOccupancy + 1,
            }
          : room,
      ),
    )

    // Add to tenants list
    const room = rooms.find((r) => r.id === roomId)
    if (room) {
      const newTenant = {
        id: student.id,
        name: student.name,
        email: student.email,
        phone: "+27 12 345 6789",
        property: room.propertyName,
        rentAmount: room.rent,
        moveInDate: new Date().toISOString().split("T")[0],
        status: "active" as const,
        rating: 0,
        profileImage: student.profileImage,
        roomNumber: room.roomNumber,
        roomType: room.roomType,
      }
      setTenants((prev) => [...prev, newTenant])
    }

    alert(`${student.name} has been assigned to ${room?.roomNumber}`)
  }

  const removeStudentFromRoom = (roomId: number) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room?.tenant) return

    setRooms(
      rooms.map((r) =>
        r.id === roomId
          ? {
              ...r,
              status: "available" as const,
              tenant: null,
              currentOccupancy: Math.max(0, r.currentOccupancy - 1),
            }
          : r,
      ),
    )

    // Remove from tenants list
    setTenants(tenants.filter((t) => t.id !== room.tenant?.id))

    alert(`${room.tenant.name} has been removed from ${room.roomNumber}`)
  }

  const updateRoomStatus = (roomId: number, newStatus: "available" | "occupied" | "maintenance") => {
    setRooms(rooms.map((room) => (room.id === roomId ? { ...room, status: newStatus } : room)))
  }

  const filteredRooms =
    selectedProperty === "all" ? rooms : rooms.filter((room) => room.propertyId.toString() === selectedProperty)

  const roomStats = {
    total: rooms.length,
    occupied: rooms.filter((r) => r.status === "occupied").length,
    available: rooms.filter((r) => r.status === "available").length,
    maintenance: rooms.filter((r) => r.status === "maintenance").length,
  }

  const activeTenants = tenants.filter((tenant) => tenant.status === "active")
  const unreadNotifications = notifications.filter((n) => !n.read).length
  const pendingRequests = rentalRequests.filter((r) => r.status === "pending")

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
                <h1 className="text-xl font-bold">Linkier</h1>
                <p className="text-xs text-muted-foreground">Landlord Dashboard</p>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">Welcome, {landlordProfile?.first_name || '...'}</span>
              <NotificationCenter
                userType="landlord"
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onHandleRequest={handleRentalRequest}
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
            const tabs = ["overview", "properties", "rooms", "tenants", "requests", "notifications", "complaints", "profile"]
            setActiveTabIndex(tabs.indexOf(value))
          }}
        >
          <AnimatedTabsList className="w-full overflow-x-auto no-scrollbar">
            <div className="flex w-full relative">
              {["Overview", "Properties", "Rooms", "Tenants", "Requests", "Notifications", "Complaints", "Profile"].map((tab, index) => (
                <AnimatedTabsTrigger 
                  key={tab} 
                  value={tab.toLowerCase()}
                  className="flex-1 min-w-max px-2 text-sm"
                  activeTabIndex={activeTabIndex}
                  totalTabs={8}
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
                      <p className="text-sm text-muted-foreground">Total Properties</p>
                      <p className="text-2xl font-bold">{properties.length}</p>
                    </div>
                    <Home className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Tenants</p>
                      <p className="text-2xl font-bold">{activeTenants.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Requests</p>
                      <p className="text-2xl font-bold">{pendingRequests.length}</p>
                    </div>
                    <Clock className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Income</p>
                      <p className="text-2xl font-bold">
                        R{activeTenants.reduce((sum, tenant) => sum + tenant.rentAmount, 0).toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-primary" />
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
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Property Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {properties.map((property) => (
                      <div key={property.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {[property.address_line1 as any, property.state as any]
                              .filter(Boolean)
                              .join(", ") || (property as any).location}
                          </p>
                        </div>
                        <Badge
                          variant={(
                            property.status ? property.status === "occupied" : (
                              (property as any).available_rooms !== undefined && (property as any).available_rooms === 0
                            )
                          ) ? "default" : "secondary"}
                        >
                          {(
                            property.status ? property.status === "occupied" : (
                              (property as any).available_rooms !== undefined && (property as any).available_rooms === 0
                            )
                          ) ? "Occupied" : "Available"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedTabsContent>

          {/* Properties Tab */}
          <AnimatedTabsContent value="properties" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">My Properties</h2>
                <p className="text-muted-foreground">Manage your rental properties</p>
              </div>
              <Button asChild>
                <Link href="/landlord/properties/add">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      variant={(
                        property.status ? property.status === "occupied" : (
                          (property as any).available_rooms !== undefined && (property as any).available_rooms === 0
                        )
                      ) ? "default" : "secondary"}
                    >
                      {(
                        property.status ? property.status === "occupied" : (
                          (property as any).available_rooms !== undefined && (property as any).available_rooms === 0
                        )
                      ) ? "Occupied" : "Available"}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{property.title}</h3>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {([property.address_line1 as any, property.state as any]
                          .filter(Boolean)
                          .join(", ")) || (property as any).location}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-primary font-semibold">
                          ${(property as any).price_per_room ?? (property as any).monthly_rent}/month
                        </div>
                        <span className="text-sm text-muted-foreground">{(property as any).total_rooms ?? (property as any).rooms} rooms</span>
                      </div>
                      {/* Per-room-type availability and pricing (from rooms table) */}
                      <div className="text-xs text-muted-foreground space-x-2 mt-2 flex flex-wrap">
                        {(() => {
                          const avail = (rooms as any[]).filter(r => (r as any).property_id === property.id && ((r as any).status ?? 'available') === 'available')
                          const byType = avail.reduce((acc: any, r: any) => {
                            const t = (r.room_type || '').toString()
                            const price = Number(r.monthly_rent) || 0
                            if (!acc[t]) acc[t] = { count: 0, min: price }
                            acc[t].count += 1
                            acc[t].min = acc[t].min === 0 ? price : Math.min(acc[t].min, price)
                            return acc
                          }, {})
                          const entries = Object.entries(byType) as Array<[string, { count: number; min: number }]> 
                          if (entries.length === 0) return <span>No available rooms</span>
                          const formatLabel = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
                          return entries.map(([t, info], idx) => (
                            <span key={t} className="mr-3">
                              {formatLabel(t)}{info.count > 1 ? 's' : ''} ${info.min}
                            </span>
                          ))
                        })()}
                      </div>
                      <div className="flex space-x-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent" asChild>
                          <Link href={`/landlord/properties/edit/${property.id}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Property</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{property.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  await handleDeleteProperty(property.id, property.title)
                                }}
                                disabled={deletingId === property.id}
                              >
                                {deletingId === property.id ? 'Deleting...' : 'Delete'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedTabsContent>

          {/* Tenants Tab */}
          <AnimatedTabsContent value="tenants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Active Tenants
                </CardTitle>
                <CardDescription>Manage your current tenants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeTenants.map((tenant) => (
                    <Card key={tenant.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar>
                              <AvatarImage src={tenant.profileImage || "/placeholder.svg"} />
                              <AvatarFallback>
                                {tenant.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold">{tenant.name}</h4>
                              <p className="text-sm text-muted-foreground">{tenant.email}</p>
                              <p className="text-sm text-muted-foreground">{tenant.property}</p>
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            <div>
                              <p className="font-semibold">R{tenant.rentAmount}/month</p>
                              <p className="text-sm text-muted-foreground">Since {tenant.moveInDate}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">{tenant.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div className="flex space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <UserX className="w-4 h-4 mr-1" />
                                Mark as Moved Out
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Mark Tenant as Moved Out</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove {tenant.name} from your active tenant list. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => updateTenantStatus(tenant.id, "moved_out")}>
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <UserX className="w-4 h-4 mr-1" />
                                Mark as Inactive
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Mark Tenant as Inactive</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove {tenant.name} from your active tenant list. This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => updateTenantStatus(tenant.id, "inactive")}>
                                  Confirm
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Star className="w-4 h-4 mr-1" />
                                Rate Tenant
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Rate & Review Tenant</DialogTitle>
                                <DialogDescription>Share your experience with {tenant.name}</DialogDescription>
                              </DialogHeader>
                              <ReviewSystem
                                targetId={`tenant-${tenant.id}`}
                                targetName={tenant.name}
                                targetType="tenant"
                                reviews={mockTenantReviews}
                                canReview={true}
                                onSubmitReview={handleSubmitTenantReview}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedTabsContent>

          {/* Requests Tab */}
          <AnimatedTabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rental Requests</CardTitle>
                <CardDescription>Review and respond to rental requests from students</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold">{request.studentName}</h4>
                              <p className="text-sm text-muted-foreground">{request.studentEmail}</p>
                              <p className="text-sm text-muted-foreground">Phone: {request.studentPhone || '—'}</p>
                              <p className="text-sm text-muted-foreground">University: {request.studentUniversity || '—'}</p>
                              <p className="text-sm text-muted-foreground">Property: {request.property}</p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">{request.status}</Badge>
                              <p className="text-sm text-muted-foreground mt-1">Created: {request.submittedAt || request.requestDate}</p>
                              {request.updatedAt && request.updatedAt !== request.submittedAt && (
                                <p className="text-xs text-muted-foreground">Updated: {request.updatedAt}</p>
                              )}
                            </div>
                          </div>
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm">{request.message ? request.message : 'No message provided.'}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={() => handleRentalRequest(request.id.toString(), "accept")}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject Rental Request</DialogTitle>
                                  <DialogDescription>
                                    Please provide a reason for rejecting this request.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Reason for rejection</Label>
                                    <Select>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select a reason" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="property-unavailable">
                                          Property no longer available
                                        </SelectItem>
                                        <SelectItem value="requirements-not-met">Requirements not met</SelectItem>
                                        <SelectItem value="other-candidate">Selected another candidate</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Additional message (optional)</Label>
                                    <textarea
                                      className="w-full min-h-[80px] p-3 border border-border rounded-md resize-none"
                                      placeholder="Provide additional details..."
                                    />
                                  </div>
                                  <Button
                                    className="w-full"
                                    onClick={() =>
                                      handleRentalRequest(
                                        request.id.toString(),
                                        "reject",
                                        "Property no longer available",
                                      )
                                    }
                                  >
                                    Send Rejection
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {pendingRequests.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No pending rental requests</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </AnimatedTabsContent>

          {/* Notifications Tab */}
          <AnimatedTabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </CardTitle>
                <CardDescription>Stay updated with your property activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${notification.read ? "bg-background" : "bg-primary/5 border-primary/20"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && <div className="w-2 h-2 bg-primary rounded-full mt-2" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedTabsContent>

          {/* Complaints Tab */}
          <AnimatedTabsContent value="complaints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Submit a Complaint
                </CardTitle>
                <CardDescription>Report issues with tenants or platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Complaint Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select complaint type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant-behavior">Tenant Behavior</SelectItem>
                      <SelectItem value="property-damage">Property Damage</SelectItem>
                      <SelectItem value="payment-issues">Payment Issues</SelectItem>
                      <SelectItem value="platform-issues">Platform Issues</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tenant/Property</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant or property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alex-johnson">Alex Johnson - Modern Student Apartment</SelectItem>
                      <SelectItem value="sarah-williams">Sarah Williams - Cozy Studio Near Campus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <textarea
                    className="w-full min-h-[100px] p-3 border border-border rounded-md resize-none"
                    placeholder="Please describe your complaint in detail..."
                  />
                </div>
                <Button>Submit Complaint</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Complaints</CardTitle>
                <CardDescription>Track the status of your submitted complaints</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No complaints submitted yet</p>
                </div>
              </CardContent>
            </Card>
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
                    <AvatarImage src={landlordProfile?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {(landlordProfile?.first_name?.[0] || '')}
                      {(landlordProfile?.surname?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="icon">
                    <Camera className="w-4 h-4" />
                  </Button>
                  <h3 className="text-2xl font-medium">
                    {formData.first_name} {formData.surname}
                  </h3>
                  <Badge variant="outline">Landlord</Badge>
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
          <AnimatedTabsContent value="rooms" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Room Management</h2>
                <p className="text-muted-foreground">Allocate and manage room assignments</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button asChild>
                  <Link href="/landlord/room-allocation">
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Advanced Allocation
                  </Link>
                </Button>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id.toString()}>
                        {property.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Room Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Rooms</p>
                      <p className="text-2xl font-bold">{roomStats.total}</p>
                    </div>
                    <Home className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Occupied</p>
                      <p className="text-2xl font-bold text-green-600">{roomStats.occupied}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Available</p>
                      <p className="text-2xl font-bold text-blue-600">{roomStats.available}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Maintenance</p>
                      <p className="text-2xl font-bold text-orange-600">{roomStats.maintenance}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <Card key={room.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{room.roomNumber}</CardTitle>
                        <CardDescription>{room.propertyName}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          room.status === "occupied"
                            ? "default"
                            : room.status === "available"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {room.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <span>{room.roomType}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Floor:</span>
                        <span>{room.floor}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rent:</span>
                        <span className="font-semibold">R{room.rent}/month</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Occupancy:</span>
                        <span>
                          {room.currentOccupancy}/{room.maxOccupancy}
                        </span>
                      </div>
                    </div>

                    {room.tenant && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>
                              {room.tenant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{room.tenant.name}</p>
                            <p className="text-xs text-muted-foreground">Since {room.tenant.moveInDate}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Amenities:</p>
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray((room as any).amenities) ? (room as any).amenities : []).slice(0, 3).map((amenity: string) => (
                          <Badge key={amenity} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {(Array.isArray((room as any).amenities) ? (room as any).amenities : []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(Array.isArray((room as any).amenities) ? (room as any).amenities : []).length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {room.status === "available" && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" className="flex-1">
                              <Plus className="w-4 h-4 mr-1" />
                              Assign Student
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Assign Student to {room.roomNumber}</DialogTitle>
                              <DialogDescription>Select a student to assign to this room</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              {mockAvailableStudents.map((student) => (
                                <div
                                  key={student.id}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Avatar>
                                      <AvatarImage src={student.profileImage || "/placeholder.svg"} />
                                      <AvatarFallback>
                                        {student.name
                                          .split(" ")
                                          .map((n) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{student.name}</p>
                                      <p className="text-sm text-muted-foreground">{student.email}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {student.yearOfStudy} - {student.university}
                                      </p>
                                    </div>
                                  </div>
                                  <Button size="sm" onClick={() => assignStudentToRoom(room.id, student.id)}>
                                    Assign
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {room.status === "occupied" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                              <UserX className="w-4 h-4 mr-1" />
                              Remove Tenant
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Tenant</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {room.tenant?.name} from {room.roomNumber}?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeStudentFromRoom(room.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}

                      <Select
                        value={room.status}
                        onValueChange={(value: "available" | "occupied" | "maintenance") =>
                          updateRoomStatus(room.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="occupied">Occupied</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </AnimatedTabsContent>
        </AnimatedTabs>
      </div>
    </div>
  )
}