"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Users,
  Star,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Car,
  Dumbbell,
  Utensils,
  Shield,
  Waves,
  Home,
  Snowflake,
  Shirt,
  TreePine,
  Phone,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react"

// Define the Property type based on your database schema
interface Property {
  id: number;
  title: string;
  description: string;
  monthly_rent: number;
  location: string;
  university: string;
  rooms: number;
  gender_preference: string;
  amenities: string[];
  images: string[];
  // Add other fields from your properties table here
}

const amenityIcons: Record<string, any> = {
  WiFi: Wifi,
  Parking: Car,
  Gym: Dumbbell,
  Kitchen: Utensils,
  Security: Shield,
  "Swimming Pool": Waves,
  Balcony: Home,
  "Air Conditioning": Snowflake,
  Laundry: Shirt,
  Garden: TreePine,
  "Gas Stove": Utensils,
  "Solar Power": Home,
  "Water Tank": Waves,
}

export default function LandlordPropertyView() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClientComponentClient()

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) {
        setError("Property ID is missing.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", params.id)
          .single()

        if (error) {
          throw error
        }

        if (data) {
          setProperty(data)
        } else {
          setError("Property not found.")
        }
      } catch (err: any) {
        console.error("Error fetching property:", err)
        setError(err.message || "Failed to fetch property data.")
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [params.id, supabase])

  const nextImage = () => {
    if (property && property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length)
    }
  }

  const prevImage = () => {
    if (property && property.images && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length)
    }
  }

  const handleEdit = () => {
    if (property) {
      router.push(`/landlord/properties/edit/${property.id}`)
    }
  }

  const handleDelete = async () => {
    if (!property) return

    try {
      setIsDeleting(true)
      const { error } = await supabase.from("properties").delete().eq("id", property.id)

      if (error) {
        throw error
      }
      
      alert("Property deleted successfully!")
      router.push("/landlord/dashboard")
    } catch (error) {
      console.error("Error deleting property:", error)
      alert("Failed to delete property. Please try again.")
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2">Loading property details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button asChild>
          <Link href="/landlord/dashboard">Go Back</Link>
        </Button>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
        <p className="text-muted-foreground mb-4">The property you are looking for does not exist.</p>
        <Button asChild>
          <Link href="/landlord/dashboard">Go Back</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/landlord/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Linkier</h1>
                <p className="text-xs text-muted-foreground">Landlord Dashboard</p>
              </div>
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Property
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              
              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      <DialogTitle>Delete Property</DialogTitle>
                    </div>
                    <DialogDescription className="pt-2">
                      Are you sure you want to delete <span className="font-semibold">{property.title}</span>? 
                      This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="gap-2">
                      {isDeleting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                      ) : (
                        <><Trash2 className="w-4 h-4" /> Delete Property</>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Link
          href="/landlord/dashboard"
          className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <div className="relative">
                <img
                  src={property.images && property.images.length > 0 ? property.images[currentImageIndex] : "/placeholder.svg"}
                  alt={`${property.title} - Image ${currentImageIndex + 1}`}
                  className="w-full h-96 object-cover"
                />
                {property.images && property.images.length > 1 && (
                  <>
                    <Button variant="ghost" size="sm" className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white" onClick={prevImage}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white" onClick={nextImage}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {property.images.map((_, index) => (
                        <button
                          key={index}
                          className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                          onClick={() => setCurrentImageIndex(index)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{property.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground mt-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-2xl font-bold text-primary">
                      <DollarSign className="w-6 h-6 mr-1" />
                      {`R${property.monthly_rent}`}
                      <span className="text-sm font-normal text-muted-foreground ml-1">/month</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {`${property.rooms} rooms`}
                  </div>
                  <Badge variant="secondary">{property.gender_preference}</Badge>
                  <span className="text-muted-foreground">Near {property.university}</span>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{property.description}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities && property.amenities.map((amenity) => {
                      const IconComponent = amenityIcons[amenity]
                      return (
                        <div key={amenity} className="flex items-center space-x-2">
                          {IconComponent && <IconComponent className="w-4 h-4 text-primary" />}
                          <span className="text-sm">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full bg-transparent" onClick={handleEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Property Details
                </Button>
                <Button variant="outline" className="w-full bg-transparent">
                  <Users className="w-4 h-4 mr-2" />
                  View Rental Requests
                </Button>
                <Button variant="destructive" className="w-full" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Property
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
