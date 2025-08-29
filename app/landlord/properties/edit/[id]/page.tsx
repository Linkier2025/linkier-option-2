"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, X, Camera, ImageIcon, Plus, Trash2, Loader2 } from "lucide-react"
import { uploadPropertyImages } from "@/lib/storage"

const zimbabweUniversities = [
  "University of Zimbabwe",
  "National University of Science and Technology (NUST)",
  "Midlands State University",
  "Africa University",
  "Bindura University of Science Education",
  "Chinhoyi University of Technology",
  "Great Zimbabwe University",
  "Harare Institute of Technology",
  "Lupane State University",
  "Manicaland State University of Applied Sciences",
  "Reformed Church University",
  "Solusi University",
  "Women's University in Africa",
  "Zimbabwe Ezekiel Guti University",
  "Zimbabwe Open University",
  "Catholic University of Zimbabwe",
  "Gwanda State University",
  "Joshua Mqabuko Nkomo Polytechnic",
  "Marondera University of Agricultural Sciences and Technology",
  "Mutare Polytechnic",
  "Other"
]

const amenitiesList = [
  { id: "wifi", label: "Wi-Fi", icon: "📶" },
  { id: "gas-stove", label: "Gas Stove", icon: "🔥" },
  { id: "fridge", label: "Fridge", icon: "❄️" },
  { id: "freezer", label: "Freezer", icon: "🧊" },
  { id: "solar", label: "Solar Power", icon: "☀️" },
  { id: "borehole", label: "Borehole Water", icon: "💧" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "parking", label: "Parking", icon: "🚗" },
  { id: "transport", label: "Transport", icon: "🚌" },
  { id: "tiles", label: "Tiled Floors", icon: "🏠" },
  { id: "ceiling", label: "Ceiling", icon: "🏗️" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "laundry", label: "Laundry", icon: "👕" },
  { id: "garden", label: "Garden", icon: "🌿" },
  { id: "balcony", label: "Balcony", icon: "🏠" },
  { id: "aircon", label: "Air Conditioning", icon: "❄️" },
]

interface RoomType {
  id: string
  type: string
  pricePerPerson: string
  quantity: string
}

