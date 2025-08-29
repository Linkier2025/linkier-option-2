'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type RentalRequestDialogProps = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  propertyTitle: string
  onSubmit: (data: {
    fullName: string
    email: string
    phone: string
    university?: string | null
    yearOfStudy?: string | null
    message: string
  }) => Promise<void> | void
}

export function RentalRequestDialog({ isOpen, onOpenChange, propertyTitle, onSubmit }: RentalRequestDialogProps) {
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState<{
    first_name: string
    surname: string
    email: string
    phone: string | null
    university: string | null
    year_of_study: string | null
  } | null>(null)
  const [message, setMessage] = useState(`I am interested in renting ${propertyTitle}. `)
  const [error, setError] = useState<string | null>(null)

  const fullName = useMemo(() => {
    if (!profile) return ''
    return `${profile.first_name} ${profile.surname}`.trim()
  }, [profile])

  useEffect(() => {
    if (!isOpen) return
    let isMounted = true
    setError(null)
    ;(async () => {
      try {
        const { data: auth } = await supabase.auth.getUser()
        const email = auth?.user?.email
        if (!email) throw new Error('Not authenticated')
        const { data, error: userErr } = await supabase
          .from('profiles')
          .select('first_name, surname, email, phone, university, year_of_study')
          .eq('email', email)
          .single()
        if (userErr) throw userErr
        if (isMounted) setProfile(data)
      } catch (e: any) {
        console.error('Failed to load profile', e)
        if (isMounted) setError('Failed to load your profile')
      }
    })()
    return () => {
      isMounted = false
    }
  }, [isOpen, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setIsLoading(true)
    try {
      await onSubmit({
        fullName,
        email: profile.email,
        phone: profile.phone || '',
        university: profile.university,
        yearOfStudy: profile.year_of_study,
        message,
      })
      onOpenChange(false)
    } catch (err) {
      console.error('Submit failed', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Request to Rent: {propertyTitle}</DialogTitle>
            <DialogDescription>
              Your contact details are loaded from your profile. You can only write a message to the landlord.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Read-only profile fields */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Full Name</Label>
              <div className="col-span-3 text-sm text-muted-foreground">{fullName || '—'}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Email</Label>
              <div className="col-span-3 text-sm text-muted-foreground">{profile?.email || '—'}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Phone</Label>
              <div className="col-span-3 text-sm text-muted-foreground">{profile?.phone || '—'}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">University</Label>
              <div className="col-span-3 text-sm text-muted-foreground">{profile?.university || '—'}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Year of Study</Label>
              <div className="col-span-3 text-sm text-muted-foreground">{profile?.year_of_study || '—'}</div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="message" className="text-right mt-2">
                Message
              </Label>
              <Textarea
                id="message"
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="col-span-3 min-h-[120px]"
                required
              />
              {error && <div className="col-span-4 text-sm text-red-600">{error}</div>}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !profile}>
              {isLoading ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
