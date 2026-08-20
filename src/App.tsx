import { FormEvent, useEffect, useMemo, useState } from "react"
import { genres } from "./data/movies"
import { getProfile, signOut } from "./services/auth"
import { deleteMovie, listMovies, saveMovie } from "./services/catalog"
import { listFavoriteMovieIds, setFavoriteMovie } from "./services/favorites"
import { isSupabaseConfigured, supabase } from "./services/supabase"
import type { BeforeInstallPromptEvent } from "./pwa"
import type { Session } from "@supabase/supabase-js"
import type { Movie, MovieInput, MovieStatus, Profile } from "./types"

type AuthView = "login" | "register" | "forgot"
type SortKey = "trending" | "rating" | "newest"
type Page = "home" | "saved" | "admin"

const adminCode = (import.meta.env.VITE_ADMIN_ACCESS_CODE as string | undefined) ?? "1234"

const emptyMovie: MovieInput = {
  title: "",
  originalTitle: "",
  year: new Date().getFullYear(),
  genres: ["–î—Ä–∞–º–∞"],
  rating: 0,
  runtime: "1—Ü 30–º",
  ageRating: "13+",
  director: "",
  cast: [],
  description: "",
  poster: "",
  backdrop: "",
  trailer: "00:00",
  featured: false,
  trending: false,
  status: "draft",
  priceMnt: 0,
  playbackUrl: "",
}

function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = window.localStorage.getItem(key)
    if (!stored) return initialValue
    try {
      return JSON.parse(stored) as T
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue] as const
}

function Icon({
  name,
  className = "h-4 w-4",
}: {
  name:
    | "play"
    | "plus"
    | "check"
    | "search"
    | "user"
    | "x"
    | "arrow"
    | "star"
    | "heart"
    | "download"
    | "refresh"
    | "shield"
    | "trash"
    | "edit"
  className?: string
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  }

  if (name === "play") return <svg {...common}><polygon points="7 4 19 12 7 20 7 4" fill="currentColor" stroke="none" /></svg>
  if (name === "plus") return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>
  if (name === "check") return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" /></svg>
  if (name === "user") return <svg {...common}><circle cx="12" cy="8" r="4" /><path d="M4 21c1.7-4.2 5-6 8-6s6.3 1.8 8 6" /></svg>
  if (name === "x") return <svg {...common}><path d="M6 6l12 12M18 6 6 18" /></svg>
  if (name === "arrow") return <svg {...common}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
  if (name === "download") return <svg {...common}><path d="M12 3v12M7 10l5 5 5-5" /><path d="M5 21h14" /></svg>
  if (name === "refresh") return <svg {...common}><path d="M20 12a8 8 0 1 1-2.34-5.66" /><path d="M20 4v6h-6" /></svg>
  if (name === "shield") return <svg {...common}><path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z" /></svg>
  if (name === "trash") return <svg {...common}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" /></svg>
  if (name === "edit") return <svg {...common}><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z" /></svg>
  if (name === "star") return <svg {...common}><polygon points="12 3 14.8 8.7 21 9.6 16.5 14 17.6 20.2 12 17.3 6.4 20.2 7.5 14 3 9.6 9.2 8.7 12 3" fill="currentColor" stroke="none" /></svg>
  return <svg {...common}><path d="M20.8 4.6a5.3 5.3 0 0 0-7.5 0L12 5.9l-1.3-1.3a5.3 5.3 0 0 0-7.5 7.5L12 21l8.8-8.9a5.3 5.3 0 0 0 0-7.5Z" /></svg>
}

function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-amber-300">
      <Icon name="star" className="h-3.5 w-3.5" />
      <span className="font-semibold">{value.toFixed(1)}</span>
    </div>
  )
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [view, setView] = useState<AuthView>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (isSupabaseConfigured && supabase) {
        if (view === "register") {
          const { error } = await supabase.auth.signUp({ email, password })
          if (error) throw error
          setMessage("–ë“Ø—Ä—Ç–≥—ç–ª “Ø“Ø—Å–ª—ç—ç. –ò–º—ç–π–ª –±–∞—Ç–∞–ª–≥–∞–∞–∂—É—É–ª–∞–ª—Ç —Ö—ç—Ä—ç–≥—Ç—ç–π –±–∞–π–∂ –º–∞–≥–∞–¥–≥“Ø–π.")
        } else if (view === "forgot") {
          const { error } = await supabase.auth.resetPasswordForEmail(email)
          if (error) throw error
          setMessage("–ù—É—É—Ü “Ø–≥ —Å—ç—Ä–≥—ç—ç—Ö –∏–º—ç–π–ª –∏–ª–≥—ç—ç–≥–¥–ª—ç—ç.")
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) throw error
          setMessage("–ê–º–∂–∏–ª—Ç—Ç–∞–π –Ω—ç–≤—Ç—ç—Ä–ª—ç—ç.")
        }
      } else {
        setMessage("Demo –≥–æ—Ä–∏–º: Supabase env –æ—Ä–æ–æ–≥“Ø–π —Ç—É–ª login local preview –±–∞–π–¥–ª–∞–∞—Ä –∞–∂–∏–ª–ª–∞–∂ –±–∞–π–Ω–∞.")
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "–ê–ª–¥–∞–∞ –≥–∞—Ä–ª–∞–∞.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden border border-white/10 bg-[#101014] shadow-2xl shadow-black/60">
        <div className="h-1 bg-[linear-gradient(90deg,#f3c84b,#4db6ac,#ef6f6c)]" />
        <div className="p-6 sm:p-8">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center border border-amber-300/50 bg-amber-300/10 text-amber-300">
                <Icon name="play" className="h-3.5 w-3.5" />
              </div>
              <span className="font-display text-lg font-bold tracking-wide">REEL</span>
            </div>
            <button className="grid h-9 w-9 place-items-center border border-white/10 text-stone-400" onClick={onClose}>
              <Icon name="x" />
            </button>
          </div>

          {view !== "forgot" ? (
            <div className="mb-6 grid grid-cols-2 border border-white/10 p-1">
              {(["login", "register"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setView(item)}
                  className={`py-2 text-sm font-semibold transition ${
                    view === item ? "bg-amber-300 text-black" : "text-stone-400 hover:text-stone-100"
                  }`}
                >
                  {item === "login" ? "–ù—ç–≤—Ç—Ä—ç—Ö" : "–ë“Ø—Ä—Ç–≥“Ø“Ø–ª—ç—Ö"}
                </button>
              ))}
            </div>
          ) : (
            <button className="mb-5 flex items-center gap-2 text-sm text-amber-300" onClick={() => setView("login")}>
              <Icon name="arrow" />
              –ë—É—Ü–∞—Ö
            </button>
          )}

          <form className="grid gap-4" onSubmit={handleSubmit}>
            <label className="field-label">
              –ò–º—ç–π–ª
              <input className="input" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            {view !== "forgot" && (
              <label className="field-label">
                –ù—É—É—Ü “Ø–≥
                <input className="input" required type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
            )}
            {view === "login" && (
              <button type="button" className="justify-self-start text-sm font-medium text-amber-300" onClick={() => setView("forgot")}>
                –ù—É—É—Ü “Ø–≥ –º–∞—Ä—Ç—Å–∞–Ω?
              </button>
            )}
            <button className="btn-primary justify-center" disabled={loading}>
              {loading ? "–¢“Ø—Ä —Ö“Ø–ª—ç—ç–Ω—ç “Ø“Ø..." : view === "login" ? "–ù—ç–≤—Ç—Ä—ç—Ö" : view === "register" ? "–ë“Ø—Ä—Ç–≥“Ø“Ø–ª—ç—Ö" : "–°—ç—Ä–≥—ç—ç—Ö"}
            </button>
            {message && <p className="border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-stone-300">{message}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}

