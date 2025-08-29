"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Phone, School, Ruler, Home, Bed, CalendarDays, DollarSign, Shield, CheckCircle2, XCircle } from "lucide-react"
import { RentalRequestDialog } from "@/components/RentalRequestDialog"
import { toast } from "sonner"

interface Property {
  id: string
  landlord_id: string
  title: string
  description: string | null
  address_line1: string
  address_line2: string | null
  state: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  property_type: string
  total_rooms: number
  available_rooms: number
  price_per_room: number
  amenities: string[] | null
  images: string[] | null
  rules: string[] | null
  created_at: string
  updated_at: string
  is_active: boolean | null
  verification_status: "pending" | "verified" | "rejected" | null
  address: string | null
  bathrooms: number | null
  size_sqft: number | null
  is_furnished: boolean | null
  available_from: string | null
  minimum_stay_months: number | null
  deposit_amount: number | null
  pets_allowed: boolean | null
  smoking_allowed: boolean | null
  featured: boolean | null
  contact_phone: string | null
  gender_preference: string | null
  location: string | null
  monthly_rent: number | null
  university: string | null
  distance_from_campus: number | null
}

interface Room {
  id: string
  room_number: string
  room_type: string
  capacity: number
  current_occupancy: number
  monthly_rent: number
  status: string
}

// Match landlord amenities look-and-feel (labels + simple icons)
const amenityMeta: Record<string, { label: string; icon: string }> = {
  wifi: { label: 'Wi-Fi', icon: '📶' },
  'gas-stove': { label: 'Gas Stove', icon: '🔥' },
  fridge: { label: 'Fridge', icon: '❄️' },
  freezer: { label: 'Freezer', icon: '🧊' },
  solar: { label: 'Solar Power', icon: '☀️' },
  borehole: { label: 'Borehole Water', icon: '💧' },
  security: { label: 'Security', icon: '🔒' },
  parking: { label: 'Parking', icon: '🚗' },
  transport: { label: 'Transport', icon: '🚌' },
  tiles: { label: 'Tiled Floors', icon: '🏠' },
  ceiling: { label: 'Ceiling', icon: '🏗️' },
  kitchen: { label: 'Kitchen', icon: '🍳' },
  laundry: { label: 'Laundry', icon: '👕' },
  garden: { label: 'Garden', icon: '🌿' },
  balcony: { label: 'Balcony', icon: '🏠' },
  aircon: { label: 'Air Conditioning', icon: '❄️' },
}

// Map room type values to human labels (match landlord form exactly)
const roomTypeLabels: Record<string, string> = {
  single: 'Single Room',
  double: 'Double Room',
  dormitory: 'Dormitory (4+ people)',
  'bedsitter': 'Bedsitter',
  'one-bedroom': 'One Bedroom',
}

