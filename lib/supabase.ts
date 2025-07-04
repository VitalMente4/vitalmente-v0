import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript
export interface Profile {
  id: string
  phone?: string
  full_name: string
  age?: number
  weight?: number
  height?: number
  gender?: "male" | "female" | "other"
  activity_level?: "sedentary" | "light" | "moderate" | "active" | "very_active"
  physical_goals?: string[]
  emotional_goals?: string[]
  dietary_restrictions?: string[]
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  date: string
  calories_consumed: number
  protein_consumed: number
  carbs_consumed: number
  fats_consumed: number
  workout_completed: boolean
  meditation_completed: boolean
  water_intake: number
  weight_log?: number
  mood_score?: number
  notes?: string
}

export interface UserStreak {
  id: string
  user_id: string
  streak_type: "nutrition" | "exercise" | "meditation" | "overall"
  current_streak: number
  longest_streak: number
  last_activity_date: string
}

// Funciones de utilidad
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const getProfile = async (userId: string) => {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  return { data, error }
}

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single()

  return { data, error }
}

export const getTodayProgress = async (userId: string) => {
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("date", today)
    .single()

  return { data, error }
}

export const updateTodayProgress = async (userId: string, updates: Partial<UserProgress>) => {
  const today = new Date().toISOString().split("T")[0]

  const { data, error } = await supabase
    .from("user_progress")
    .upsert({
      user_id: userId,
      date: today,
      ...updates,
    })
    .select()
    .single()

  return { data, error }
}

export const getUserStreaks = async (userId: string) => {
  const { data, error } = await supabase.from("user_streaks").select("*").eq("user_id", userId)

  return { data, error }
}

export const updateStreak = async (userId: string, streakType: string) => {
  const { error } = await supabase.rpc("update_streak", {
    user_uuid: userId,
    streak_type_param: streakType,
  })

  return { error }
}

export const getDailyTip = async () => {
  const { data, error } = await supabase
    .from("daily_tips")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  return { data, error }
}

export const getSupplementPromotions = async (userGoals?: string[]) => {
  let query = supabase.from("supplement_promotions").select("*").eq("active", true)

  if (userGoals && userGoals.length > 0) {
    query = query.overlaps("target_goals", userGoals)
  }

  const { data, error } = await query.limit(3)

  return { data, error }
}

export const trackPromotionInteraction = async (
  userId: string,
  promotionId: string,
  interactionType: "view" | "click" | "purchase",
) => {
  const { error } = await supabase.from("promotion_interactions").insert({
    user_id: userId,
    promotion_id: promotionId,
    interaction_type: interactionType,
  })

  return { error }
}
