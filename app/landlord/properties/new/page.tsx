"use client"

import type React from "react"
import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { uploadPropertyImages } from "@/lib/storage"
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
import { toast } from "sonner" // Import toast for notifications

const amenitiesList = [
  { id: "wifi", label: "Wi-Fi", icon: "📶" },
  { id: "gas-stove", label: "Gas Stove", icon: "🔥" },
  { id: "fridge", label: "Fridge", icon: "❄️" },
  { id: "freezer", label: "Freezer", icon: "🧊" },
  { id: "solar", label: "Solar Power", icon: "☀️" },
  { id: "borehole", label: "Borehole Water", icon: "💧" },
  { id: "security", label: "Security", icon: "🔒" },
  { id: "parking", label: "Parking", icon: "🚗" },
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
}

export default function AddProperty() {
  const supabase = createClientComponentClient()
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    distanceFromUniversity: "",
    university: "",
    gender: "",
    description: "",
    amenities: [] as string[],
    rules: "",
    contactPhone: "",
  })
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([{ id: "1", type: "", pricePerPerson: "" }])
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const addRoomType = () => {
    const newId = (roomTypes.length + 1).toString()
    setRoomTypes([...roomTypes, { id: newId, type: "", pricePerPerson: "" }])
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
    if (files) {
      const newImages = Array.from(files)
      setImages([...images, ...newImages])
      const newImagePreviews = newImages.map((file) => URL.createObjectURL(file))
      setImagePreviews([...imagePreviews, ...newImagePreviews])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Basic form validation
    if (!formData.title || !formData.location || roomTypes.length === 0 || images.length === 0) {
      setError("Please fill in all required fields and upload at least one image.")
      setIsLoading(false)
      return
    }

    // Validate room types have price and type
    const hasValidRoomTypes = roomTypes.every((room) => room.type && room.pricePerPerson)
    if (!hasValidRoomTypes) {
      setError("Please ensure all room types have a type and price per person.")
      setIsLoading(false)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("You must be logged in to create a property.")
      }

      // 1. Upload images to Supabase Storage using our new utility
      const imageUrls = await uploadPropertyImages(images, user.id)

      // 2. Prepare property data for insertion
      // Assuming location is "Address Line 1, City"
      const locationParts = formData.location.split(",").map((s) => s.trim())
      const address_line1 = locationParts[0] || ""
      const city = locationParts[1] || ""

      // Calculate average price per room
      const totalPrices = roomTypes.reduce((sum, room) => sum + Number(room.pricePerPerson), 0)
      const averagePricePerRoom = roomTypes.length > 0 ? totalPrices / roomTypes.length : 0

      const newProperty = {
        landlord_id: user.id,
        title: formData.title,
        description: formData.description,
        address_line1: address_line1,
        city: city,
        // These fields are not directly from the form but are required by the schema or derived
        state: null, // Not in form
        postal_code: null, // Not in form
        country: "Kenya", // Default value as per schema
        latitude: null, // Not in form
        longitude: null, // Not in form
        property_type: "boarding_house", // Hardcoded as per discussion
        total_rooms: roomTypes.length,
        available_rooms: roomTypes.length, // Assuming all rooms are available initially
        price_per_room: averagePricePerRoom,
        amenities: formData.amenities,
        images: imageUrls,
        rules: formData.rules.split("\n").filter(rule => rule.trim() !== ""), // Split rules by newline
        // is_active and verification_status have default values in schema
      }

      console.log("New Property Object:", newProperty);

      // 3. Insert property data into Supabase
      const { error: insertError } = await supabase.from("properties").insert(newProperty)

      if (insertError) {
        throw insertError
      }

      // 4. Success feedback and form reset
      toast.success("Property created successfully! Redirecting to dashboard...")
      // Clear form
      setFormData({
        title: "",
        location: "",
        distanceFromUniversity: "",
        university: "",
        gender: "",
        description: "",
        amenities: [],
        rules: "",
        contactPhone: "",
      })
      setRoomTypes([{ id: "1", type: "", pricePerPerson: "" }])
      setImages([])
      setImagePreviews([])

      // Redirect after a short delay to allow toast to be seen
      setTimeout(() => {
        window.location.href = "/landlord/dashboard?tab=properties"
      }, 2000)
    } catch (error: any) {
      console.error("Error creating property:", error)
      setError(error.message || "An unexpected error occurred.")
      toast.error("Failed to create property.")
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
                      placeholder="e.g., Comfortable Home for Girls in Mt Pleasant"                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location (e.g., Address, City) *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., 123 Main St, Harare"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>

                  {/* Removed distanceFromUniversity, university, gender, contactPhone from being saved to DB */}
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance from University</Label>
                    <Input
                      id="distance"
                      placeholder="e.g., 5 minutes walk, 2km drive"
                      value={formData.distanceFromUniversity}
                      onChange={(e) => setFormData({ ...formData, distanceFromUniversity: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university">Nearest University</Label>
                    <Select
                      value={formData.university}
                      onValueChange={(value) => setFormData({ ...formData, university: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select university" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="university-of-zimbabwe">University of Zimbabwe</SelectItem>
                        <SelectItem value="midlands-state-university">Midlands State University</SelectItem>
                        <SelectItem value="national-university-of-science-technology">
                          National University of Science & Technology
                        </SelectItem>
                        <SelectItem value="africa-university">Africa University</SelectItem>
                        <SelectItem value="chinhoyi-university-of-technology">
                          Chinhoyi University of Technology
                        </SelectItem>
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
                        <SelectItem value="boys">Boys Only</SelectItem>
                        <SelectItem value="girls">Girls Only</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone Number</Label>
                    <Input
                      id="contactPhone"
                      placeholder="e.g., +263 77 123 4567"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Room Types & Pricing *</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addRoomType}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Room Type
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {roomTypes.map((room, index) => (
                      <div key={room.id} className="flex gap-3 items-end">
                        <div className="flex-1">
                          <Label htmlFor={`room-type-${room.id}`}>Room Type</Label>
                          <Input
                            id={`room-type-${room.id}`}
                            placeholder="e.g., Single Room, Shared Room"
                            value={room.type}
                            onChange={(e) => updateRoomType(room.id, "type", e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`room-price-${room.id}`}>Price per Person (USD)</Label>
                          <Input
                            id={`room-price-${room.id}`}
                            type="number"
                            placeholder="150"
                            value={room.pricePerPerson}
                            onChange={(e) => updateRoomType(room.id, "pricePerPerson", e.target.value)}
                          />
                        </div>
                        {roomTypes.length > 1 && (
                          <Button type="button" variant="outline" size="sm" onClick={() => removeRoomType(room.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
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
                  <Label htmlFor="rules">Rules & Conditions (one rule per line)</Label>
                  <textarea
                    id="rules"
                    className="w-full min-h-[120px] p-3 border border-border rounded-md resize-none"
                    placeholder="e.g., Curfew at 10 PM\nNo visitors after 8 PM\nNo smoking\nNo alcohol"
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
                    placeholder="Describe your boarding house, its features, and what makes it special for students..."
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
                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {imagePreviews.map((image, index) => (
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
