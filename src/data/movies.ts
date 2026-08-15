export type Movie = {
  id: number
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
  featured?: boolean
  trending?: boolean
  progress?: number
}

export const genres = [
  "Бүгд",
  "Экшн",
  "Драма",
  "Гэмт хэрэг",
  "Нууц",
  "Аймшиг",
  "Фантастик",
  "Триллер",
] as const

export const movies: Movie[] = [
  {
    id: 1,
    title: "Хоосон дохио",
    originalTitle: "Signal Void",
    year: 2026,
    genres: ["Фантастик", "Триллер"],
    rating: 8.7,
    runtime: "2ц 11м",
    ageRating: "13+",
    director: "Клэйр Новак",
    cast: ["Этан Марлоу", "Саша Вейл", "Дориан Круз"],
    description:
      "Сансрын холбооны офицер ой санамж болон бодит байдлын хил заагийг нураах дохиог таслан авна. Баг нь задарч эхлэх тусам тэр үнэнд хүрэхийн тулд юуг золиослохоо шийдэх хэрэгтэй болно.",
    poster:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=700&h=1050&fit=crop&auto=format",
    backdrop:
      "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1600&h=900&fit=crop&auto=format",
    trailer: "01:48",
    featured: true,
    trending: true,
    progress: 62,
  },
  {
    id: 2,
    title: "Улаан меридиан",
    originalTitle: "Red Meridian",
    year: 2025,
    genres: ["Экшн", "Гэмт хэрэг"],
    rating: 8.1,
    runtime: "1ц 58м",
    ageRating: "16+",
    director: "Маркус Оби",
    cast: ["Лайла Фрост", "Жин Пак", "Рената Солис"],
    description:
      "Нэр хүндгүй болсон дипломатч дайныг эхлүүлэх нотлох баримт авчирсан хуучин куратороо хамгаалахаар далд ертөнц рүү буцаж татагдана.",
    poster:
      "https://images.unsplash.com/photo-1526505262320-81542978f63b?w=700&h=1050&fit=crop&auto=format",
    backdrop:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1600&h=900&fit=crop&auto=format",
    trailer: "02:12",
    featured: true,
    trending: true,
  },
  {
    id: 3,
    title: "Анбар эрэг",
    originalTitle: "Amber Shore",
    year: 2024,
    genres: ["Драма", "Нууц"],
    rating: 8.4,
    runtime: "2ц 04м",
    ageRating: "12+",
    director: "Юки Танабэ",
    cast: ["Амос Фрей", "Селест Хорн", "Пётр Валенса"],
    description:
      "Манантай загасчны тосгонд гэрлийн асрагч охиныхоо алга болсон явдлыг арван жилийн өмнөх нууж дарагдсан хэрэгтэй холбон илрүүлнэ.",
    poster:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=700&h=1050&fit=crop&auto=format",
    backdrop:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600&h=900&fit=crop&auto=format",
    trailer: "01:36",
    progress: 34,
  },
  {
    id: 4,
    title: "Яс ой",
    originalTitle: "Bonewood",
    year: 2026,
    genres: ["Аймшиг", "Триллер"],
    rating: 7.8,
    runtime: "1ц 47м",
    ageRating: "18+",
    director: "Надиа Элхоут",
    cast: ["Тобиас Вейн", "Грэйс Окафор", "Лена Мюллер"],
    description:
      "Зургаан аялагч хамгаалагдсан зэрлэг газарт ороод гарч ирдэг. Гэхдээ тэдний бүх дурсамж өөрчлөгдсөн бөгөөд ой тэднийг дагаж ирсэн байна.",
    poster:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=700&h=1050&fit=crop&auto=format",
    backdrop:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=900&fit=crop&auto=format",
    trailer: "01:21",
    trending: true,
  },
  {
    id: 5,
    title: "Эргэлдэх протокол",
    originalTitle: "Orbit Protocol",
    year: 2025,
    genres: ["Фантастик", "Экшн"],
    rating: 7.6,
    runtime: "2ц 18м",
    ageRating: "13+",
    director: "Дани Рейес",
    cast: ["Маркус Холм", "Прия Найр", "Сэм Эйкерс"],
    description:
      "Квант хиймэл оюун хяналтаас гарахад түүнийг зогсоож чадах цорын ганц хүн бол өөрийн бүтээсэн системээсээ нуугдаж буй мэдээлэл задруулагч юм.",
    poster:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&h=1050&fit=crop&auto=format",
    backdrop:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&h=900&fit=crop&auto=format",
    trailer: "02:05",
    trending: true,
  },
  {
    id: 6,
    title: "Лейне дэх манан",
    originalTitle: "Mist on Leine",
    year: 2024,
    genres: ["Драма", "Гэмт хэрэг"],
    rating: 8.8,
    runtime: "2ц 31м",
    ageRating: "16+",
    director: "Ана Луиза Пинто",
    cast: ["Виктор Шольц", "Мара Ибаньес", "Отто Райнхардт"],
    description:
      "Ганновер дахь тэтгэвэрт гарсан мөрдөгч өөрийн шийдэгдээгүй өнгөрсөнтэй давхцсан хуучин хэргийн мөрөөр дахин орно.",
    poster:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=700&h=1050&fit=crop&auto=format",
    backdrop:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&h=900&fit=crop&auto=format",
    trailer: "02:24",
  },
  {
    id: 7,
    title: "Нарны доорх хот",
    originalTitle: "City Under Sun",
    year: 2026,
    genres: ["Драма"],
    rating: 7.9,
    runtime: "1ц 42м",
    ageRating: "PG",
    director: "Мила Саруул",
    cast: ["Энхжин Бат", "Оюу Номин", "Темир Баяр"],
    description:
      "Их хотын зуны халуунд гурван танихгүй хүн нэг өдрийн турш амьдралаа өөрчлөх сонголттой нүүр тулна.",
    poster:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=700&h=1050&fit=crop&auto=format",
    backdrop:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1600&h=900&fit=crop&auto=format",
    trailer: "01:18",
  },
  {
    id: 8,
    title: "Сүүдрийн гэрээ",
    originalTitle: "Shadow Pact",
    year: 2025,
    genres: ["Нууц", "Триллер"],
    rating: 8.2,
    runtime: "1ц 55м",
    ageRating: "16+",
    director: "Рахим Сато",
    cast: ["Нора Ким", "Жеймс Ивар", "Ариун Заяа"],
    description:
      "Нэгэн хотын архивч нас барсан хүний гарын үсэгтэй гэрээ олсноор эрх мэдлийн далд сүлжээг илрүүлнэ.",
    poster:
      "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=700&h=1050&fit=crop&auto=format",
    backdrop:
      "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?w=1600&h=900&fit=crop&auto=format",
    trailer: "01:57",
  },
]
