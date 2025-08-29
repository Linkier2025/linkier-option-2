import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const supabase = createClientComponentClient()

// Generate a UUID safely across environments (browser/older runtimes)
function getSafeUUID(): string {
  const g: any = globalThis as any
  if (g?.crypto?.randomUUID && typeof g.crypto.randomUUID === 'function') {
    return g.crypto.randomUUID()
  }
  if (g?.crypto?.getRandomValues) {
    // RFC4122 version 4 compliant fallback
    const bytes = new Uint8Array(16)
    g.crypto.getRandomValues(bytes)
    bytes[6] = (bytes[6] & 0x0f) | 0x40 // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80 // variant
    const toHex = (n: number) => n.toString(16).padStart(2, '0')
    const b = Array.from(bytes, toHex)
    return `${b[0]}${b[1]}${b[2]}${b[3]}-${b[4]}${b[5]}-${b[6]}${b[7]}-${b[8]}${b[9]}-${b[10]}${b[11]}${b[12]}${b[13]}${b[14]}${b[15]}`
  }
  // Last-resort non-crypto fallback
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`
}

export async function uploadPropertyImages(images: File[], userId: string) {
  const imageUrls: string[] = []
  
  for (const image of images) {
    try {
      // Create a unique file path with user ID and timestamp
      const fileExt = image.name.split('.').pop() || 'jpg'
      const fileName = `${userId}/${getSafeUUID()}.${fileExt}`
      // Using 'properties' bucket (policies expect first folder = auth.uid)
      const filePath = `${fileName}`

      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        throw new Error(`Failed to upload image: ${uploadError.message}`)
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('properties')
        .getPublicUrl(filePath)

      imageUrls.push(publicUrl)
    } catch (error) {
      console.error('Error in upload loop:', error)
      throw error
    }
  }

  return imageUrls
}
