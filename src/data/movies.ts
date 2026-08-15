import type { Movie } from "../types"

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

export const demoMovies: Movie[] = [
  {
    id: "signal-void",
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
    status: "published",
    priceMnt: 0,
  },
  {
    id: "red-meridian",
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
    status: "published",
    priceMnt: 5000,
  },
  {
    id: "amber-shore",
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
    featured: false,
    trending: false,
    status: "published",
    priceMnt: 0,
  },
  {
    id: "bonewood",
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
    featured: false,
    trending: true,
    status: "published",
    priceMnt: 7000,
  },
]
