import { demoMovies } from "../data/movies"
import { isSupabaseConfigured, supabase } from "./supabase"
import type { Movie, MovieInput } from "../types"

const LOCAL_KEY = "reel.admin.movies"

type MovieRow = {
  id: string
  title: string
  original_title: string
  year: number
  genres: string[]
  rating: number
  runtime: string
  age_rating: string
  director: string
  cast: string[]
  description: string
  poster_url: string
  backdrop_url: string
  trailer_length: string
  featured: boolean
  trending: boolean
  progress: number | null
  status: "draft" | "published"
  price_mnt: number
  playback_url: string | null
}

function getLocalMovies() {
  const stored = window.localStorage.getItem(LOCAL_KEY)
  if (!stored) return demoMovies

  try {
    return JSON.parse(stored) as Movie[]
  } catch {
    return demoMovies
  }
}

function saveLocalMovies(movies: Movie[]) {
  window.localStorage.setItem(LOCAL_KEY, JSON.stringify(movies))
}

function fromRow(row: MovieRow): Movie {
  return {
    id: row.id,
    title: row.title,
    originalTitle: row.original_title,
    year: row.year,
    genres: row.genres,
    rating: row.rating,
    runtime: row.runtime,
    ageRating: row.age_rating,
    director: row.director,
    cast: row.cast,
    description: row.description,
    poster: row.poster_url,
    backdrop: row.backdrop_url,
    trailer: row.trailer_length,
    featured: row.featured,
    trending: row.trending,
    progress: row.progress ?? undefined,
    status: row.status,
    priceMnt: row.price_mnt,
    playbackUrl: row.playback_url ?? undefined,
  }
}

function toRow(movie: MovieInput) {
  return {
    title: movie.title,
    original_title: movie.originalTitle,
    year: movie.year,
    genres: movie.genres,
    rating: movie.rating,
    runtime: movie.runtime,
    age_rating: movie.ageRating,
    director: movie.director,
    cast: movie.cast,
    description: movie.description,
    poster_url: movie.poster,
    backdrop_url: movie.backdrop,
    trailer_length: movie.trailer,
    featured: movie.featured,
    trending: movie.trending,
    progress: movie.progress ?? null,
    status: movie.status,
    price_mnt: movie.priceMnt,
    playback_url: movie.playbackUrl ?? null,
  }
}

export async function listMovies(includeDrafts = false): Promise<Movie[]> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase.from("movies").select("*").order("created_at", { ascending: false })
    if (!includeDrafts) query = query.eq("status", "published")

    const { data, error } = await query
    if (error) throw error
    return (data as MovieRow[]).map(fromRow)
  }

  const movies = getLocalMovies()
  return includeDrafts ? movies : movies.filter((movie) => movie.status === "published")
}

export async function saveMovie(input: MovieInput): Promise<Movie> {
  if (isSupabaseConfigured && supabase) {
    if (input.id) {
      const { data, error } = await supabase
        .from("movies")
        .update(toRow(input))
        .eq("id", input.id)
        .select()
        .single()

      if (error) throw error
      return fromRow(data as MovieRow)
    }

    const { data, error } = await supabase.from("movies").insert(toRow(input)).select().single()
    if (error) throw error
    return fromRow(data as MovieRow)
  }

  const movies = getLocalMovies()
  if (input.id) {
    const updated = movies.map((movie) => (movie.id === input.id ? { ...input, id: input.id } as Movie : movie))
    saveLocalMovies(updated)
    return updated.find((movie) => movie.id === input.id)!
  }

  const movie: Movie = {
    ...input,
    id: crypto.randomUUID(),
  }
  saveLocalMovies([movie, ...movies])
  return movie
}

export async function deleteMovie(id: string) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("movies").delete().eq("id", id)
    if (error) throw error
    return
  }

  saveLocalMovies(getLocalMovies().filter((movie) => movie.id !== id))
}
