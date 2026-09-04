import type { Icon } from "@phosphor-icons/react";
import {
  Brain,
  ChartLineUp,
  ClockCountdown,
  Exam,
  ShieldCheck,
  Sparkle,
  Student,
  Trophy,
} from "@phosphor-icons/react";

export type ProgramItem = {
  id: string;
  icon: Icon;
  title: string;
  tag: string;
  description: string;
  features: string[];
};

export type PricingItem = {
  id: string;
  name: string;
  period: string;
  price: string;
  originalPrice?: string;
  badge?: string;
  isPopular?: boolean;
  features: string[];
  cta: string;
};

export type AdvantageItem = {
  icon: Icon;
  title: string;
  description: string;
};

export type TestimonialItem = {
  name: string;
  campus: string;
  major: string;
  quote: string;
  score: string;
  avatarText: string;
};

export const heroStats = [
  { value: "15.000+", label: "Calon Mahasiswa" },
  { value: "50.000+", label: "Bank Soal SNBT" },
  { value: "94%", label: "Tingkat Kelulusan" },
  { value: "4.9/5.0", label: "Rating Kepuasan" },
] as const;

export const programsList: ProgramItem[] = [
  {
    id: "tryout-cbt",
    icon: ClockCountdown,
    title: "Try Out CBT Online",
    tag: "Simulasi Ujian",
    description: "Simulasi ujian penuh dengan sistem timer presisi dan format subtes SNBT 2026.",
    features: ["Sistem Penilaian IRT", "Timer per Subtes", "Ranking Nasional"],
  },
  {
    id: "analytics",
    icon: ChartLineUp,
    title: "Analisis & Rapor Belajar",
    tag: "Evaluasi Skor",
    description: "Ketahui kelemahanmu secara detail per topik agar waktu belajar lebih efisien.",
    features: ["Diagnostik Kelemahan", "Riwayat Nilai", "Rekomendasi Review"],
  },
  {
    id: "drill-soal",
    icon: Exam,
    title: "Drill Soal & Flashcards",
    tag: "Latihan Mandiri",
    description: "Latihan kilat 10-15 menit per hari untuk mengunci rumus dan konsep penting.",
    features: ["Ribuan Bank Soal", "Flashcards Materi", "Kunci & Pembahasan"],
  },
  {
    id: "ai-tutor",
    icon: Brain,
    title: "Asisten Pembahasan AI",
    tag: "Tutor Pintar",
    description: "Bedah tuntas cara pengerjaan cepat dan jebakan soal secara instan 24/7.",
    features: ["Solusi Bertahap", "Analisis Miskonsepsi", "Trik Cepat Soal"],
  },
];

export const advantagesList: AdvantageItem[] = [
  {
    icon: ShieldCheck,
    title: "Standar SNBT Terbaru",
    description: "Materi & tipe soal selalu diperbarui mengikuti regulasi seleksi PTN terkini.",
  },
  {
    icon: Sparkle,
    title: "Akses Fleksibel & Cepat",
    description: "Bisa diakses dari HP, tablet, maupun laptop kapan saja dan di mana saja.",
  },
  {
    icon: Trophy,
    title: "Metode Terbukti Efektif",
    description: "Fokus pada latihan berulang (drill) untuk membangun ritme dan ketahanan ujian.",
  },
  {
    icon: Student,
    title: "Komunitas Pejuang PTN",
    description: "Bandingkan skormu di leaderboard nasional bersama ribuan peserta se-Indonesia.",
  },
];

export const pricingPlans: PricingItem[] = [
  {
    id: "starter",
    name: "Paket Kilat 7 Hari",
    period: "/ 7 Hari",
    price: "Rp49.000",
    originalPrice: "Rp79.000",
    features: [
      "5x Akses Try Out CBT Lengkap",
      "Latihan Drill per Subtes Mandiri",
      "Analisis Skor & Kunci Jawaban",
      "Akses Ribuan Flashcards Materi",
    ],
    cta: "Pilih Paket 7 Hari",
  },
  {
    id: "pro",
    name: "Paket Intensif 30 Hari",
    period: "/ 30 Hari",
    price: "Rp129.000",
    originalPrice: "Rp229.000",
    badge: "Paling Diminati",
    isPopular: true,
    features: [
      "Akses Try Out CBT Tanpa Batas",
      "Sistem Penilaian IRT & Ranking Nasional",
      "Rapor Diagnostik Area Lemah",
      "Pembahasan Soal Interaktif AI 24/7",
      "Akses Bank Soal & Materi PPT Lengkap",
      "Grup Diskusi & Update Informasi SNBT",
    ],
    cta: "Daftar Paket Intensif",
  },
];

export const studentTestimonials: TestimonialItem[] = [
  {
    name: "Rizky Pratama",
    campus: "Universitas Indonesia",
    major: "Pendidikan Dokter (FK UI)",
    score: "734.50",
    quote:
      "Simulasi timernya bener-bener mirip ujian asli. Analisis nilainya ngebantu banget naikin skor Penalaran Matematika!",
    avatarText: "RP",
  },
  {
    name: "Nabila Annisa",
    campus: "Institut Teknologi Bandung",
    major: "STEI-Rekayasa (ITB)",
    score: "718.20",
    quote:
      "Sistem drill soalnya ringkas dan gak ribet. Bisa latihan di mana aja dari HP pas ada waktu luang.",
    avatarText: "NA",
  },
  {
    name: "Fajar Wicaksono",
    campus: "Universitas Gadjah Mada",
    major: "Ilmu Komunikasi (UGM)",
    score: "695.80",
    quote:
      "Penjelasan pembahasannya jelas dan langsung ke inti. Sangat worth it untuk persiapan intensif sebelum hari H.",
    avatarText: "FW",
  },
];

export const targetCampuses = [
  "Universitas Indonesia (UI)",
  "Institut Teknologi Bandung (ITB)",
  "Universitas Gadjah Mada (UGM)",
  "Universitas Airlangga (UNAIR)",
  "Institut Teknologi Sepuluh Nopember (ITS)",
  "Universitas Padjadjaran (UNPAD)",
  "Universitas Diponegoro (UNDIP)",
] as const;
