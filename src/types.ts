export type MovieStatus = "draft" | "published"

export type Movie = {
  id: string
  title: string
  originalTitle: string
  year: number
  genres: string[]
  rating: number
  runtime: string
  ageRating: string
  director: string
  cast: string[]
  description: string
  poster: string
  backdrop: string
  trailer: string
  featured: boolean
  trending: boolean
  progress?: number
  status: MovieStatus
  priceMnt: number
  playbackUrl?: string
}

export type MovieInput = Omit<Movie, "id"> & {
  id?: string
}

export type Profile = {
  id: string
  email: string | null
  fullName: string | null
  role: "viewer" | "admin"
}
