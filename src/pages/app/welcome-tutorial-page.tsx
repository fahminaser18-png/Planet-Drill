import { Link } from "react-router";
import { GraduationCap, LayoutDashboard, ArrowRight } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Apa bedanya Simulasi Try Out rutin dan Scheduled Try Out?",
    answer:
      "Simulasi Try Out rutin dapat diakses kapan saja secara fleksibel berdasarkan topik, blok, atau paket latihan. Sementara Scheduled Try Out adalah simulasi try out berjadwal serentak nasional dengan timer ketat dan pemeringkatan leaderboard.",
  },
  {
    question: "Bagaimana cara kerja Flash Cards & Kartu Saku?",
    answer:
      "Flash Cards membantu Anda mempercepat hafalan rumus, konsep penting, tata bahasa, dan fakta sains. Anda bisa memakai deck bawaan kurikulum UTBK atau membuat kartu saku otomatis dari rangkuman materi Anda.",
  },
  {
    question: "Apakah hasil Try Out saya dapat dilihat kembali untuk dievaluasi?",
    answer:
      "Ya, setiap ujian yang diselesaikan akan tersimpan di Bedah Pembahasan. Anda dapat meninjau rasional jawaban, kunci pembahasan, indikator kesulitan soal, serta grafik analitik kelemahan per kategori topik.",
  },
  {
    question: "Bagaimana jika saya ingin fokus pada materi yang nilai performanya masih rendah?",
    answer:
      "Gunakan menu Analitik & Laporan Performa. Sistem mendeteksi kategori soal di mana akurasi Anda masih di bawah target dan menyarankan paket try out serta flashcard khusus untuk memperbaikinya.",
  },
];