export default function EditProperty() {
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    university: "",
    gender: "",
    description: "",
    amenities: [] as string[],
    rules: "",
    contactPhone: "",
    propertyType: "apartment",
    distanceFromCampus: "",
  })
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([{ id: "1", type: "", pricePerPerson: "", quantity: "1" }])
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProperty, setIsLoadingProperty] = useState(true)

  // Load existing property data
  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return

      try {
        const supabase = createClientComponentClient()
        const { data: property, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', params.id)
          .single()

        if (error) throw error

        if (property) {
          setFormData({
            title: property.title || "",
            address: property.address_line1 || "",
            university: property.university || "",
            gender: property.gender_preference || "",
            description: property.description || "",
            amenities: property.amenities || [],
            rules: property.rules ? property.rules.join('\n') : "",
            contactPhone: property.contact_phone || "",
            propertyType: property.property_type || "apartment",
            distanceFromCampus: property.distance_from_campus?.toString() || "",
          })
          
          setExistingImages(property.images || [])
          setNewFiles([])
          setNewPreviews([])
          
          // Load existing rooms and aggregate by type to prefill quantities and pricing
          try {
            const { data: rooms, error: roomsErr } = await supabase
              .from('rooms')
              .select('room_type, monthly_rent, status')
              .eq('property_id', params.id)
            if (roomsErr) throw roomsErr
            if (rooms && rooms.length > 0) {
              const byType = (rooms as any[]).reduce((acc: any, r: any) => {
                const t = (r.room_type || '').toString()
                const price = Number(r.monthly_rent) || 0
                if (!acc[t]) acc[t] = { count: 0, min: price }
                acc[t].count += 1
                acc[t].min = acc[t].min === 0 ? price : Math.min(acc[t].min, price)
                return acc
              }, {})
              const entries = Object.entries(byType) as Array<[string, { count: number; min: number }]>
              const prefilled: RoomType[] = entries.map(([t, info], idx) => ({
                id: String(idx + 1),
                type: t,
                pricePerPerson: String(info.min),
                quantity: String(info.count),
              }))
              setRoomTypes(prefilled.length > 0 ? prefilled : [{ id: '1', type: '', pricePerPerson: '', quantity: '1' }])
            } else {
              setRoomTypes([{ id: '1', type: 'single', pricePerPerson: property.price_per_room?.toString() || '', quantity: '1' }])
            }
          } catch (e) {
            console.error('Failed to load rooms for property:', e)
            setRoomTypes([{ id: '1', type: 'single', pricePerPerson: property.price_per_room?.toString() || '', quantity: '1' }])
          }
        }
      } catch (err: any) {
        console.error("Error fetching property:", err)
        setError("Failed to load property data")
      } finally {
        setIsLoadingProperty(false)
      }
    }

    fetchProperty()
  }, [params.id])

  const addRoomType = () => {
    const newId = (roomTypes.length + 1).toString()
    setRoomTypes([...roomTypes, { id: newId, type: "", pricePerPerson: "", quantity: "1" }])
  }

  const removeRoomType = (id: string) => {
    if (roomTypes.length > 1) {
      setRoomTypes(roomTypes.filter((room) => room.id !== id))
    }
  }

  const updateRoomType = (id: string, field: keyof RoomType, value: string) => {
    setRoomTypes(roomTypes.map((room) => (room.id === id ? { ...room, [field]: value } : room)))
  }

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, amenities: [...formData.amenities, amenityId] })
    } else {
      setFormData({ ...formData, amenities: formData.amenities.filter((id) => id !== amenityId) })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    const selected = Array.from(files)
    const previews = selected.map((file) => URL.createObjectURL(file))
    setNewFiles((prev) => [...prev, ...selected])
    setNewPreviews((prev) => [...prev, ...previews])
  }

  const removeImage = (index: number) => {
    // Images displayed are [existingImages..., newPreviews...]
    if (index < existingImages.length) {
      setExistingImages(existingImages.filter((_, i) => i !== index))
    } else {
      const newIndex = index - existingImages.length
      setNewPreviews(newPreviews.filter((_, i) => i !== newIndex))
      setNewFiles(newFiles.filter((_, i) => i !== newIndex))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    if (!formData.title || !formData.address || !formData.contactPhone) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    const hasValidRoomTypes = roomTypes.some((room) => room.type && room.pricePerPerson && Number(room.quantity) > 0)
    if (!hasValidRoomTypes) {
      setError("Please add at least one room type with pricing")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClientComponentClient()
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        setError("User not authenticated. Please log in.")
        setIsLoading(false)
        return
      }

      const price_per_room = Math.min(...roomTypes.map(room => parseFloat(room.pricePerPerson || '0')).filter(n => !isNaN(n) && n > 0))
      const total_rooms = roomTypes.reduce((sum, r) => sum + (parseInt(r.quantity || '0', 10) || 0), 0)

      // Upload newly selected files (if any) to Supabase Storage and get public URLs
      let uploadedUrls: string[] = []
      if (newFiles.length > 0 && user) {
        try {
          uploadedUrls = await uploadPropertyImages(newFiles, user.id)
        } catch (uploadErr: any) {
          console.error("Image upload failed:", uploadErr)
          setError(uploadErr.message || "Failed to upload images")
          setIsLoading(false)
          return
        }
      }

      const finalImages = [...existingImages, ...uploadedUrls]

      const updatedProperty = {
        title: formData.title,
        description: formData.description,
        address_line1: formData.address,
        property_type: formData.propertyType,
        total_rooms: total_rooms,
        available_rooms: total_rooms,
        price_per_room: price_per_room,
        gender_preference: formData.gender || 'mixed',
        amenities: formData.amenities,
        images: finalImages,
        rules: formData.rules ? formData.rules.split('\n').map(rule => rule.trim()).filter(Boolean) : [],
        contact_phone: formData.contactPhone,
        university: formData.university,
        distance_from_campus: parseFloat(formData.distanceFromCampus) || 0,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update(updatedProperty)
        .eq('id', params.id)
        .eq('landlord_id', user.id)

      if (updateError) {
        // Surface common RLS errors with a clearer message
        const msg = updateError.message?.toLowerCase() || ""
        if (msg.includes('row-level security') || msg.includes('rls')) {
          throw new Error('Update blocked by security policy. Ensure you are the owner of this property and RLS policies allow updates.')
        }
        throw updateError
      }

      // Replace rooms for this property with the new specification
      try {
        // Delete existing rooms
        const { error: delErr } = await supabase
          .from('rooms')
          .delete()
          .eq('property_id', params.id)
        if (delErr) throw delErr

        // Insert new rooms based on quantities
        const roomRows: any[] = []
        const capacityFor = (t: string) => (t === 'double' ? 2 : 1)
        roomTypes.forEach(rt => {
          const qty = Math.max(0, parseInt(rt.quantity || '0', 10) || 0)
          for (let i = 1; i <= qty; i++) {
            roomRows.push({
              property_id: params.id,
              room_number: `${rt.type || 'room'}-${i}`,
              room_type: rt.type || 'room',
              capacity: capacityFor(rt.type),
              current_occupancy: 0,
              monthly_rent: parseFloat(rt.pricePerPerson || '0') || 0,
              status: 'available',
            })
          }
        })
        if (roomRows.length > 0) {
          const { error: insErr } = await supabase
            .from('rooms')
            .insert(roomRows)
          if (insErr) throw insErr
        }
      } catch (roomsOpErr: any) {
        console.error('Failed to replace rooms for property:', roomsOpErr)
        throw new Error(roomsOpErr.message || 'Failed to update rooms')
      }

      alert("Property updated successfully!")
      // Return to the previous page to avoid an extra, redundant redirect
      router.back()
    } catch (err: any) {
      console.error("Error updating property:", err.message, err.details, err.hint)
      setError(err.message || "Failed to update property. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingProperty) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2">Loading property data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/landlord/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">Linkier</h1>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <Card>
            <CardHeader>
              <CardTitle>Edit Property</CardTitle>
              <CardDescription>Update your property listing information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="title">Property Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Modern Student Accommodation near UZ"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone Number *</Label>
                    <Input
                      id="contactPhone"
                      placeholder="e.g., +263 77 123 4567"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="propertyType">Property Type</Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(value) => setFormData({ ...formData, propertyType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="hostel">Hostel</SelectItem>
                        <SelectItem value="boarding-house">Boarding House</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender Preference</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male Only</SelectItem>
                        <SelectItem value="female">Female Only</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university">University *</Label>
                    <Select
                      value={formData.university}
                      onValueChange={(value) => setFormData({ ...formData, university: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent>
                        {zimbabweUniversities.map((university) => (
                          <SelectItem key={university} value={university}>
                            {university}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distanceFromCampus">Distance from Campus (km) *</Label>
                    <Input
                      id="distanceFromCampus"
                      type="number"
                      placeholder="e.g., 2.5"
                      value={formData.distanceFromCampus}
                      onChange={(e) => setFormData({ ...formData, distanceFromCampus: e.target.value })}
                      min="0"
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Address *</h3>
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      placeholder="e.g., 123 Samora Machel Ave, Harare"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Room Types */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Room Types & Pricing</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addRoomType}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Room Type
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {roomTypes.map((room, index) => (
                      <div key={room.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor={`room-type-${room.id}`}>Room Type *</Label>
                          <Select
                            value={room.type}
                            onValueChange={(value) => updateRoomType(room.id, "type", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select room type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single Room</SelectItem>
                              <SelectItem value="double">Double Room</SelectItem>
                              <SelectItem value="dormitory">Dormitory (4+ people)</SelectItem>
                              <SelectItem value="bedsitter">Bedsitter</SelectItem>
                              <SelectItem value="one-bedroom">One Bedroom</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`room-price-${room.id}`}>Price per Month (USD) *</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              id={`room-price-${room.id}`}
                              type="number"
                              placeholder=""
                              value={room.pricePerPerson}
                              onChange={(e) => updateRoomType(room.id, "pricePerPerson", e.target.value)}
                              min="0"
                              step="1"
                              className="pl-8"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`room-quantity-${room.id}`}>Quantity *</Label>
                          <Input
                            id={`room-quantity-${room.id}`}
                            type="number"
                            placeholder=""
                            value={room.quantity}
                            onChange={(e) => updateRoomType(room.id, "quantity", e.target.value)}
                            min="1"
                            step="1"
                            required
                          />
                        </div>
                        <div className="flex items-end">
                          {roomTypes.length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => removeRoomType(room.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {amenitiesList.map((amenity) => (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={amenity.id}
                          checked={formData.amenities.includes(amenity.id)}
                          onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked as boolean)}
                        />
                        <Label htmlFor={amenity.id} className="text-sm">
                          {amenity.icon} {amenity.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rules">Rules & Conditions</Label>
                  <textarea
                    id="rules"
                    className="w-full min-h-[120px] p-3 border border-border rounded-md resize-none"
                    placeholder="Enter each rule on a new line"
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[120px] p-3 border border-border rounded-md resize-none"
                    placeholder="Describe your property"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Images</h3>
                  <p className="text-sm text-muted-foreground">Upload high-quality images to attract more students</p>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="relative">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button type="button" variant="outline" className="bg-transparent">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Upload from Gallery
                        </Button>
                      </div>
                    </div>

                    {[...existingImages, ...newPreviews].length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[...existingImages, ...newPreviews].map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image || "/placeholder.svg"}
                              alt={`Property image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                            {index === 0 && <Badge className="absolute bottom-2 left-2">Main Photo</Badge>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button type="button" variant="outline" asChild>
                    <Link href={`/landlord/property/${params.id}`}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating Property..." : "Update Property"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