// Landlord form order for room types
const roomTypeOrder = ['single', 'double', 'dormitory', 'bedsitter', 'one-bedroom']

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [isRequestOpen, setIsRequestOpen] = useState(false)
  const [showRequestDialog, setShowRequestDialog] = useState(false)

  const images = useMemo(() => property?.images ?? [], [property])
  const heroImage = images && images.length > 0 ? images[Math.min(activeImageIdx, images.length - 1)] : "/placeholder.svg"

  useEffect(() => {
    const fetchPropertyAndRooms = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: prop } = await supabase
          .from("properties")
          .select("*")
          .eq("id", params.id)
          .eq("is_active", true)
          .single()
          .throwOnError()
        setProperty(prop as unknown as Property)

        // Fetch rooms for this property (try numeric and string matching, plus join fallback)
        const pidNumber = Number(params.id)
        const filters: any[] = []
        // primary: direct eq on property_id with string id
        filters.push(
          supabase
            .from('rooms')
            .select('id, room_number, room_type, capacity, current_occupancy, monthly_rent, status')
            .eq('property_id', params.id)
        )
        // if numeric, try numeric match as well
        if (!Number.isNaN(pidNumber)) {
          filters.push(
            supabase
              .from('rooms')
              .select('id, room_number, room_type, capacity, current_occupancy, monthly_rent, status')
              .eq('property_id', pidNumber)
          )
        }
        // join fallback in case of type/casing differences
        filters.push(
          supabase
            .from('rooms')
            .select('id, room_number, room_type, capacity, current_occupancy, monthly_rent, status, property_id, properties!inner(id)')
            .eq('properties.id', params.id)
        )

        let rms: any[] = []
        for (const q of filters) {
          const { data: attempt, error: roomsErr } = await q
          if (roomsErr) {
            console.warn('Rooms query error:', roomsErr.message)
            continue
          }
          if (attempt && attempt.length > 0) {
            rms = attempt
            break
          }
        }
        setRooms((rms || []) as Room[])
      } catch (err: any) {
        console.error("Failed to load property:", err)
        setError(err?.message || "Failed to load property")
      } finally {
        setLoading(false)
      }
    }
    if (params?.id) fetchPropertyAndRooms()
  }, [params?.id, supabase])

  // Group rooms by (room_type, monthly_rent) to mirror landlord entries
  const groupedRooms = useMemo(() => {
    const map = new Map<string, { room_type: string; monthly_rent: number; total: number; available: number }>()
    rooms.forEach(r => {
      const type = (r.room_type || 'room')
      const price = Number(r.monthly_rent || 0)
      const key = `${type}|${price}`
      const prev = map.get(key) || { room_type: type, monthly_rent: price, total: 0, available: 0 }
      prev.total += 1
      const cap = r.capacity ?? 1
      const occ = r.current_occupancy ?? 0
      const isAvail = (r.status === 'available') && (occ < cap)
      if (isAvail) prev.available += 1
      map.set(key, prev)
    })
    // Sort: landlord form order first, then price asc
    return Array.from(map.values()).sort((a, b) => {
      const ai = roomTypeOrder.indexOf(a.room_type)
      const bi = roomTypeOrder.indexOf(b.room_type)
      if (ai !== -1 && bi !== -1 && ai !== bi) return ai - bi
      if (ai !== -1 && bi === -1) return -1
      if (ai === -1 && bi !== -1) return 1
      return a.monthly_rent - b.monthly_rent || (a.room_type || '').localeCompare(b.room_type || '')
    })
  }, [rooms])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-muted rounded-lg" />
          <div className="h-6 bg-muted w-1/3 rounded" />
          <div className="h-4 bg-muted w-1/2 rounded" />
          <div className="h-40 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-10">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500 text-sm">{error || "Property not found"}</p>
            <div className="pt-4">
              <Button variant="outline" onClick={() => router.back()}>Go back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Submit rental request to Supabase
  const handleSubmitRequest = async (data: {
    fullName: string
    email: string
    phone: string
    university?: string | null
    yearOfStudy?: string | null
    gender?: string | null
    message: string
  }) => {
    try {
      // Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('You must be logged in to submit a rental request')
      }

      // Extract just the message part before "Profile:" or take the whole message
      const messageContent = data.message.split('Profile:')[0].trim() || "I'm interested in this property.";

      const { error: upsertErr } = await supabase
        .from('rental_requests')
        .upsert(
          {
            user_id: user.id,
            student_profile_id: user.id, // Using user.id as student_profile_id since they're the same in your schema
            property_id: property?.id,
            status: 'pending',
            message: messageContent,
            student_phone: data.phone,
            student_university: data.university,
            student_year: data.yearOfStudy,
            student_gender: data.gender,
            // Set landlord_profile_id from the property if available
            ...(property?.landlord_id && { landlord_profile_id: property.landlord_id })
          },
          {
            onConflict: 'student_profile_id, property_id',
            ignoreDuplicates: true,
          }
        )
        .select()
        .single()

      if (upsertErr) {
        if (upsertErr.code === '23505') {
          // Duplicate request - treat as success
          console.log('Rental request already exists')
        } else {
          throw upsertErr
        }
      }

      toast.success('Rental request submitted successfully!')
      setShowRequestDialog(false)
    } catch (e: any) {
      console.error('Failed to submit request:', e)
      toast.error(e.message || 'Failed to submit rental request')
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header with title and availability */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {property.featured ? <Badge>Featured</Badge> : null}
          {property.verification_status === "verified" ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Verified
            </Badge>
          ) : property.verification_status === "rejected" ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <XCircle className="w-3 h-3" /> Not Verified
            </Badge>
          ) : null}
        </div>
        <h1 className="text-2xl font-bold leading-tight">{property.title}</h1>
        <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-sm">
          <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {[property.address_line1, property.state, property.country].filter(Boolean).join(", ")}</span>
          {property.university && (
            <span className="inline-flex items-center gap-1"><School className="w-4 h-4" /> {property.university}{property.distance_from_campus != null ? ` · ${property.distance_from_campus} km` : ""}</span>
          )}
          <span className="inline-flex items-center gap-1"><Home className="w-4 h-4" /> {property.property_type}</span>
          <span className="inline-flex items-center gap-1"><Bed className="w-4 h-4" /> Rooms: {property.available_rooms}/{property.total_rooms} available</span>
        </div>
      </div>

      {/* Image gallery */}
      <div className="max-w-2xl mx-auto w-full">
        <div>
          <div className="relative w-full h-[420px] overflow-hidden rounded-lg border bg-black/5">
            {/* Use next/image for optimization when src is absolute URL */}
            {/* Fallback to img to avoid layout shift if needed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage || "/placeholder.svg"}
              alt={property.title}
              className="object-cover w-full h-full"
            />
            <Badge className="absolute top-3 left-3" variant={property.available_rooms === 0 ? "default" : "secondary"}>
              {property.available_rooms === 0 ? "Occupied" : "Available"}
            </Badge>
          </div>
          {/* Thumbnails */}
          {images && images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {images.map((src, idx) => (
                <button
                  key={`${src}-${idx}`}
                  className={`relative h-20 rounded-md overflow-hidden border ${idx === activeImageIdx ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setActiveImageIdx(idx)}
                  aria-label={`View image ${idx + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src || "/placeholder.svg"} alt={`Photo ${idx + 1}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unified Details Card (mirrors landlord form style) */}
      <div className="max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">University</div>
                  <div>{property.university || '—'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Distance from Campus (km)</div>
                  <div>{property.distance_from_campus != null ? `${property.distance_from_campus} km` : '—'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Property Type</div>
                  <div>{property.property_type || '—'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Gender Preference</div>
                  <div className="capitalize">{property.gender_preference || 'Any'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Rooms Available</div>
                  <div>{property.available_rooms}/{property.total_rooms}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Contact Phone</div>
                  <div>{property.contact_phone || '—'}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Address */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Property Address</h3>
              <div className="space-y-1 text-sm">
                <div>{property.address_line1}</div>
                <div className="text-muted-foreground">{[property.state, property.country].filter(Boolean).join(', ')}</div>
                {property.location && (
                  <div className="text-muted-foreground">Area: {property.location}</div>
                )}
              </div>
            </div>

            <Separator />

            {/* Room Types & Pricing */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Room Types & Pricing</h3>
              {groupedRooms.length > 0 ? (
                <div className="space-y-3">
                  {groupedRooms.map((grp, idx) => (
                    <div key={`${grp.room_type}-${grp.monthly_rent}-${idx}`} className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 rounded-md border p-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-medium">{roomTypeLabels[grp.room_type] || grp.room_type}</span>
                        <span className="text-muted-foreground">${grp.monthly_rent.toLocaleString()} / month</span>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>Quantity: {grp.total}</span>
                        {grp.available !== grp.total && (
                          <span className="opacity-80">({grp.available} available)</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Starting from</div>
                    <div className="font-medium">${Number(property.price_per_room).toLocaleString()} / month</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Total Rooms</div>
                    <div>{property.total_rooms}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Currently Available</div>
                    <div>{property.available_rooms}</div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Amenities */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Amenities</h3>
              {property.amenities && property.amenities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((a, i) => {
                    const meta = amenityMeta[a] || { label: a, icon: '•' }
                    return (
                      <div key={`${a}-${i}`} className="flex items-center space-x-2 text-sm">
                        <span>{meta.icon}</span>
                        <span>{meta.label}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No amenities provided.</p>
              )}
            </div>

            <Separator />

            {/* Rules */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Rules & Conditions</h3>
              {property.rules && property.rules.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {property.rules.map((r, i) => (
                    <li key={`${r}-${i}`}>{r}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No rules specified.</p>
              )}
            </div>

            {property.description ? (
              <>
                <Separator />
                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-base font-semibold">Description</h3>
                  <p className="text-sm leading-6 whitespace-pre-line text-muted-foreground">{property.description}</p>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Contact / Request to Rent card (now centered below, same width as details) */}
      <div className="max-w-2xl mx-auto w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2"><DollarSign className="w-5 h-5" /> {Number(property.price_per_room).toLocaleString()} / month</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Available from: {property.available_from ? new Date(property.available_from).toLocaleDateString() : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Ruler className="w-4 h-4" /> Size: {property.size_sqft ? `${property.size_sqft} sqft` : "N/A"}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Shield className="w-4 h-4" /> Deposit: {property.deposit_amount != null ? Number(property.deposit_amount).toLocaleString() : "N/A"}
            </div>
            <Separator />
            <div className="text-sm flex items-center gap-2">
              <Phone className="w-4 h-4" /> {property.contact_phone || "Contact unavailable"}
            </div>
            <div className="text-sm">Gender preference: {property.gender_preference || "Any"}</div>
            <Button type="button" className="w-full" onClick={() => setIsRequestOpen(true)}>Request to Rent</Button>
          </CardContent>
        </Card>
      </div>

      {/* Dialog for Request to Rent */}
      <RentalRequestDialog
        isOpen={isRequestOpen}
        onOpenChange={setIsRequestOpen}
        propertyTitle={property.title}
        onSubmit={handleSubmitRequest}
      />
    </div>
  )
}
