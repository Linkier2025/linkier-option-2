"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { ArrowLeft, X, Camera, ImageIcon, Plus, Trash2 } from "lucide-react"

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

export default function AddProperty() {
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
  // Previews for UI
  const [images, setImages] = useState<string[]>([])
  // Raw files to upload
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [landlordProfile, setLandlordProfile] = useState<any>(null)

  // Auto-populate landlord contact details
  useEffect(() => {
    const fetchLandlordProfile = async () => {
      try {
        const supabase = createClientComponentClient()
        const { data: { user }, error: userError } = await supabase.auth.getUser()

        if (userError || !user) return

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('phone, full_name')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          return
        }

        setLandlordProfile(profile)
        if (profile?.phone) {
          setFormData(prev => ({
            ...prev,
            contactPhone: profile.phone
          }))
        }
      } catch (error) {
        console.error('Error fetching landlord profile:', error)
      }
    }

    fetchLandlordProfile()
  }, [])

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

    setImageFiles((prev) => [...prev, ...selected])
    setImages((prev) => [...prev, ...previews])
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
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

    // Validate room types
    const hasValidRoomTypes = roomTypes.some((room) => room.type && room.pricePerPerson && Number(room.quantity) > 0)
    if (!hasValidRoomTypes) {
      setError("Please add at least one room type with pricing")
      setIsLoading(false)
      return
    }

    if (images.length === 0) {
      setError("Please upload at least one property image")
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

      // 1) Upload images to Supabase Storage and get public URLs
      let publicImageUrls: string[] = []
      try {
        // Ensure you have a public bucket named 'property-images' in Supabase
        const uploads = await Promise.all(imageFiles.map(async (file, idx) => {
          const ext = file.name.split('.').pop() || 'jpg'
          const path = `${user.id}/${Date.now()}_${idx}.${ext}`
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(path, file, { upsert: false, contentType: file.type })
          if (uploadError) throw uploadError
          const { data } = supabase.storage.from('property-images').getPublicUrl(path)
          return data.publicUrl
        }))
        publicImageUrls = uploads
      } catch (imgErr: any) {
        console.error('Image upload failed:', imgErr)
        setError('Image upload failed. Please try again.')
        setIsLoading(false)
        return
      }

      const newProperty = {
        landlord_id: user.id,
        title: formData.title,
        description: formData.description,
        address_line1: formData.address,
        property_type: formData.propertyType,
        total_rooms: total_rooms,
        available_rooms: total_rooms,
        price_per_room: price_per_room,
        gender_preference: formData.gender || 'mixed',
        amenities: formData.amenities,
        images: publicImageUrls,
        rules: formData.rules ? formData.rules.split('\n').map(rule => rule.trim()).filter(Boolean) : [],
        contact_phone: formData.contactPhone,
        university: formData.university,
        distance_from_campus: parseFloat(formData.distanceFromCampus) || 0,
        is_active: true,
        verification_status: 'pending',
        country: 'Zimbabwe',
        is_furnished: false,
        minimum_stay_months: 12
      }

      const { data: createdProps, error: insertError } = await supabase
        .from('properties')
        .insert([newProperty])
        .select('id')

      if (insertError) {
        throw insertError
      }

      const propertyId = createdProps?.[0]?.id
      if (!propertyId) {
        throw new Error('Failed to retrieve new property id')
      }

      // 2) Create rooms for each room type/quantity
      const roomRows: any[] = []
      const capacityFor = (t: string) => (t === 'double' ? 2 : 1)
      roomTypes.forEach(rt => {
        const qty = Math.max(0, parseInt(rt.quantity || '0', 10) || 0)
        for (let i = 1; i <= qty; i++) {
          roomRows.push({
            property_id: propertyId,
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
        const { error: roomsErr } = await supabase
          .from('rooms')
          .insert(roomRows)
        if (roomsErr) {
          // Attempt rollback: delete the created property to avoid inconsistent state
          await supabase.from('properties').delete().eq('id', propertyId)
          throw roomsErr
        }
      }

      // Show success message with property details
      const successMessage = `
Property "${formData.title}" created successfully!

📍 Address: ${formData.address}
🏫 University: ${formData.university}
📏 Distance: ${formData.distanceFromCampus}km from campus
📞 Contact: ${formData.contactPhone}
🏠 Type: ${formData.propertyType}
👥 Gender: ${formData.gender || 'Mixed'}
💰 Starting from: $${price_per_room}/month
🛏️ Rooms: ${total_rooms} total`
      
      alert(successMessage)
      window.location.href = "/landlord/dashboard?tab=properties"
    } catch (err: any) {
      console.error("Error creating property:", err.message, err.details, err.hint)
      setError(err.message || "Failed to create property. Please try again.")
    } finally {
      setIsLoading(false)
    }
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
          <Link
            href="/landlord/dashboard"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Add New Boarding House</CardTitle>
              <CardDescription>Create a detailed boarding house listing to attract student tenants</CardDescription>
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
                    {landlordProfile?.phone && (
                      <p className="text-sm text-muted-foreground">
                        Auto-populated from your profile
                      </p>
                    )}
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
                    <p className="text-sm text-muted-foreground">
                      Distance from the main campus in kilometers
                    </p>
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
                    placeholder=""
                    value={formData.rules}
                    onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    className="w-full min-h-[120px] p-3 border border-border rounded-md resize-none"
                    placeholder=""
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Images */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Property Images *</h3>
                  <p className="text-sm text-muted-foreground">Upload high-quality images to attract more students</p>

                  <div className="space-y-4">
                    {/* Upload buttons */}
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
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button type="button" variant="outline" className="bg-transparent">
                          <Camera className="w-4 h-4 mr-2" />
                          Take Photo
                        </Button>
                      </div>
                    </div>

                    {/* Image preview */}
                    {images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {images.map((image, index) => (
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
                    <Link href="/landlord/dashboard">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating Property..." : "Create Property"}
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
