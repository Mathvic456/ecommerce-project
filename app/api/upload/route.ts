import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("[v0] Upload API called")
    console.log("[v0] Supabase URL exists:", !!supabaseUrl)
    console.log("[v0] Service Role Key exists:", !!supabaseServiceKey)

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[v0] Missing Supabase environment variables")
      return NextResponse.json(
        { 
          error: "Server configuration error: Missing Supabase credentials. Please ensure SUPABASE_SERVICE_ROLE_KEY is set in environment variables." 
        }, 
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log("[v0] File received:", file.name, "Type:", file.type, "Size:", file.size)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Create admin client directly in the route
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Convert File to Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const filename = `${uuidv4()}-${Date.now()}-${file.name.replace(/\s+/g, "-")}`
    const filepath = `products/${filename}`

    console.log("[v0] Attempting upload to path:", filepath)

    // Upload to Supabase Storage
    const { data, error } = await adminClient.storage.from("product_images").upload(filepath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("[v0] Supabase storage error:", JSON.stringify(error))
      
      // Check if bucket doesn't exist
      if (error.message.includes("Bucket not found") || error.message.includes("not found")) {
        return NextResponse.json(
          { error: "Storage bucket 'product_images' not found. Please run the storage setup script." }, 
          { status: 500 }
        )
      }
      
      return NextResponse.json({ error: `Failed to upload image: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Upload successful:", data)

    // Get public URL
    const {
      data: { publicUrl },
    } = adminClient.storage.from("product_images").getPublicUrl(filepath)

    if (!publicUrl) {
      return NextResponse.json({ error: "Failed to generate public URL" }, { status: 500 })
    }

    console.log("[v0] Public URL generated:", publicUrl)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during upload"
    console.error("[v0] Upload error:", errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
