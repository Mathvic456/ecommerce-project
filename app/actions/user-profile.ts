"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function saveUserProfile(
  firstName: string,
  lastName: string,
  phoneNumber: string,
  streetAddress?: string,
  city?: string,
  country?: string,
  postalCode?: string,
) {
  console.log("[v0] saveUserProfile called with:", { firstName, lastName, phoneNumber, city, country })
  
  const supabase = await createClient()
  const { data: user, error: authError } = await supabase.auth.getUser()

  console.log("[v0] Auth check - user:", user?.user?.id, "error:", authError?.message)

  if (authError || !user.user) {
    console.log("[v0] User not authenticated - cannot save profile yet")
    return {
      success: false,
      message: "User not authenticated. Profile will be saved after email confirmation.",
    }
  }

  try {
    console.log("[v0] Saving profile for user:", user.user.id)
    const { error: profileError } = await supabase.from("user_profiles").upsert(
      {
        id: user.user.id,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )

    if (profileError) {
      console.log("[v0] Profile insert error:", profileError)
      throw profileError
    }

    if (streetAddress && city && country) {
      console.log("[v0] Saving address for user:", user.user.id)
      const { error: addressError } = await supabase.from("user_addresses").insert([
        {
          user_id: user.user.id,
          street_address: streetAddress,
          city,
          country,
          postal_code: postalCode || "",
          is_default: true,
        },
      ])

      if (addressError && addressError.code !== "23505") {
        console.log("[v0] Address insert error:", addressError)
        throw addressError
      }
    }

    console.log("[v0] User profile and address saved successfully")
    return { success: true }
  } catch (error) {
    console.log("[v0] Error in saveUserProfile:", error)
    throw error
  }
}

export async function getUserProfile() {
  const supabase = await createClient()
  const { data: user, error: authError } = await supabase.auth.getUser()

  if (authError || !user.user) {
    console.log("[v0] Auth error in getUserProfile:", authError)
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", user.user.id).single()

  if (error && error.code !== "PGRST116") {
    console.log("[v0] Profile select error:", error)
    throw error
  }
  return data
}

export async function addUserAddress(
  streetAddress: string,
  city: string,
  country: string,
  postalCode: string,
  isDefault = false,
) {
  const supabase = await createClient()
  const { data: user, error: authError } = await supabase.auth.getUser()

  if (authError || !user.user) {
    console.log("[v0] Auth error in addUserAddress:", authError)
    throw new Error("User not authenticated")
  }

  if (isDefault) {
    const { error: updateError } = await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.user.id)
    if (updateError) {
      console.log("[v0] Update default address error:", updateError)
      throw updateError
    }
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .insert([
      {
        user_id: user.user.id,
        street_address: streetAddress,
        city,
        country,
        postal_code: postalCode,
        is_default: isDefault,
      },
    ])
    .select()

  if (error) {
    console.log("[v0] Address insert error:", error)
    throw error
  }
  return data?.[0]
}

export async function getUserAddresses() {
  const supabase = await createClient()
  const { data: user, error: authError } = await supabase.auth.getUser()

  if (authError || !user.user) {
    console.log("[v0] Auth error in getUserAddresses:", authError)
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("user_addresses")
    .select("*")
    .eq("user_id", user.user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) {
    console.log("[v0] Addresses select error:", error)
    throw error
  }
  return data || []
}

export async function updateUserAddress(
  addressId: string,
  streetAddress: string,
  city: string,
  country: string,
  postalCode: string,
  isDefault = false,
) {
  const supabase = await createClient()
  const { data: user, error: authError } = await supabase.auth.getUser()

  if (authError || !user.user) {
    console.log("[v0] Auth error in updateUserAddress:", authError)
    throw new Error("User not authenticated")
  }

  if (isDefault) {
    const { error: updateError } = await supabase
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", user.user.id)
    if (updateError) {
      console.log("[v0] Update default address error:", updateError)
      throw updateError
    }
  }

  const { error } = await supabase
    .from("user_addresses")
    .update({
      street_address: streetAddress,
      city,
      country,
      postal_code: postalCode,
      is_default: isDefault,
      updated_at: new Date().toISOString(),
    })
    .eq("id", addressId)
    .eq("user_id", user.user.id)

  if (error) {
    console.log("[v0] Address update error:", error)
    throw error
  }
  return { success: true }
}

export async function deleteUserAddress(addressId: string) {
  const supabase = await createClient()
  const { data: user, error: authError } = await supabase.auth.getUser()

  if (authError || !user.user) {
    console.log("[v0] Auth error in deleteUserAddress:", authError)
    throw new Error("User not authenticated")
  }

  const { error } = await supabase.from("user_addresses").delete().eq("id", addressId).eq("user_id", user.user.id)

  if (error) {
    console.log("[v0] Address delete error:", error)
    throw error
  }
  return { success: true }
}
