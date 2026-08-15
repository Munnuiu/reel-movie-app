import { supabase } from "./supabase"
import type { Profile } from "../types"

type ProfileRow = {
  id: string
  email: string | null
  full_name: string | null
  role: "viewer" | "admin"
}

function fromRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role,
  }
}

export async function getProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle()
  if (error) throw error
  return data ? fromRow(data as ProfileRow) : null
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}