export default function WelcomeTutorialPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-white pb-24">
      <header className="sticky top-0 z-50 bg-slate-950/80 px-4 lg:px-8 py-3.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/app" className="flex items-center gap-2.5 rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none transition-all duration-200 hover:-translate-y-0.5">
              <div className="w-8 h-8 rounded bg-teal-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-base text-slate-100">
                Planet Drill UTBK
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300">
              Panduan Pengguna
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#roadmap" className="transition-colors duration-200 hover:text-slate-100 rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none">Roadmap</a>
            <a href="#fitur" className="transition-colors duration-200 hover:text-slate-100 rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none">Fitur</a>
            <a href="#tips" className="transition-colors duration-200 hover:text-slate-100 rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none">Tips</a>
            <a href="#faq" className="transition-colors duration-200 hover:text-slate-100 rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium bg-teal-600 text-white transition-all duration-200 hover:bg-teal-500 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-20 pb-16 px-4 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-semibold text-slate-100 tracking-tight">
          Panduan Persiapan UTBK SNBT
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Platform persiapan UTBK. Kuasai materi TPS, Literasi, Sains, dan Soshum melalui simulasi CBT, analitik, serta Flash Cards.
        </p>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/app"
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium bg-teal-600 text-white transition-all duration-200 hover:bg-teal-500 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
          >
            <span>Mulai Belajar</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
          <a
            href="#fitur"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium text-slate-300 transition-all duration-200 hover:text-slate-100 hover:bg-slate-800/50 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none"
          >
            Jelajahi Fitur
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 pt-16 text-left">
          <div className="space-y-1">
            <p className="font-medium text-slate-100">500+ Soal</p>
            <p className="text-sm text-slate-400">Try out CBT format UTBK</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-slate-100">Bedah Detail</p>
            <p className="text-sm text-slate-400">Pembahasan komprehensif</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-slate-100">Flash Cards</p>
            <p className="text-sm text-slate-400">Hafalan rumus & konsep</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium text-slate-100">Material Drive</p>
            <p className="text-sm text-slate-400">Slide PPT & Recording</p>
          </div>
        </div>
      </section>

      <section id="roadmap" className="py-16 px-4 lg:px-8 max-w-5xl mx-auto">
        <div className="space-y-2 mb-10">
          <h2 className="text-2xl font-semibold text-slate-100">Roadmap Belajar</h2>
          <p className="text-slate-400">Alur sistematis membangun kesiapan mental dan akademis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-500">Langkah 1</div>
            <h3 className="text-base font-medium text-slate-100">Uji Kemampuan Awal</h3>
            <p className="text-sm text-slate-400">
              Mulai dengan Simulasi Try Out untuk mengukur pemahaman awal pada materi UTBK SNBT.
            </p>
          </div>
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-500">Langkah 2</div>
            <h3 className="text-base font-medium text-slate-100">Bedah Pembahasan</h3>
            <p className="text-sm text-slate-400">
              Pelajari rasionalitas tiap opsi jawaban, analisis grafik performa, dan identifikasi materi.
            </p>
          </div>
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-500">Langkah 3</div>
            <h3 className="text-base font-medium text-slate-100">Perdalam Materi</h3>
            <p className="text-sm text-slate-400">
              Manfaatkan Flash Cards untuk memperkuat ingatan formula, serta pelajari slide kuliah.
            </p>
          </div>
          <div className="space-y-3">
            <div className="text-sm font-medium text-slate-500">Langkah 4</div>
            <h3 className="text-base font-medium text-slate-100">Evaluasi TO Akbar</h3>
            <p className="text-sm text-slate-400">
              Uji ketahanan mental pada Scheduled Try Out serentak nasional dan ukur posisi Anda.
            </p>
          </div>
        </div>
      </section>

      <section id="fitur" className="py-16 px-4 lg:px-8 max-w-5xl mx-auto">
        <div className="space-y-2 mb-10">
          <h2 className="text-2xl font-semibold text-slate-100">Fitur Utama</h2>
          <p className="text-slate-400">Alat untuk mempercepat persiapan ujian Anda.</p>
        </div>

        <div className="space-y-12">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-100">Simulasi Try Out & Latihan</h3>
            <p className="text-sm text-slate-400 max-w-2xl">
              Latihan soal CBT interaktif dengan timer standar UTBK. Pilih latihan berdasarkan topik tertentu atau paket Try Out komprehensif.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span>1. Pilih Topik/Blok</span>
              <span>2. Kerjakan dengan Timer</span>
              <span>3. Simpan & Evaluasi</span>
            </div>
            <Link to="/app/tryout-selection" className="inline-block text-sm text-teal-400 mt-2 transition-all duration-200 hover:text-teal-300 hover:-translate-y-0.5 rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none">
              Mulai Latihan Mandiri &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-100">Analitik & Laporan Performa</h3>
            <p className="text-sm text-slate-400 max-w-2xl">
              Pantau perkembangan akurasi dalam bentuk grafik visual. Sistem menandai kategori materi yang masih menjadi titik lemah.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span>1. Buka Menu Analitik</span>
              <span>2. Cek Grafik Akurasi</span>
              <span>3. Identifikasi Topik Lemah</span>
            </div>
            <Link to="/app/analytics" className="inline-block text-sm text-teal-400 mt-2 transition-all duration-200 hover:text-teal-300 hover:-translate-y-0.5 rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none">
              Lihat Grafik Statistik &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-100">Flash Cards & Kartu Saku</h3>
            <p className="text-sm text-slate-400 max-w-2xl">
              Kuasai rumus dan konsep penting. Gunakan Generator untuk mengubah catatan singkat menjadi deck flash card interaktif.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span>1. Pilih Deck</span>
              <span>2. Gunakan Generator</span>
              <span>3. Uji Hafalan</span>
            </div>
            <Link to="/app/flash-cards" className="inline-block text-sm text-teal-400 mt-2 transition-all duration-200 hover:text-teal-300 hover:-translate-y-0.5 rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none">
              Buka Deck Kartu Saku &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-100">Area Belajar & Material Drive</h3>
            <p className="text-sm text-slate-400 max-w-2xl">
              Pusat dokumen materi bimbingan belajar UTBK, ringkasan rumus, slide materi mentor.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span>1. Masuk Area Belajar</span>
              <span>2. Unduh PPT & Summary</span>
            </div>
            <Link to="/app/area-belajar" className="inline-block text-sm text-teal-400 mt-2 transition-all duration-200 hover:text-teal-300 hover:-translate-y-0.5 rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none">
              Unduh Dokumentasi Materi &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-100">Scheduled Try Out & Leaderboard</h3>
            <p className="text-sm text-slate-400 max-w-2xl">
              Simulasi Ujian Akbar Berjadwal serentak nasional. Rasakan tekanan waktu simulasi UTBK SNBT dan lihat peringkat nasional Anda.
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              <span>1. Daftar Jadwal</span>
              <span>2. Ikuti Simulasi</span>
              <span>3. Pantau Leaderboard</span>
            </div>
            <Link to="/app/scheduled-tryout" className="inline-block text-sm text-teal-400 mt-2 transition-all duration-200 hover:text-teal-300 hover:-translate-y-0.5 rounded focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-none">
              Ikuti Try Out Akbar &rarr;
            </Link>
          </div>
        </div>
      </section>

      <section id="tips" className="py-16 px-4 lg:px-8 max-w-5xl mx-auto">
        <div className="space-y-2 mb-10">
          <h2 className="text-2xl font-semibold text-slate-100">Strategi Belajar</h2>
          <p className="text-slate-400">Rutinitas ideal yang direkomendasikan peserta UTBK terbaik.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-100">Rutinitas Harian</h3>
              <p className="text-sm text-slate-400">30-45 Menit per hari</p>
            </div>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="text-slate-500">&mdash;</span>
                <span>Kerjakan 10-15 Soal Simulasi Topik Lemah setiap pagi sebelum memulai aktivitas.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-500">&mdash;</span>
                <span>Ulas 20 Flash Cards untuk memperkuat memori konsep penting dan rumus.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-500">&mdash;</span>
                <span>Baca 1 lembar ringkasan pedoman terapi di Material Drive.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-100">Rutinitas Mingguan</h3>
              <p className="text-sm text-slate-400">Evaluasi dan simulasi penuh</p>
            </div>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex gap-3">
                <span className="text-slate-500">&mdash;</span>
                <span>Ikuti 1 Paket Try Out 50 Soal komprehensif di akhir pekan dengan timer ketat.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-500">&mdash;</span>
                <span>Bedah secara mendalam semua jawaban salah dan catat kata kunci materi baru.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-slate-500">&mdash;</span>
                <span>Ikuti Scheduled Try Out Akbar Nasional jika jadwal telah dibuka.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 px-4 lg:px-8 max-w-3xl mx-auto">
        <div className="space-y-2 mb-10">
          <h2 className="text-2xl font-semibold text-slate-100">FAQ</h2>
          <p className="text-slate-400">Pertanyaan umum peserta UTBK.</p>
        </div>

        <div className="space-y-6">
          {FAQ_ITEMS.map((item, index) => (
            <div key={index} className="space-y-2">
              <h3 className="font-medium text-slate-100">{item.question}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
