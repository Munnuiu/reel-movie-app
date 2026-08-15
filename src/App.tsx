import { FormEvent, useEffect, useMemo, useState } from "react"
import { genres, movies, type Movie } from "./data/movies"
import type { BeforeInstallPromptEvent } from "./pwa"

type AuthView = "login" | "register" | "forgot"
type SortKey = "trending" | "rating" | "newest"
type Page = "home" | "saved"

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
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setDone(true)
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden border border-white/10 bg-[#101014] shadow-2xl shadow-black/60">
        <div className="h-1 bg-[linear-gradient(90deg,#f3c84b,#4db6ac,#ef6f6c)]" />
        <div className="p-6 sm:p-8">
          <div className="mb-7 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 border border-amber-300/50 bg-amber-300/10 grid place-items-center text-amber-300">
                <Icon name="play" className="h-3.5 w-3.5" />
              </div>
              <span className="font-display text-lg font-bold tracking-wide">REEL</span>
            </div>
            <button
              className="grid h-9 w-9 place-items-center border border-white/10 text-stone-400 transition hover:border-white/30 hover:text-stone-100"
              onClick={onClose}
              aria-label="Хаах"
            >
              <Icon name="x" />
            </button>
          </div>

          {done ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 grid h-12 w-12 place-items-center border border-teal-300/60 text-teal-200">
                <Icon name="check" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {view === "forgot" ? "Имэйл илгээгдлээ" : "Амжилттай"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-stone-400">
                {view === "forgot"
                  ? "Нууц үг сэргээх холбоос demo байдлаар илгээгдсэн."
                  : "Энэ preview дээр login demo байдлаар ажиллаж байна."}
              </p>
              <button className="mt-6 bg-amber-300 px-5 py-2.5 text-sm font-bold text-black" onClick={onClose}>
                Дуусгах
              </button>
            </div>
          ) : (
            <>
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
                      {item === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
                    </button>
                  ))}
                </div>
              ) : (
                <button className="mb-5 flex items-center gap-2 text-sm text-amber-300" onClick={() => setView("login")}>
                  <Icon name="arrow" className="h-4 w-4" />
                  Буцах
                </button>
              )}

              <form className="grid gap-4" onSubmit={handleSubmit}>
                {view === "register" && (
                  <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Нэр
                    <input className="input" required placeholder="Таны нэр" />
                  </label>
                )}
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                  Имэйл
                  <input className="input" required type="email" placeholder="name@example.com" />
                </label>
                {view !== "forgot" && (
                  <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
                    Нууц үг
                    <input className="input" required type="password" placeholder="••••••••" />
                  </label>
                )}
                {view === "login" && (
                  <button
                    type="button"
                    className="justify-self-start text-sm font-medium text-amber-300"
                    onClick={() => setView("forgot")}
                  >
                    Нууц үг мартсан?
                  </button>
                )}
                <button className="mt-2 bg-amber-300 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-200" disabled={loading}>
                  {loading
                    ? "Түр хүлээнэ үү..."
                    : view === "login"
                      ? "Нэвтрэх"
                      : view === "register"
                        ? "Бүртгүүлэх"
                        : "Сэргээх холбоос илгээх"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Hero({
  movie,
  saved,
  onOpen,
  onToggleSaved,
}: {
  movie: Movie
  saved: boolean
  onOpen: () => void
  onToggleSaved: () => void
}) {
  return (
    <section className="relative min-h-[620px] overflow-hidden">
      <img src={movie.backdrop} alt={movie.title} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#07070a_0%,rgba(7,7,10,.92)_32%,rgba(7,7,10,.3)_72%,rgba(7,7,10,.86)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07070a] to-transparent" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-end px-5 pb-16 pt-28 sm:px-8 lg:px-10">
        <div className="max-w-2xl">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-stone-200">
            <span className="bg-rose-400 px-2 py-1 text-black">Шинэ</span>
            <span className="border border-white/20 px-2 py-1">{movie.ageRating}</span>
            <span className="border border-white/20 px-2 py-1">{movie.runtime}</span>
            <Rating value={movie.rating} />
          </div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">{movie.originalTitle}</p>
          <h1 className="font-display text-5xl font-black leading-[0.95] text-stone-50 sm:text-7xl">{movie.title}</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-stone-300">{movie.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={onOpen}>
              <Icon name="play" />
              Үзэх
            </button>
            <button className="btn-secondary" onClick={onToggleSaved}>
              <Icon name={saved ? "check" : "plus"} />
              {saved ? "Хадгалсан" : "Жагсаалт"}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function MovieCard({
  movie,
  saved,
  onOpen,
  onToggleSaved,
}: {
  movie: Movie
  saved: boolean
  onOpen: () => void
  onToggleSaved: () => void
}) {
  return (
    <article className="group overflow-hidden border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-amber-300/40">
      <button className="block w-full text-left" onClick={onOpen}>
        <div className="relative aspect-[2/3] overflow-hidden bg-stone-900">
          <img src={movie.poster} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-80" />
          <span className="absolute left-2 top-2 bg-black/70 px-2 py-1 text-xs font-bold text-stone-100 backdrop-blur">
            {movie.ageRating}
          </span>
          <span className="absolute bottom-2 left-2 rounded-full bg-teal-300 px-2 py-1 text-xs font-bold text-black">
            {movie.trailer}
          </span>
        </div>
      </button>
      <div className="grid gap-2 p-3">
        <div className="flex items-start justify-between gap-3">
          <button className="min-w-0 text-left" onClick={onOpen}>
            <h3 className="font-display text-base font-bold leading-tight text-stone-100">{movie.title}</h3>
            <p className="mt-1 truncate text-xs text-stone-500">{movie.year} · {movie.genres.join(" / ")}</p>
          </button>
          <button
            className={`grid h-8 w-8 shrink-0 place-items-center border transition ${
              saved ? "border-rose-300 bg-rose-300 text-black" : "border-white/10 text-stone-400 hover:text-stone-100"
            }`}
            onClick={onToggleSaved}
            aria-label={saved ? "Жагсаалтаас хасах" : "Жагсаалтад нэмэх"}
          >
            <Icon name="heart" className="h-4 w-4" />
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
          Буцах
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
          </div>
          <p className="mt-6 text-base leading-8 text-stone-300">{movie.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="btn-primary">
              <Icon name="play" />
              Trailer {movie.trailer}
            </button>
            <button className="btn-secondary" onClick={onToggleSaved}>
              <Icon name={saved ? "check" : "plus"} />
              {saved ? "Жагсаалтад байна" : "Жагсаалтад нэмэх"}
            </button>
          </div>

          <div className="mt-9 grid gap-5 border-t border-white/10 pt-7 sm:grid-cols-3">
            <Info label="Найруулагч" value={movie.director} />
            <Info label="Жүжигчид" value={movie.cast.slice(0, 2).join(", ")} />
            <Info label="Эх нэр" value={movie.originalTitle} />
          </div>

          <div className="mt-8 border border-white/10 bg-white/[0.035] p-4">
            <p className="mb-3 text-sm font-bold text-stone-200">Таны үнэлгээ</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className={`grid h-9 w-9 place-items-center border text-sm font-bold ${
                    rating <= userRating ? "border-amber-300 bg-amber-300 text-black" : "border-white/10 text-stone-500"
                  }`}
                  onClick={() => onRate(rating)}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-stone-200">{value}</p>
    </div>
  )
}

function PwaBanner({
  installPrompt,
  updateReady,
  onInstall,
  onUpdate,
  onDismissInstall,
}: {
  installPrompt: BeforeInstallPromptEvent | null
  updateReady: boolean
  onInstall: () => void
  onUpdate: () => void
  onDismissInstall: () => void
}) {
  if (!installPrompt && !updateReady) return null

  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl border border-white/10 bg-[#101014]/95 p-3 text-stone-100 shadow-2xl shadow-black/60 backdrop-blur-xl sm:bottom-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold">
            {updateReady ? "Шинэ хувилбар бэлэн байна" : "Android дээр app болгож суулгах"}
          </p>
          <p className="mt-1 text-xs leading-5 text-stone-400">
            {updateReady
              ? "Товч дарахад app шинэчлэгдээд дахин ачаална."
              : "Home screen дээр app шиг нэмэгдэнэ."}
          </p>
        </div>
        <div className="flex gap-2">
          {updateReady ? (
            <button className="btn-primary h-10" onClick={onUpdate}>
              <Icon name="refresh" />
              Шинэчлэх
            </button>
          ) : (
            <>
              <button className="btn-primary h-10" onClick={onInstall}>
                <Icon name="download" />
                Суулгах
              </button>
              <button className="btn-ghost h-10" onClick={onDismissInstall} aria-label="Нуух">
                <Icon name="x" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>("home")
  const [activeGenre, setActiveGenre] = useState<string>("Бүгд")
  const [sort, setSort] = useState<SortKey>("trending")
  const [query, setQuery] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [updateRegistration, setUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [savedIds, setSavedIds] = useLocalStorage<number[]>("reel.savedMovies", [1, 3])
  const [ratings, setRatings] = useLocalStorage<Record<number, number>>("reel.userRatings", {})

  useEffect(() => {
    const handleInstallReady = (event: WindowEventMap["reel:install-ready"]) => {
      setInstallPrompt(event.detail)
    }
    const handleUpdateReady = (event: WindowEventMap["reel:update-ready"]) => {
      setUpdateRegistration(event.detail)
    }

    window.addEventListener("reel:install-ready", handleInstallReady)
    window.addEventListener("reel:update-ready", handleUpdateReady)

    return () => {
      window.removeEventListener("reel:install-ready", handleInstallReady)
      window.removeEventListener("reel:update-ready", handleUpdateReady)
    }
  }, [])

  const heroMovie = movies.find((movie) => movie.featured) ?? movies[0]
  const savedMovies = movies.filter((movie) => savedIds.includes(movie.id))
  const continueWatching = movies.filter((movie) => movie.progress)

  const visibleMovies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const list = page === "saved" ? savedMovies : movies

    return list
      .filter((movie) => activeGenre === "Бүгд" || movie.genres.includes(activeGenre))
      .filter((movie) => {
        if (!normalizedQuery) return true
        return `${movie.title} ${movie.originalTitle} ${movie.director} ${movie.genres.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery)
      })
      .sort((a, b) => {
        if (sort === "rating") return b.rating - a.rating
        if (sort === "newest") return b.year - a.year
        return Number(b.trending) - Number(a.trending) || b.rating - a.rating
      })
  }, [activeGenre, page, query, savedMovies, sort])

  const toggleSaved = (movieId: number) => {
    setSavedIds((current) =>
      current.includes(movieId) ? current.filter((id) => id !== movieId) : [...current, movieId],
    )
  }

  const rateMovie = (movieId: number, rating: number) => {
    setRatings((current) => ({ ...current, [movieId]: rating }))
  }

  const installApp = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    setInstallPrompt(null)
  }

  const applyUpdate = () => {
    const worker = updateRegistration?.waiting
    if (!worker) {
      window.location.reload()
      return
    }

    worker.postMessage({ type: "SKIP_WAITING" })
  }

  if (selectedMovie) {
    return (
      <DetailView
        movie={selectedMovie}
        saved={savedIds.includes(selectedMovie.id)}
        userRating={ratings[selectedMovie.id] ?? 0}
        onBack={() => setSelectedMovie(null)}
        onToggleSaved={() => toggleSaved(selectedMovie.id)}
        onRate={(rating) => rateMovie(selectedMovie.id, rating)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#07070a] text-stone-100">
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <PwaBanner
        installPrompt={installPrompt}
        updateReady={Boolean(updateRegistration)}
        onInstall={installApp}
        onUpdate={applyUpdate}
        onDismissInstall={() => setInstallPrompt(null)}
      />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#07070a]/86 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <button className="flex items-center gap-2" onClick={() => setPage("home")}>
            <span className="grid h-9 w-9 place-items-center border border-amber-300/50 bg-amber-300/10 text-amber-300">
              <Icon name="play" className="h-4 w-4" />
            </span>
            <span className="font-display text-xl font-black tracking-wide">REEL</span>
          </button>
          <div className="hidden items-center gap-2 md:flex">
            <button className={`nav-link ${page === "home" ? "nav-link-active" : ""}`} onClick={() => setPage("home")}>
              Нүүр
            </button>
            <button className={`nav-link ${page === "saved" ? "nav-link-active" : ""}`} onClick={() => setPage("saved")}>
              Миний жагсаалт
            </button>
          </div>
          <button className="btn-ghost" onClick={() => setShowAuth(true)}>
            <Icon name="user" />
            Нэвтрэх
          </button>
        </nav>
      </header>

      {page === "home" && heroMovie && (
        <Hero
          movie={heroMovie}
          saved={savedIds.includes(heroMovie.id)}
          onOpen={() => setSelectedMovie(heroMovie)}
          onToggleSaved={() => toggleSaved(heroMovie.id)}
        />
      )}

      <main className={`mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-10 ${page === "saved" ? "pt-28" : ""}`}>
        {page === "saved" && (
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">Хувийн сан</p>
            <h1 className="mt-2 font-display text-4xl font-black sm:text-5xl">Миний жагсаалт</h1>
            <p className="mt-3 max-w-xl text-stone-400">
              Таны хадгалсан кинонууд энэ browser дээр үлдэнэ. Энэ нь frontend demo-д тохирох хөнгөн хадгалалт юм.
            </p>
          </div>
        )}

        {page === "home" && (
          <section className="-mt-8 grid gap-3 md:grid-cols-3">
            <Stat label="Нийт кино" value={`${movies.length}`} tone="amber" />
            <Stat label="Trend" value={`${movies.filter((movie) => movie.trending).length}`} tone="rose" />
            <Stat label="Хадгалсан" value={`${savedIds.length}`} tone="teal" />
          </section>
        )}

        {page === "home" && continueWatching.length > 0 && (
          <section className="mt-12">
            <div className="mb-4 flex items-end justify-between">
              <h2 className="font-display text-2xl font-bold">Үргэлжлүүлэн үзэх</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {continueWatching.map((movie) => (
                <button
                  key={movie.id}
                  className="grid grid-cols-[112px_1fr] overflow-hidden border border-white/10 bg-white/[0.035] text-left transition hover:border-teal-300/50"
                  onClick={() => setSelectedMovie(movie)}
                >
                  <img src={movie.backdrop} alt={movie.title} className="h-full min-h-28 w-full object-cover" />
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">{movie.genres[0]}</p>
                    <h3 className="mt-1 font-display text-lg font-bold">{movie.title}</h3>
                    <div className="mt-4 h-1.5 bg-white/10">
                      <div className="h-full bg-teal-300" style={{ width: `${movie.progress ?? 0}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-stone-500">{movie.progress}% үзсэн</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
                {page === "saved" ? "Хадгалсан кино" : "Каталог"}
              </p>
              <h2 className="mt-2 font-display text-3xl font-black">
                {page === "saved" ? "Сонгосон бүтээлүүд" : "Кино сан"}
                <span className="ml-2 text-lg font-medium text-stone-500">({visibleMovies.length})</span>
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-[minmax(220px,320px)_160px]">
              <label className="relative">
                <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  className="input pl-10"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Кино хайх"
                />
              </label>
              <select className="input" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
                <option value="trending">Trend эхэнд</option>
                <option value="rating">Үнэлгээгээр</option>
                <option value="newest">Шинээр</option>
              </select>
            </div>
          </div>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {genres.map((genre) => (
              <button
                key={genre}
                className={`chip ${activeGenre === genre ? "chip-active" : ""}`}
                onClick={() => setActiveGenre(genre)}
              >
                {genre}
              </button>
            ))}
          </div>

          {visibleMovies.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {visibleMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  saved={savedIds.includes(movie.id)}
                  onOpen={() => setSelectedMovie(movie)}
                  onToggleSaved={() => toggleSaved(movie.id)}
                />
              ))}
            </div>
          ) : (
            <div className="border border-white/10 bg-white/[0.035] px-5 py-14 text-center">
              <h3 className="font-display text-2xl font-bold">Илэрц алга</h3>
              <p className="mt-2 text-stone-400">Хайлт эсвэл жанрын сонголтоо өөрчлөөд дахин үзээрэй.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "amber" | "rose" | "teal" }) {
  const tones = {
    amber: "text-amber-200 border-amber-300/30 bg-amber-300/10",
    rose: "text-rose-200 border-rose-300/30 bg-rose-300/10",
    teal: "text-teal-200 border-teal-300/30 bg-teal-300/10",
  }

  return (
    <div className={`border p-5 ${tones[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] opacity-75">{label}</p>
      <p className="mt-2 font-display text-3xl font-black">{value}</p>
    </div>
  )
}
