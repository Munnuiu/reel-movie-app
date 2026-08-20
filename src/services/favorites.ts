import { supabase } from "./supabase"

type FavoriteRow = { movie_id: string }

export async function listFavoriteMovieIds(userId: string): Promise<string[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from("user_favorites")
    .select("movie_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return ((data ?? []) as FavoriteRow[]).map((favorite) => favorite.movie_id)
}

export async function setFavoriteMovie(userId: string, movieId: string, shouldSave: boolean) {
  if (!supabase) return

  if (shouldSave) {
    const { error } = await supabase.from("user_favorites").upsert(
      { user_id: userId, movie_id: movieId },
      { onConflict: "user_id,movie_id" },
    )
    if (error) throw error
    return
  }

  const { error } = await supabase.from("user_favorites").delete().eq("user_id", userId).eq("movie_id", movieId)
  if (error) throw error
}
