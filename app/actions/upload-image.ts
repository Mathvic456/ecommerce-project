"use server"

import { getAdminClient } from "@/lib/supabase/admin"
import { v4 as uuidv4 } from "uuid"

export async function uploadProductImage(formData: FormData): Promise<string> {
  try {
    const file = formData.get("file") as File
    
    if (!file || !(file instanceof File)) {
      throw new Error("No file provided")
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      throw new Error("File size must be less than 5MB")
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const filename = `${uuidv4()}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    const filepath = `products/${filename}`

    const adminClient = getAdminClient()

    // Upload to Supabase Storage
    const { data, error } = await adminClient.storage.from("product_images").upload(filepath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("[v0] Supabase storage error:", error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = adminClient.storage.from("product_images").getPublicUrl(filepath)

    if (!publicUrl) {
      throw new Error("Failed to generate public URL")
    }

    return publicUrl
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during upload"
    console.error("[v0] Upload error:", errorMessage)
    throw new Error(errorMessage)
  }
}