function Hero({ movie, saved, onOpen, onToggleSaved }: { movie: Movie; saved: boolean; onOpen: () => void; onToggleSaved: () => void }) {
  return (
    <section className="relative min-h-[620px] overflow-hidden">
      <img src={movie.backdrop} alt={movie.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#07070a_0%,rgba(7,7,10,.92)_32%,rgba(7,7,10,.3)_72%,rgba(7,7,10,.86)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07070a] to-transparent" />
      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-5 pb-16 pt-28 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-stone-200">
            <span className="bg-rose-400 px-2 py-1 text-black">–®–∏–Ω—ç</span>
            <span className="border border-white/20 px-2 py-1">{movie.ageRating}</span>
            <span className="border border-white/20 px-2 py-1">{movie.runtime}</span>
            <Rating value={movie.rating} />
            {movie.priceMnt > 0 && <span className="border border-teal-300/50 px-2 py-1 text-teal-200">{movie.priceMnt.toLocaleString()}‚ÇÆ</span>}
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">{movie.originalTitle}</p>
          <h1 className="font-display text-5xl font-black leading-[0.95] text-stone-50 sm:text-7xl">{movie.title}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-300">{movie.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={onOpen}>
              <Icon name="play" />
              “Æ–∑—ç—Ö
            </button>
            <button className="btn-secondary" onClick={onToggleSaved}>
              <Icon name={saved ? "check" : "plus"} />
              {saved ? "–•–∞–¥–≥–∞–ª—Å–∞–Ω" : "–ñ–∞–≥—Å–∞–∞–ª—Ç"}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function MovieCard({ movie, saved, onOpen, onToggleSaved }: { movie: Movie; saved: boolean; onOpen: () => void; onToggleSaved: () => void }) {
  return (
    <article className="group overflow-hidden border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-amber-300/40">
      <button className="block w-full text-left" onClick={onOpen}>
        <div className="relative aspect-[2/3] overflow-hidden bg-stone-900">
          <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-80" />
          <span className="absolute left-2 top-2 bg-black/70 px-2 py-1 text-xs font-bold text-stone-100 backdrop-blur">{movie.ageRating}</span>
          <span className="absolute bottom-2 left-2 rounded-full bg-teal-300 px-2 py-1 text-xs font-bold text-black">{movie.priceMnt > 0 ? `${movie.priceMnt.toLocaleString()}‚ÇÆ` : "“Æ–Ω—ç–≥“Ø–π"}</span>
        </div>
      </button>
      <div className="grid gap-2 p-3">
        <div className="flex items-start justify-between gap-3">
          <button className="min-w-0 text-left" onClick={onOpen}>
            <h3 className="font-display text-base font-bold leading-tight text-stone-100">{movie.title}</h3>
            <p className="mt-1 truncate text-xs text-stone-500">{movie.year} ¬∑ {movie.genres.join(" / ")}</p>
          </button>
          <button
            className={`grid h-8 w-8 shrink-0 place-items-center border transition ${
              saved ? "border-rose-300 bg-rose-300 text-black" : "border-white/10 text-stone-400 hover:text-stone-100"
            }`}
            onClick={onToggleSaved}
            aria-label={saved ? "–ñ–∞–≥—Å–∞–∞–ª—Ç–∞–∞—Å —Ö–∞—Å–∞—Ö" : "–ñ–∞–≥—Å–∞–∞–ª—Ç–∞–¥ –Ω—ç–º—ç—Ö"}
          >
            <Icon name="heart" />
          </button>
        </div>
        <Rating value={movie.rating} />
      </div>
    </article>
  )
}

function DetailView({
  movie,
  saved,
  userRating,
  onBack,
  onToggleSaved,
  onRate,
}: {
  movie: Movie
  saved: boolean
  userRating: number
  onBack: () => void
  onToggleSaved: () => void
  onRate: (rating: number) => void
}) {
  return (
    <main className="min-h-screen bg-[#07070a] text-stone-100">
      <section className="relative min-h-[460px]">
        <img src={movie.backdrop} alt={movie.title} className="absolute inset-0 h-full w-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,10,.32),#07070a_92%)]" />
        <button className="absolute left-5 top-5 z-10 btn-ghost sm:left-8" onClick={onBack}>
          <Icon name="arrow" />
          –ë—É—Ü–∞—Ö
        </button>
      </section>

      <section className="relative mx-auto -mt-44 grid max-w-7xl gap-8 px-5 pb-20 sm:px-8 lg:grid-cols-[280px_1fr] lg:px-10">
        <img src={movie.poster} alt={movie.title} className="aspect-[2/3] w-56 border border-white/10 object-cover shadow-2xl shadow-black/60 lg:w-full" />
        <div className="max-w-3xl pt-2">
          <div className="mb-4 flex flex-wrap gap-2">
            {movie.genres.map((genre) => (
              <span key={genre} className="border border-amber-300/50 px-2 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-200">
                {genre}
              </span>
            ))}
          </div>
          <h1 className="font-display text-4xl font-black leading-tight sm:text-6xl">{movie.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-stone-400">
            <Rating value={movie.rating} />
            <span>{movie.year}</span>
            <span>{movie.runtime}</span>
            <span>{movie.ageRating}</span>
            <span>{movie.priceMnt > 0 ? `${movie.priceMnt.toLocaleString()}‚ÇÆ` : "“Æ–Ω—ç–≥“Ø–π"}</span>
          </div>
          <p className="mt-6 text-bÁnx∂âûÀk∫wµÁhÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ%çΩ∏ÅπÖµîÙâ…ïô…ïÕ†àÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÉB£B„B˜F7FBÔF7F(ÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄ§ÄËÄ†(ÄÄÄÄÄÄÄÄÄÄÄÄ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÕ9ÖµîÙââ—∏µ¡…•µÖ…‰Å†¥ƒ¿àÅΩπ±•ç¨ıÌΩπ%πÕ—Ö±±Ù¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ%çΩ∏ÅπÖµîÙâëΩ›π±ΩÖêàÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÉBáFFBÔBœB√F(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÕ9ÖµîÙââ—∏µù°ΩÕ–Å†¥ƒ¿àÅΩπ±•ç¨ıÌΩπ•Õµ•ÕÕ%πÕ—Ö±±ÙÅÖ…•Ñµ±Öâï∞ÙãBwFFFà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ%çΩ∏ÅπÖµîÙâ‡àÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄº¯(ÄÄÄÄÄÄÄÄÄÄ•Ù(ÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄΩë•ÿ¯(ÄÄ§)Ù()ï·¡Ω…–ÅëïôÖ’±–Åô’πç—•Ω∏Å¡¿†§ÅÏ(ÄÅçΩπÕ–Åm¡Öùî∞ÅÕï—AÖùïtÄÙÅ’ÕïM—Ö—îÒAÖùî¯†â°Ωµîà§(ÄÅçΩπÕ–ÅmÖç—•Ÿïïπ…î∞ÅÕï—ç—•Ÿïïπ…ïtÄÙÅ’ÕïM—Ö—îÒÕ—…•πú¯†ãBGJøBœB–à§(ÄÅçΩπÕ–ÅmÕΩ…–∞ÅÕï—MΩ…—tÄÙÅ’ÕïM—Ö—îÒMΩ…—-ï‰¯†â—…ïπë•πúà§(ÄÅçΩπÕ–Åm≈’ï…‰∞ÅÕï—E’ï…ÂtÄÙÅ’ÕïM—Ö—î†àà§(ÄÅçΩπÕ–ÅmµΩŸ•ïÃ∞ÅÕï—5ΩŸ•ïÕtÄÙÅ’ÕïM—Ö—îÒ5ΩŸ•ïmt¯°mt§(ÄÅçΩπÕ–ÅmÕï±ïç—ïë5ΩŸ•î∞ÅÕï—Mï±ïç—ïë5ΩŸ•ïtÄÙÅ’ÕïM—Ö—îÒ5ΩŸ•îÅÅπ’±∞¯°π’±∞§(ÄÅçΩπÕ–ÅmÕ°Ω›’—†∞ÅÕï—M°Ω›’—°tÄÙÅ’ÕïM—Ö—î°ôÖ±Õî§(ÄÅçΩπÕ–Åm±ΩÖë•πú∞ÅÕï—1ΩÖë•πùtÄÙÅ’ÕïM—Ö—î°—…’î§(ÄÅçΩπÕ–ÅmçÖ—Ö±Ωù……Ω»∞ÅÕï—Ö—Ö±Ωù……Ω…tÄÙÅ’ÕïM—Ö—î†àà§(ÄÅçΩπÕ–ÅmÕïÕÕ•Ω∏∞ÅÕï—MïÕÕ•ΩπtÄÙÅ’ÕïM—Ö—îÒMïÕÕ•Ω∏ÅÅπ’±∞¯°π’±∞§(ÄÅçΩπÕ–Åm¡…Ωô•±î∞ÅÕï—A…Ωô•±ïtÄÙÅ’ÕïM—Ö—îÒA…Ωô•±îÅÅπ’±∞¯°π’±∞§(ÄÅçΩπÕ–ÅmÖ’—°1ΩÖë•πú∞ÅÕï—’—°1ΩÖë•πùtÄÙÅ’ÕïM—Ö—î°•ÕM’¡ÖâÖÕïΩπô•ù’…ïê§(ÄÅçΩπÕ–Åm•πÕ—Ö±±A…Ωµ¡–∞ÅÕï—%πÕ—Ö±±A…Ωµ¡—tÄÙÅ’ÕïM—Ö—îÒ	ïôΩ…ï%πÕ—Ö±±A…Ωµ¡—Ÿïπ–ÅÅπ’±∞¯°π’±∞§(ÄÅçΩπÕ–Åm’¡ëÖ—ïIïù•Õ—…Ö—•Ω∏∞ÅÕï—U¡ëÖ—ïIïù•Õ—…Ö—•ΩπtÄÙÅ’ÕïM—Ö—îÒMï…Ÿ•çï]Ω…≠ï…Iïù•Õ—…Ö—•Ω∏ÅÅπ’±∞¯°π’±∞§(ÄÅçΩπÕ–ÅmÕÖŸïë%ëÃ∞ÅÕï—MÖŸïë%ëÕtÄÙÅ’Õï1ΩçÖ±M—Ω…ÖùîÒÕ—…•πùmt¯†â…ïï∞πÕÖŸïë5ΩŸ•ïÃà∞ÅlâÕ•ùπÖ∞µŸΩ•êà∞ÄâÖµâï»µÕ°Ω…îât§(ÄÅçΩπÕ–Åm…Ö—•πùÃ∞ÅÕï—IÖ—•πùÕtÄÙÅ’Õï1ΩçÖ±M—Ω…ÖùîÒIïçΩ…êÒÕ—…•πú∞Åπ’µâï»¯¯†â…ïï∞π’Õï…IÖ—•πùÃà∞ÅÌÙ§((ÄÅçΩπÕ–Å±ΩÖëÖ—Ö±ΩúÄÙÅÖÕÂπåÄ†§ÄÙ¯ÅÏ(ÄÄÄÅÕï—1ΩÖë•πú°—…’î§(ÄÄÄÅÕï—Ö—Ö±Ωù……Ω»†àà§(ÄÄÄÅ—…‰ÅÏ(ÄÄÄÄÄÅÕï—5ΩŸ•ïÃ°Ö›Ö•–Å±•Õ—5ΩŸ•ïÃ°¡ÖùîÄÙÙÙÄâÖëµ•∏à§§(ÄÄÄÅÙÅçÖ—ç†Ä°ï……Ω»§ÅÏ(ÄÄÄÄÄÅÕï—Ö—Ö±Ωù……Ω»°ï……Ω»Å•πÕ—ÖπçïΩòÅ……Ω»Ä¸Åï……Ω»πµïÕÕÖùîÄËÄãBkB„B˜B¯ÉFB√BÙÉFB˜F#B„FÉJøB◊B–ÉB√BÔB”B√B¿ÉBœB√FBÔB√B¿∏à§(ÄÄÄÅÙÅô•πÖ±±‰ÅÏ(ÄÄÄÄÄÅÕï—1ΩÖë•πú°ôÖ±Õî§(ÄÄÄÅÙ(ÄÅÙ((ÄÅ’Õïôôïç–††§ÄÙ¯ÅÏ(ÄÄÄÅŸΩ•êÅ±ΩÖëÖ—Ö±Ωú†§(ÄÅÙ∞Åm¡Öùït§((ÄÅ’Õïôôïç–††§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ†Ö•ÕM’¡ÖâÖÕïΩπô•ù’…ïêÅÒÄÖÕ’¡ÖâÖÕî§Å…ï—’…∏((ÄÄÄÅ±ï–ÅÖç—•ŸîÄÙÅ—…’î((ÄÄÄÅçΩπÕ–ÅÕÂπçA…Ωô•±îÄÙÅÖÕÂπåÄ°πï·—MïÕÕ•Ω∏ËÅMïÕÕ•Ω∏ÅÅπ’±∞§ÄÙ¯ÅÏ(ÄÄÄÄÄÅÕï—MïÕÕ•Ω∏°πï·—MïÕÕ•Ω∏§(ÄÄÄÄÄÅ•òÄ†Öπï·—MïÕÕ•Ω∏¸π’Õï»§ÅÏ(ÄÄÄÄÄÄÄÅÕï—A…Ωô•±î°π’±∞§(ÄÄÄÄÄÄÄÅÕï—’—°1ΩÖë•πú°ôÖ±Õî§(ÄÄÄÄÄÄÄÅ…ï—’…∏(ÄÄÄÄÄÅÙ((ÄÄÄÄÄÅ—…‰ÅÏ(ÄÄÄÄÄÄÄÅçΩπÕ–Åπï·—A…Ωô•±îÄÙÅÖ›Ö•–Åùï—A…Ωô•±î°πï·—MïÕÕ•Ω∏π’Õï»π•ê§(ÄÄÄÄÄÄÄÅ•òÄ°Öç—•Ÿî§ÅÕï—A…Ωô•±î°πï·—A…Ωô•±î§(ÄÄÄÄÄÅÙÅçÖ—ç†ÅÏ(ÄÄÄÄÄÄÄÅ•òÄ°Öç—•Ÿî§ÅÕï—A…Ωô•±î°π’±∞§(ÄÄÄÄÄÅÙÅô•πÖ±±‰ÅÏ(ÄÄÄÄÄÄÄÅ•òÄ°Öç—•Ÿî§ÅÕï—’—°1ΩÖë•πú°ôÖ±Õî§(ÄÄÄÄÄÅÙ(ÄÄÄÅÙ((ÄÄÄÅÕ’¡ÖâÖÕîπÖ’—†πùï—MïÕÕ•Ω∏†§π—°ï∏†°ÏÅëÖ—ÑÅÙ§ÄÙ¯ÅÕÂπçA…Ωô•±î°ëÖ—ÑπÕïÕÕ•Ω∏§§(ÄÄÄÅçΩπÕ–ÅÏÅëÖ—ÑÅÙÄÙÅÕ’¡ÖâÖÕîπÖ’—†πΩπ’—°M—Ö—ï°Öπùî†°}ïŸïπ–∞Åπï·—MïÕÕ•Ω∏§ÄÙ¯ÅÏ(ÄÄÄÄÄÅŸΩ•êÅÕÂπçA…Ωô•±î°πï·—MïÕÕ•Ω∏§(ÄÄÄÅÙ§((ÄÄÄÅ…ï—’…∏Ä†§ÄÙ¯ÅÏ(ÄÄÄÄÄÅÖç—•ŸîÄÙÅôÖ±Õî(ÄÄÄÄÄÅëÖ—ÑπÕ’âÕç…•¡—•Ω∏π’πÕ’âÕç…•âî†§(ÄÄÄÅÙ(ÄÅÙ∞Åmt§((ÄÅ’Õïôôïç–††§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ†Ö•ÕM’¡ÖâÖÕïΩπô•ù’…ïêÅÒÄÖÕïÕÕ•Ω∏¸π’Õï»§Å…ï—’…∏((ÄÄÄÅ±ï–ÅÖç—•ŸîÄÙÅ—…’î(ÄÄÄÅ±•Õ—ÖŸΩ…•—ï5ΩŸ•ï%ëÃ°ÕïÕÕ•Ω∏π’Õï»π•ê§(ÄÄÄÄÄÄπ—°ï∏†°µΩŸ•ï%ëÃ§ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÅ•òÄ°Öç—•Ÿî§ÅÕï—MÖŸïë%ëÃ°µΩŸ•ï%ëÃ§(ÄÄÄÄÄÅÙ§(ÄÄÄÄÄÄπçÖ—ç†††§ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÄººÅ-ïï¿Å—°îÅëïŸ•çîµ±ΩçÖ∞Å±•Õ–ÅÖŸÖ•±Öâ±îÅ•òÅ—°îÅπï—›Ω…¨Å•ÃÅ’πÖŸÖ•±Öâ±î∏(ÄÄÄÄÄÅÙ§((ÄÄÄÅ…ï—’…∏Ä†§ÄÙ¯ÅÏ(ÄÄÄÄÄÅÖç—•ŸîÄÙÅôÖ±Õî(ÄÄÄÅÙ(ÄÅÙ∞ÅmÕïÕÕ•Ω∏¸π’Õï»π•ê∞ÅÕï—MÖŸïë%ëÕt§((ÄÅ’Õïôôïç–††§ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Å°Öπë±ï%πÕ—Ö±±IïÖë‰ÄÙÄ°ïŸïπ–ËÅ]•πëΩ›Ÿïπ—5Ö¡lâ…ïï∞È•πÕ—Ö±∞µ…ïÖë‰ât§ÄÙ¯ÅÕï—%πÕ—Ö±±A…Ωµ¡–°ïŸïπ–πëï—Ö•∞§(ÄÄÄÅçΩπÕ–Å°Öπë±ïU¡ëÖ—ïIïÖë‰ÄÙÄ°ïŸïπ–ËÅ]•πëΩ›Ÿïπ—5Ö¡lâ…ïï∞È’¡ëÖ—îµ…ïÖë‰ât§ÄÙ¯ÅÕï—U¡ëÖ—ïIïù•Õ—…Ö—•Ω∏°ïŸïπ–πëï—Ö•∞§(ÄÄÄÅ›•πëΩ‹πÖëëŸïπ—1•Õ—ïπï»†â…ïï∞È•πÕ—Ö±∞µ…ïÖë‰à∞Å°Öπë±ï%πÕ—Ö±±IïÖë‰§(ÄÄÄÅ›•πëΩ‹πÖëëŸïπ—1•Õ—ïπï»†â…ïï∞È’¡ëÖ—îµ…ïÖë‰à∞Å°Öπë±ïU¡ëÖ—ïIïÖë‰§(ÄÄÄÅ…ï—’…∏Ä†§ÄÙ¯ÅÏ(ÄÄÄÄÄÅ›•πëΩ‹π…ïµΩŸïŸïπ—1•Õ—ïπï»†â…ïï∞È•πÕ—Ö±∞µ…ïÖë‰à∞Å°Öπë±ï%πÕ—Ö±±IïÖë‰§(ÄÄÄÄÄÅ›•πëΩ‹π…ïµΩŸïŸïπ—1•Õ—ïπï»†â…ïï∞È’¡ëÖ—îµ…ïÖë‰à∞Å°Öπë±ïU¡ëÖ—ïIïÖë‰§(ÄÄÄÅÙ(ÄÅÙ∞Åmt§((ÄÅçΩπÕ–Å°ï…Ω5ΩŸ•îÄÙÅµΩŸ•ïÃπô•πê†°µΩŸ•î§ÄÙ¯ÅµΩŸ•îπôïÖ—’…ïêÄòòÅµΩŸ•îπÕ—Ö—’ÃÄÙÙÙÄâ¡’â±•Õ°ïêà§Ä¸¸ÅµΩŸ•ïÕl¡t(ÄÅçΩπÕ–ÅÕÖŸïë5ΩŸ•ïÃÄÙÅµΩŸ•ïÃπô•±—ï»†°µΩŸ•î§ÄÙ¯ÅÕÖŸïë%ëÃπ•πç±’ëïÃ°µΩŸ•îπ•ê§§(ÄÅçΩπÕ–ÅçΩπ—•π’ï]Ö—ç°•πúÄÙÅµΩŸ•ïÃπô•±—ï»†°µΩŸ•î§ÄÙ¯ÅµΩŸ•îπ¡…Ωù…ïÕÃ§((ÄÅçΩπÕ–ÅŸ•Õ•â±ï5ΩŸ•ïÃÄÙÅ’Õï5ïµº††§ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–ÅπΩ…µÖ±•ÈïëE’ï…‰ÄÙÅ≈’ï…‰π—…•¥†§π—Ω1Ω›ï…ÖÕî†§(ÄÄÄÅçΩπÕ–Å±•Õ–ÄÙÅ¡ÖùîÄÙÙÙÄâÕÖŸïêàÄ¸ÅÕÖŸïë5ΩŸ•ïÃÄËÅµΩŸ•ïÃπô•±—ï»†°µΩŸ•î§ÄÙ¯Å¡ÖùîÄÙÙÙÄâÖëµ•∏àÅÒÅµΩŸ•îπÕ—Ö—’ÃÄÙÙÙÄâ¡’â±•Õ°ïêà§(ÄÄÄÅ…ï—’…∏Å±•Õ–(ÄÄÄÄÄÄπô•±—ï»†°µΩŸ•î§ÄÙ¯ÅÖç—•Ÿïïπ…îÄÙÙÙÄãBGJøBœB–àÅÒÅµΩŸ•îπùïπ…ïÃπ•πç±’ëïÃ°Öç—•Ÿïïπ…î§§(ÄÄÄÄÄÄπô•±—ï»†°µΩŸ•î§ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÅ•òÄ†ÖπΩ…µÖ±•ÈïëE’ï…‰§Å…ï—’…∏Å—…’î(ÄÄÄÄÄÄÄÅ…ï—’…∏ÅÄëÌµΩŸ•îπ—•—±ïÙÄëÌµΩŸ•îπΩ…•ù•πÖ±Q•—±ïÙÄëÌµΩŸ•îπë•…ïç—Ω…ÙÄëÌµΩŸ•îπùïπ…ïÃπ©Ω•∏†àÄà•ıÄπ—Ω1Ω›ï…ÖÕî†§π•πç±’ëïÃ°πΩ…µÖ±•ÈïëE’ï…‰§(ÄÄÄÄÄÅÙ§(ÄÄÄÄÄÄπÕΩ…–†°Ñ∞Åà§ÄÙ¯ÅÏ(ÄÄÄÄÄÄÄÅ•òÄ°ÕΩ…–ÄÙÙÙÄâ…Ö—•πúà§Å…ï—’…∏Åàπ…Ö—•πúÄ¥ÅÑπ…Ö—•πú(ÄÄÄÄÄÄÄÅ•òÄ°ÕΩ…–ÄÙÙÙÄâπï›ïÕ–à§Å…ï—’…∏ÅàπÂïÖ»Ä¥ÅÑπÂïÖ»(ÄÄÄÄÄÄÄÅ…ï—’…∏Å9’µâï»°àπ—…ïπë•πú§Ä¥Å9’µâï»°Ñπ—…ïπë•πú§ÅÒÅàπ…Ö—•πúÄ¥ÅÑπ…Ö—•πú(ÄÄÄÄÄÅÙ§(ÄÅÙ∞ÅmÖç—•Ÿïïπ…î∞ÅµΩŸ•ïÃ∞Å¡Öùî∞Å≈’ï…‰∞ÅÕÖŸïë5ΩŸ•ïÃ∞ÅÕΩ…—t§((ÄÅçΩπÕ–Å—Ωùù±ïMÖŸïêÄÙÄ°µΩŸ•ï%êËÅÕ—…•πú§ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–ÅÕ°Ω’±ëMÖŸîÄÙÄÖÕÖŸïë%ëÃπ•πç±’ëïÃ°µΩŸ•ï%ê§(ÄÄÄÅÕï—MÖŸïë%ëÃ†°ç’……ïπ–§ÄÙ¯Ä°Õ°Ω’±ëMÖŸîÄ¸Ål∏∏πç’……ïπ–∞ÅµΩŸ•ï%ëtÄËÅç’……ïπ–πô•±—ï»†°•ê§ÄÙ¯Å•êÄÑÙÙÅµΩŸ•ï%ê§§§((ÄÄÄÅ•òÄ†Ö•ÕM’¡ÖâÖÕïΩπô•ù’…ïêÅÒÄÖÕïÕÕ•Ω∏¸π’Õï»§Å…ï—’…∏((ÄÄÄÅŸΩ•êÅÕï—ÖŸΩ…•—ï5ΩŸ•î°ÕïÕÕ•Ω∏π’Õï»π•ê∞ÅµΩŸ•ï%ê∞ÅÕ°Ω’±ëMÖŸî§πçÖ—ç†††§ÄÙ¯ÅÏ(ÄÄÄÄÄÅÕï—MÖŸïë%ëÃ†°ç’……ïπ–§ÄÙ¯Ä°Õ°Ω’±ëMÖŸîÄ¸Åç’……ïπ–πô•±—ï»†°•ê§ÄÙ¯Å•êÄÑÙÙÅµΩŸ•ï%ê§ÄËÅl∏∏πç’……ïπ–∞ÅµΩŸ•ï%ët§§(ÄÄÄÅÙ§(ÄÅÙ((ÄÅçΩπÕ–Å…Ö—ï5ΩŸ•îÄÙÄ°µΩŸ•ï%êËÅÕ—…•πú∞Å…Ö—•πúËÅπ’µâï»§ÄÙ¯ÅÏ(ÄÄÄÅÕï—IÖ—•πùÃ†°ç’……ïπ–§ÄÙ¯Ä°ÏÄ∏∏πç’……ïπ–∞ÅmµΩŸ•ï%ëtËÅ…Ö—•πúÅÙ§§(ÄÅÙ((ÄÅçΩπÕ–Å•πÕ—Ö±±¡¿ÄÙÅÖÕÂπåÄ†§ÄÙ¯ÅÏ(ÄÄÄÅ•òÄ†Ö•πÕ—Ö±±A…Ωµ¡–§Å…ï—’…∏(ÄÄÄÅÖ›Ö•–Å•πÕ—Ö±±A…Ωµ¡–π¡…Ωµ¡–†§(ÄÄÄÅÕï—%πÕ—Ö±±A…Ωµ¡–°π’±∞§(ÄÅÙ((ÄÅçΩπÕ–ÅÖ¡¡±ÂU¡ëÖ—îÄÙÄ†§ÄÙ¯ÅÏ(ÄÄÄÅçΩπÕ–Å›Ω…≠ï»ÄÙÅ’¡ëÖ—ïIïù•Õ—…Ö—•Ω∏¸π›Ö•—•πú(ÄÄÄÅ•òÄ†Ö›Ω…≠ï»§ÅÏ(ÄÄÄÄÄÅ›•πëΩ‹π±ΩçÖ—•Ω∏π…ï±ΩÖê†§(ÄÄÄÄÄÅ…ï—’…∏(ÄÄÄÅÙ(ÄÄÄÅ›Ω…≠ï»π¡ΩÕ—5ïÕÕÖùî°ÏÅ—Â¡îËÄâM-%A}]%Q%9àÅÙ§(ÄÅÙ((ÄÅçΩπÕ–Å±ΩùΩ’–ÄÙÅÖÕÂπåÄ†§ÄÙ¯ÅÏ(ÄÄÄÅÖ›Ö•–ÅÕ•ùπ=’–†§(ÄÄÄÅÕï—MïÕÕ•Ω∏°π’±∞§(ÄÄÄÅÕï—A…Ωô•±î°π’±∞§(ÄÅÙ((ÄÅ•òÄ°Õï±ïç—ïë5ΩŸ•î§ÅÏ(ÄÄÄÅ…ï—’…∏Ä†(ÄÄÄÄÄÄÒï—Ö•±Y•ï‹(ÄÄÄÄÄÄÄÅµΩŸ•îıÌÕï±ïç—ïë5ΩŸ•ïÙ(ÄÄÄÄÄÄÄÅÕÖŸïêıÌÕÖŸïë%ëÃπ•πç±’ëïÃ°Õï±ïç—ïë5ΩŸ•îπ•ê•Ù(ÄÄÄÄÄÄÄÅ’Õï…IÖ—•πúıÌ…Ö—•πùÕmÕï±ïç—ïë5ΩŸ•îπ•ëtÄ¸¸Ä¡Ù(ÄÄÄÄÄÄÄÅΩπ	Öç¨ıÏ†§ÄÙ¯ÅÕï—Mï±ïç—ïë5ΩŸ•î°π’±∞•Ù(ÄÄÄÄÄÄÄÅΩπQΩùù±ïMÖŸïêıÏ†§ÄÙ¯Å—Ωùù±ïMÖŸïê°Õï±ïç—ïë5ΩŸ•îπ•ê•Ù(ÄÄÄÄÄÄÄÅΩπIÖ—îıÏ°…Ö—•πú§ÄÙ¯Å…Ö—ï5ΩŸ•î°Õï±ïç—ïë5ΩŸ•îπ•ê∞Å…Ö—•πú•Ù(ÄÄÄÄÄÄº¯(ÄÄÄÄ§(ÄÅÙ((ÄÅ…ï—’…∏Ä†(ÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâµ•∏µ†µÕç…ïï∏Åâúµlå¿‹¿‹¡ÖtÅ—ï·–µÕ—Ωπî¥ƒ¿¿à¯(ÄÄÄÄÄÅÌÕ°Ω›’—†ÄòòÄÒ’—°5ΩëÖ∞ÅΩπ±ΩÕîıÏ†§ÄÙ¯ÅÕï—M°Ω›’—†°ôÖ±Õî•ÙÄº˘Ù(ÄÄÄÄÄÄÒA›Ö	Öππï»(ÄÄÄÄÄÄÄÅ•πÕ—Ö±±A…Ωµ¡–ıÌ•πÕ—Ö±±A…Ωµ¡—Ù(ÄÄÄÄÄÄÄÅ’¡ëÖ—ïIïÖë‰ıÌ	ΩΩ±ïÖ∏°’¡ëÖ—ïIïù•Õ—…Ö—•Ω∏•Ù(ÄÄÄÄÄÄÄÅΩπ%πÕ—Ö±∞ıÌ•πÕ—Ö±±¡¡Ù(ÄÄÄÄÄÄÄÅΩπU¡ëÖ—îıÌÖ¡¡±ÂU¡ëÖ—ïÙ(ÄÄÄÄÄÄÄÅΩπ•Õµ•ÕÕ%πÕ—Ö±∞ıÏ†§ÄÙ¯ÅÕï—%πÕ—Ö±±A…Ωµ¡–°π’±∞•Ù(ÄÄÄÄÄÄº¯((ÄÄÄÄÄÄÒ°ïÖëï»Åç±ÖÕÕ9ÖµîÙâô•·ïêÅ•πÕï–µ‡¥¿Å—Ω¿¥¿ÅË¥–¿ÅâΩ…ëï»µàÅâΩ…ëï»µ›°•—îºƒ¿Åâúµlå¿‹¿‹¡Ötº‡ÿÅâÖç≠ë…Ω¿µâ±’»µ·∞à¯(ÄÄÄÄÄÄÄÄÒπÖÿÅç±ÖÕÕ9ÖµîÙâµ‡µÖ’—ºÅô±ï‡Å†¥ƒÿÅµÖ‡µ‹¥›·∞Å•—ïµÃµçïπ—ï»Å©’Õ—•ô‰µâï—›ïï∏Å¡‡¥‘ÅÕ¥È¡‡¥‡Å±úÈ¡‡¥ƒ¿à¯(ÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÕ9ÖµîÙâô±ï‡Å•—ïµÃµçïπ—ï»ÅùÖ¿¥»àÅΩπ±•ç¨ıÏ†§ÄÙ¯ÅÕï—AÖùî†â°Ωµîà•Ù¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÕ9ÖµîÙâù…•êÅ†¥‰Å‹¥‰Å¡±Öçîµ•—ïµÃµçïπ—ï»ÅâΩ…ëï»ÅâΩ…ëï»µÖµâï»¥Ã¿¿º‘¿ÅâúµÖµâï»¥Ã¿¿ºƒ¿Å—ï·–µÖµâï»¥Ã¿¿à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ%çΩ∏ÅπÖµîÙâ¡±Ö‰àÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÕ9ÖµîÙâôΩπ–µë•Õ¡±Ö‰Å—ï·–µ·∞ÅôΩπ–µâ±Öç¨Å—…Öç≠•πúµ›•ëîà˘I0ΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâ°•ëëï∏Å•—ïµÃµçïπ—ï»ÅùÖ¿¥»ÅµêÈô±ï‡à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÕ9ÖµîıÌÅπÖÿµ±•π¨ÄëÌ¡ÖùîÄÙÙÙÄâ°ΩµîàÄ¸ÄâπÖÿµ±•π¨µÖç—•ŸîàÄËÄàâıÅÙÅΩπ±•ç¨ıÏ†§ÄÙ¯ÅÕï—AÖùî†â°Ωµîà•Ù˚BwJøJøF Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÕ9ÖµîıÌÅπÖÿµ±•π¨ÄëÌ¡ÖùîÄÙÙÙÄâÕÖŸïêàÄ¸ÄâπÖÿµ±•π¨µÖç—•ŸîàÄËÄàâıÅÙÅΩπ±•ç¨ıÏ†§ÄÙ¯ÅÕï—AÖùî†âÕÖŸïêà•Ù˚BsB„B˜B„B‰ÉB€B√BœFB√B√BÔFΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÕ9ÖµîıÌÅπÖÿµ±•π¨ÄëÌ¡ÖùîÄÙÙÙÄâÖëµ•∏àÄ¸ÄâπÖÿµ±•π¨µÖç—•ŸîàÄËÄàâıÅÙÅΩπ±•ç¨ıÏ†§ÄÙ¯ÅÕï—AÖùî†âÖëµ•∏à•Ù˘ëµ•∏Ωâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÅÌÕïÕÕ•Ω∏Ä¸Ä†(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÕ9ÖµîÙââ—∏µù°ΩÕ–àÅΩπ±•ç¨ıÌ±ΩùΩ’—Ù¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ%çΩ∏ÅπÖµîÙâ’Õï»àÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÌ¡…Ωô•±î¸π…Ω±îÄÙÙÙÄâÖëµ•∏àÄ¸Äâëµ•∏àÄËÄãBOB√FB√FâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄ§ÄËÄ†(ÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Åç±ÖÕÕ9ÖµîÙââ—∏µù°ΩÕ–àÅΩπ±•ç¨ıÏ†§ÄÙ¯ÅÕï—M°Ω›’—†°—…’î•Ù¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ%çΩ∏ÅπÖµîÙâ’Õï»àÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÌÖ’—°1ΩÖë•πúÄ¸ÄãB£B√BÔBœB√BÿÉB«B√BÁB˜B¿àÄËÄãBwF7BÀFFF7FâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄ•Ù(ÄÄÄÄÄÄÄÄΩπÖÿ¯(ÄÄÄÄÄÄΩ°ïÖëï»¯((ÄÄÄÄÄÅÌ¡ÖùîÄÙÙÙÄâÖëµ•∏àÄ¸Ä†(ÄÄÄÄÄÄÄÄÒëµ•πÖÕ°âΩÖ…ê(ÄÄÄÄÄÄÄÄÄÅµΩŸ•ïÃıÌµΩŸ•ïÕÙ(ÄÄÄÄÄÄÄÄÄÅΩπIï±ΩÖêıÌ±ΩÖëÖ—Ö±ΩùÙ(ÄÄÄÄÄÄÄÄÄÅ•Õëµ•∏ıÏÖ•ÕM’¡ÖâÖÕïΩπô•ù’…ïêÅÒÅ¡…Ωô•±î¸π…Ω±îÄÙÙÙÄâÖëµ•∏âÙ(ÄÄÄÄÄÄÄÄÄÅ’Õï…µÖ•∞ıÌÕïÕÕ•Ω∏¸π’Õï»πïµÖ•∞Ä¸¸Å¡…Ωô•±î¸πïµÖ•∞Ä¸¸Å’πëïô•πïëÙ(ÄÄÄÄÄÄÄÄÄÅΩπIï≈’•…ï1Ωù•∏ıÏ†§ÄÙ¯ÅÕï—M°Ω›’—†°—…’î•Ù(ÄÄÄÄÄÄÄÄº¯(ÄÄÄÄÄÄ§ÄËÄ†(ÄÄÄÄÄÄÄÄ¯(ÄÄÄÄÄÄÄÄÄÅÌ¡ÖùîÄÙÙÙÄâ°ΩµîàÄòòÅ°ï…Ω5ΩŸ•îÄòòÄÒ!ï…ºÅµΩŸ•îıÌ°ï…Ω5ΩŸ•ïÙÅÕÖŸïêıÌÕÖŸïë%ëÃπ•πç±’ëïÃ°°ï…Ω5ΩŸ•îπ•ê•ÙÅΩπ=¡ï∏ıÏ†§ÄÙ¯ÅÕï—Mï±ïç—ïë5ΩŸ•î°°ï…Ω5ΩŸ•î•ÙÅΩπQΩùù±ïMÖŸïêıÏ†§ÄÙ¯Å—Ωùù±ïMÖŸïê°°ï…Ω5ΩŸ•îπ•ê•ÙÄº˘Ù(ÄÄÄÄÄÄÄÄÄÄÒµÖ•∏Åç±ÖÕÕ9ÖµîıÌÅµ‡µÖ’—ºÅµÖ‡µ‹¥›·∞Å¡‡¥‘Å¡à¥»¿ÅÕ¥È¡‡¥‡Å±úÈ¡‡¥ƒ¿ÄëÌ¡ÖùîÄÙÙÙÄâÕÖŸïêàÄ¸Äâ¡–¥»‡àÄËÄàâıÅÙ¯(ÄÄÄÄÄÄÄÄÄÄÄÅÌçÖ—Ö±Ωù……Ω»ÄòòÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâµ–¥»–ÅâΩ…ëï»ÅâΩ…ëï»µ…ΩÕî¥Ã¿¿ºÃ¿Åâúµ…ΩÕî¥Ã¿¿ºƒ¿Å¿¥–Å—ï·–µÕ¥Å—ï·–µ…ΩÕî¥ƒ¿¿à˘ÌçÖ—Ö±Ωù……Ω…ÙΩë•ÿ˘Ù(ÄÄÄÄÄÄÄÄÄÄÄÅÌ±ΩÖë•πúÄòòÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâ¡–¥»‡Å—ï·–µÕ¥Å—ï·–µÕ—Ωπî¥–¿¿à˚BkB„B˜B¯ÉFB√BÙÉB√FB√B√BÔBÿÉB«B√BÁB˜B¿∏∏∏Ωë•ÿ˘Ù((ÄÄÄÄÄÄÄÄÄÄÄÅÌ¡ÖùîÄÙÙÙÄâÕÖŸïêàÄòòÄ†(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâµà¥‡à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ¿Åç±ÖÕÕ9ÖµîÙâ—ï·–µÕ¥ÅôΩπ–µÕïµ•âΩ±êÅ’¡¡ï…çÖÕîÅ—…Öç≠•πúµl¿∏ƒ·ïµtÅ—ï·–µ—ïÖ∞¥»¿¿à˚BóFBÀB„BÁBÙÉFB√BÙΩ¿¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ†ƒÅç±ÖÕÕ9ÖµîÙâµ–¥»ÅôΩπ–µë•Õ¡±Ö‰Å—ï·–¥—·∞ÅôΩπ–µâ±Öç¨ÅÕ¥È—ï·–¥’·∞à˚BsB„B˜B„B‰ÉB€B√BœFB√B√BÔFΩ†ƒ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ¿Åç±ÖÕÕ9ÖµîÙâµ–¥ÃÅµÖ‡µ‹µ·∞Å—ï·–µÕ—Ωπî¥–¿¿à˚BãB√B˜F,ÉFB√B”BœB√BÔFB√BÙÉBÎB„B˜B˚B˜FFB–ÉF7B˜F4ÉFNßFNßNßFNßBÛBÿÉB”F7F7F ÉJøBÔB”F7B˜F4∏ÅÖ—ÖâÖÕîÉFB˚BÔB«B˚FB˜F,ÉB”B√FB√B¿ÅÖççΩ’π–∑B–ÉFB√B”BœB√BÔB”B√BÃÉB«B˚BÔBœB˚B˜B¯∏Ω¿¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄ•Ù((ÄÄÄÄÄÄÄÄÄÄÄÅÌ¡ÖùîÄÙÙÙÄâ°ΩµîàÄòòÄ†(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕïç—•Ω∏Åç±ÖÕÕ9ÖµîÙàµµ–¥‡Åù…•êÅùÖ¿¥ÃÅµêÈù…•êµçΩ±Ã¥Ãà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒM—Ö–Å±Öâï∞ÙãBwB„BÁFÉBÎB„B˜B¯àÅŸÖ±’îıÌÄëÌµΩŸ•ïÃπô•±—ï»†°µΩŸ•î§ÄÙ¯ÅµΩŸ•îπÕ—Ö—’ÃÄÙÙÙÄâ¡’â±•Õ°ïêà§π±ïπù—°ıÅÙÅ—ΩπîÙâÖµâï»àÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒM—Ö–Å±Öâï∞ÙãBãNßBÔB«NßFFF7B‰àÅŸÖ±’îıÌÄëÌµΩŸ•ïÃπô•±—ï»†°µΩŸ•î§ÄÙ¯ÅµΩŸ•îπ¡…•çï5π–Ä¯Ä¿§π±ïπù—°ıÅÙÅ—ΩπîÙâ…ΩÕîàÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒM—Ö–Å±Öâï∞ÙãBóB√B”BœB√BÔFB√BÙàÅŸÖ±’îıÌÄëÌÕÖŸïë%ëÃπ±ïπù—°ıÅÙÅ—ΩπîÙâ—ïÖ∞àÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩÕïç—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄ•Ù((ÄÄÄÄÄÄÄÄÄÄÄÅÌ¡ÖùîÄÙÙÙÄâ°ΩµîàÄòòÅçΩπ—•π’ï]Ö—ç°•πúπ±ïπù—†Ä¯Ä¿ÄòòÄ†(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕïç—•Ω∏Åç±ÖÕÕ9ÖµîÙâµ–¥ƒ»à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ†»Åç±ÖÕÕ9ÖµîÙâµà¥–ÅôΩπ–µë•Õ¡±Ö‰Å—ï·–¥…·∞ÅôΩπ–µâΩ±êà˚JªFBœF7BÔB€BÔJøJøBÔF7BÙÉJøBﬂF7FΩ†»¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâù…•êÅùÖ¿¥ÃÅµêÈù…•êµçΩ±Ã¥»à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅÌçΩπ—•π’ï]Ö—ç°•πúπµÖ¿†°µΩŸ•î§ÄÙ¯Ä†(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å≠ï‰ıÌµΩŸ•îπ•ëÙÅç±ÖÕÕ9ÖµîÙâù…•êÅù…•êµçΩ±Ãµlƒƒ…¡·|≈ô…tÅΩŸï…ô±Ω‹µ°•ëëï∏ÅâΩ…ëï»ÅâΩ…ëï»µ›°•—îºƒ¿Åâúµ›°•—îΩl¿∏¿Ã’tÅ—ï·–µ±ïô–Å—…ÖπÕ•—•Ω∏Å°ΩŸï»ÈâΩ…ëï»µ—ïÖ∞¥Ã¿¿º‘¿àÅΩπ±•ç¨ıÏ†§ÄÙ¯ÅÕï—Mï±ïç—ïë5ΩŸ•î°µΩŸ•î•Ù¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ•µúÅÕ…åıÌµΩŸ•îπâÖç≠ë…Ω¡ÙÅÖ±–ıÌµΩŸ•îπ—•—±ïÙÅç±ÖÕÕ9ÖµîÙâ†µô’±∞Åµ•∏µ†¥»‡Å‹µô’±∞ÅΩâ©ïç–µçΩŸï»àÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâ¿¥–à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ¿Åç±ÖÕÕ9ÖµîÙâ—ï·–µ·ÃÅôΩπ–µâΩ±êÅ’¡¡ï…çÖÕîÅ—…Öç≠•πúµl¿∏ƒ—ïµtÅ—ï·–µ—ïÖ∞¥»¿¿à˘ÌµΩŸ•îπùïπ…ïÕl¡uÙΩ¿¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ†ÃÅç±ÖÕÕ9ÖµîÙâµ–¥ƒÅôΩπ–µë•Õ¡±Ö‰Å—ï·–µ±úÅôΩπ–µâΩ±êà˘ÌµΩŸ•îπ—•—±ïÙΩ†Ã¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâµ–¥–Å†¥ƒ∏‘Åâúµ›°•—îºƒ¿à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâ†µô’±∞Åâúµ—ïÖ∞¥Ã¿¿àÅÕ—Â±îıÌÏÅ›•ë—†ËÅÄëÌµΩŸ•îπ¡…Ωù…ïÕÃÄ¸¸Ä¡ÙïÄÅıÙÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ¿Åç±ÖÕÕ9ÖµîÙâµ–¥»Å—ï·–µ·ÃÅ—ï·–µÕ—Ωπî¥‘¿¿à˘ÌµΩŸ•îπ¡…Ωù…ïÕÕÙîÉJøBﬂFF7BÙΩ¿¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ§•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩÕïç—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄ•Ù((ÄÄÄÄÄÄÄÄÄÄÄÄÒÕïç—•Ω∏Åç±ÖÕÕ9ÖµîÙâµ–¥ƒ»à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâµà¥‘Åù…•êÅùÖ¿¥–Å±úÈù…•êµçΩ±Ãµl≈ô…}Ö’—ΩtÅ±úÈ•—ïµÃµïπêà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ¿Åç±ÖÕÕ9ÖµîÙâ—ï·–µÕ¥ÅôΩπ–µÕïµ•âΩ±êÅ’¡¡ï…çÖÕîÅ—…Öç≠•πúµl¿∏ƒ·ïµtÅ—ï·–µÖµâï»¥Ã¿¿à˘Ì¡ÖùîÄÙÙÙÄâÕÖŸïêàÄ¸ÄãBóB√B”BœB√BÔFB√BÙÉBÎB„B˜B¯àÄËÄãBkB√FB√BÔB˚BÃâÙΩ¿¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ†»Åç±ÖÕÕ9ÖµîÙâµ–¥»ÅôΩπ–µë•Õ¡±Ö‰Å—ï·–¥Õ·∞ÅôΩπ–µâ±Öç¨à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅÌ¡ÖùîÄÙÙÙÄâÕÖŸïêàÄ¸ÄãBáB˚B˜BœB˚FB˚BÙÉB«JøFF7F7BÔJøJøB–àÄËÄãBkB„B˜B¯ÉFB√BÙâÙ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕ¡Ö∏Åç±ÖÕÕ9ÖµîÙâµ∞¥»Å—ï·–µ±úÅôΩπ–µµïë•’¥Å—ï·–µÕ—Ωπî¥‘¿¿à¯°ÌŸ•Õ•â±ï5ΩŸ•ïÃπ±ïπù—°Ù§ΩÕ¡Ö∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩ†»¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâù…•êÅùÖ¿¥ÃÅÕ¥Èù…•êµçΩ±Ãµmµ•πµÖ‡†»»¡¡‡∞Ã»¡¡‡•|ƒÿ¡¡·tà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ±Öâï∞Åç±ÖÕÕ9ÖµîÙâ…ï±Ö—•Ÿîà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ%çΩ∏ÅπÖµîÙâÕïÖ…ç†àÅç±ÖÕÕ9ÖµîÙâ¡Ω•π—ï»µïŸïπ—ÃµπΩπîÅÖâÕΩ±’—îÅ±ïô–¥ÃÅ—Ω¿¥ƒº»Å†¥–Å‹¥–Äµ—…ÖπÕ±Ö—îµ‰¥ƒº»Å—ï·–µÕ—Ωπî¥‘¿¿àÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ•π¡’–Åç±ÖÕÕ9ÖµîÙâ•π¡’–Å¡∞¥ƒ¿àÅŸÖ±’îıÌ≈’ï…ÂÙÅΩπ°ÖπùîıÏ°ïŸïπ–§ÄÙ¯ÅÕï—E’ï…‰°ïŸïπ–π—Ö…ùï–πŸÖ±’î•ÙÅ¡±Öçï°Ω±ëï»ÙãBkB„B˜B¯ÉFB√BÁFàÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩ±Öâï∞¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒÕï±ïç–Åç±ÖÕÕ9ÖµîÙâ•π¡’–àÅŸÖ±’îıÌÕΩ…—ÙÅΩπ°ÖπùîıÏ°ïŸïπ–§ÄÙ¯ÅÕï—MΩ…–°ïŸïπ–π—Ö…ùï–πŸÖ±’îÅÖÃÅMΩ…—-ï‰•Ù¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ—…ïπë•πúà˘Q…ïπêÉF7FF7B˜B–ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâ…Ö—•πúà˚JªB˜F7BÔBœF7F7BœF7F7F ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒΩ¡—•Ω∏ÅŸÖ±’îÙâπï›ïÕ–à˚B£B„B˜F7F7F ΩΩ¡—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩÕï±ïç–¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâµà¥ÿÅô±ï‡ÅùÖ¿¥»ÅΩŸï…ô±Ω‹µ‡µÖ’—ºÅ¡à¥ƒà¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅÌùïπ…ïÃπµÖ¿†°ùïπ…î§ÄÙ¯Ä†(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒâ’——Ω∏Å≠ï‰ıÌùïπ…ïÙÅç±ÖÕÕ9ÖµîıÌÅç°•¿ÄëÌÖç—•Ÿïïπ…îÄÙÙÙÅùïπ…îÄ¸Äâç°•¿µÖç—•ŸîàÄËÄàâıÅÙÅΩπ±•ç¨ıÏ†§ÄÙ¯ÅÕï—ç—•Ÿïïπ…î°ùïπ…î•Ù¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅÌùïπ…ïÙ(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩâ’——Ω∏¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ§•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯((ÄÄÄÄÄÄÄÄÄÄÄÄÄÅÌŸ•Õ•â±ï5ΩŸ•ïÃπ±ïπù—†Ä¯Ä¿Ä¸Ä†(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙâù…•êÅù…•êµçΩ±Ã¥»ÅùÖ¿¥ÃÅÕ¥Èù…•êµçΩ±Ã¥ÃÅ±úÈù…•êµçΩ±Ã¥–Å·∞Èù…•êµçΩ±Ã¥‘à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÅÌŸ•Õ•â±ï5ΩŸ•ïÃπµÖ¿†°µΩŸ•î§ÄÙ¯Ä†(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ5ΩŸ•ïÖ…êÅ≠ï‰ıÌµΩŸ•îπ•ëÙÅµΩŸ•îıÌµΩŸ•ïÙÅÕÖŸïêıÌÕÖŸïë%ëÃπ•πç±’ëïÃ°µΩŸ•îπ•ê•ÙÅΩπ=¡ï∏ıÏ†§ÄÙ¯ÅÕï—Mï±ïç—ïë5ΩŸ•î°µΩŸ•î•ÙÅΩπQΩùù±ïMÖŸïêıÏ†§ÄÙ¯Å—Ωùù±ïMÖŸïê°µΩŸ•îπ•ê•ÙÄº¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄ§•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄ§ÄËÄ†(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîÙââΩ…ëï»ÅâΩ…ëï»µ›°•—îºƒ¿Åâúµ›°•—îΩl¿∏¿Ã’tÅ¡‡¥‘Å¡‰¥ƒ–Å—ï·–µçïπ—ï»à¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ†ÃÅç±ÖÕÕ9ÖµîÙâôΩπ–µë•Õ¡±Ö‰Å—ï·–¥…·∞ÅôΩπ–µâΩ±êà˚BcBÔF7FFÉB√BÔBœB¿Ω†Ã¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÒ¿Åç±ÖÕÕ9ÖµîÙâµ–¥»Å—ï·–µÕ—Ωπî¥–¿¿à˚BóB√BÁBÔFÉF7FBÀF7BÏÉB€B√B˜FF/BÙÉFB˚B˜BœB˚BÔFB˚B¯ÉNßNßFFBÔNßNßB–ÉB”B√FB„BÙÉJøBﬂF7F7FF7B‰∏Ω¿¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄÄΩë•ÿ¯(ÄÄÄÄÄÄÄÄÄÄÄÄÄÄ•Ù(ÄÄÄÄÄÄÄÄÄÄÄÄΩÕïç—•Ω∏¯(ÄÄÄÄÄÄÄÄÄÄΩµÖ•∏¯(ÄÄÄÄÄÄÄÄº¯(ÄÄÄÄÄÄ•Ù(ÄÄÄÄΩë•ÿ¯(ÄÄ§)Ù()ô’πç—•Ω∏ÅM—Ö–°ÏÅ±Öâï∞∞ÅŸÖ±’î∞Å—ΩπîÅÙËÅÏÅ±Öâï∞ËÅÕ—…•πúÏÅŸÖ±’îËÅÕ—…•πúÏÅ—ΩπîËÄâÖµâï»àÅÄâ…ΩÕîàÅÄâ—ïÖ∞àÅÙ§ÅÏ(ÄÅçΩπÕ–Å—ΩπïÃÄÙÅÏ(ÄÄÄÅÖµâï»ËÄâ—ï·–µÖµâï»¥»¿¿ÅâΩ…ëï»µÖµâï»¥Ã¿¿ºÃ¿ÅâúµÖµâï»¥Ã¿¿ºƒ¿à∞(ÄÄÄÅ…ΩÕîËÄâ—ï·–µ…ΩÕî¥»¿¿ÅâΩ…ëï»µ…ΩÕî¥Ã¿¿ºÃ¿Åâúµ…ΩÕî¥Ã¿¿ºƒ¿à∞(ÄÄÄÅ—ïÖ∞ËÄâ—ï·–µ—ïÖ∞¥»¿¿ÅâΩ…ëï»µ—ïÖ∞¥Ã¿¿ºÃ¿Åâúµ—ïÖ∞¥Ã¿¿ºƒ¿à∞(ÄÅÙ((ÄÅ…ï—’…∏Ä†(ÄÄÄÄÒë•ÿÅç±ÖÕÕ9ÖµîıÌÅâΩ…ëï»Å¿¥‘ÄëÌ—ΩπïÕm—ΩπïuıÅÙ¯(ÄÄÄÄÄÄÒ¿Åç±ÖÕÕ9ÖµîÙâ—ï·–µ·ÃÅôΩπ–µâΩ±êÅ’¡¡ï…çÖÕîÅ—…Öç≠•πúµl¿∏ƒ·ïµtÅΩ¡Öç•—‰¥‹‘à˘Ì±Öâï±ÙΩ¿¯(ÄÄÄÄÄÄÒ¿Åç±ÖÕÕ9ÖµîÙâµ–¥»ÅôΩπ–µë•Õ¡±Ö‰Å—ï·–¥Õ·∞ÅôΩπ–µâ±Öç¨à˘ÌŸÖ±’ïÙΩ¿¯(ÄÄÄÄΩë•ÿ¯(ÄÄ§)Ù(