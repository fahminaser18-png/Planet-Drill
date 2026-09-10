import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Target, Library, LineChart, CheckCircle2, Award } from "lucide-react";
import MarketingShell from "../components/layout/marketing-shell";
import { Button } from "../components/ui/button";

export default function HomePage() {
  const [proPlan, setProPlan] = useState<"1_month" | "6_months" | "1_year">("1_month");

  const pricingData = {
    "1_month": {
      price: "Rp 70rb",
      period: "/bulan",
      originalPrice: null,
      daily: "Setara Rp 2.400/hari"
    },
    "6_months": {
      price: "Rp 250rb",
      period: "/6 bulan",
      originalPrice: "Rp 420rb",
      daily: "Setara Rp 1.400/hari"
    },
    "1_year": {
      price: "Rp 500rb",
      period: "/1 tahun",
      originalPrice: "Rp 840rb",
      daily: "Setara Rp 1.400/hari"
    }
  };

  const currentPro = pricingData[proPlan];

  return (
    <MarketingShell>
      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-[85vh] flex items-center justify-center px-6 md:px-12 lg:px-24 py-24 lg:py-32 bg-background overflow-hidden">
        {/* Background Gradients */}
        <div 
          className="absolute inset-0 w-full h-full pointer-events-none opacity-30 mix-blend-multiply" 
          style={{
            backgroundImage: "radial-gradient(circle at 80% 20%, rgba(79, 70, 229, 0.15), transparent 40%), radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.1), transparent 40%)"
          }}
        />
        
        <div className="relative w-full mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-24 z-10">
          <div className="w-full md:w-3/5 flex flex-col items-start gap-8 z-10 relative">
            <h1 className="text-4xl md:text-5xl lg:text-[4rem] xl:text-[4.5rem] font-extrabold text-foreground leading-[1.1] tracking-tight w-full">
              <span className="inline-block">Lolos PTN impian dengan</span> <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">
                Drilling SNBT Unlimited
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] leading-relaxed">
              Persiapan SNBT yang lebih terarah. Akses soal UTBK asli, flash card interaktif, analisis kelemahan detail, dan asisten AI cerdas 24/7 untuk maksimalkan skormu.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mt-4 w-full sm:w-auto">
              <Button asChild size="lg" className="h-14 px-8 text-base shadow-[0_4px_20px_rgba(79,70,229,0.2)] hover:shadow-xl hover:-translate-y-0.5 transition-all rounded-full group w-full sm:w-auto">
                <Link to="/auth/login?view=register">
                  Mulai Coba Gratis
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            
            {/* Zero-Customer Micro Trust */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mt-2 text-sm font-medium text-muted-foreground/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Soal UTBK HOTS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Daftar Tanpa Kartu Kredit</span>
              </div>
            </div>
          </div>

          <div className="w-full md:w-2/5 relative mt-16 md:mt-0 perspective-1000">
            {/* Premium Stock Photo of Student Studying */}
            <div className="relative w-full aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl z-10 border border-border/50 group transition-transform duration-700 hover:-translate-y-2">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                alt="Siswa fokus belajar untuk SNBT menggunakan laptop"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-transparent opacity-80 mix-blend-multiply pointer-events-none"></div>
            </div>

            {/* Decorative blurs behind mockup */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none mix-blend-screen"></div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section id="program" className="w-full py-24 lg:py-32 px-6 md:px-12 lg:px-24 bg-card border-y border-border/50">
        <div className="w-full mx-auto max-w-7xl">
          <div className="mb-16 md:mb-24 md:w-3/4 lg:w-2/3">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-6 tracking-tight leading-[1.1]">
              Sistem Belajar yang <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">Mengerti Kelemahanmu</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Berhenti membuang waktu mempelajari materi yang sudah kamu kuasai. Kami menganalisis setiap jawabanmu untuk menemukan topik yang masih lemah, lalu memberikan latihan dan panduan AI agar skormu naik lebih cepat.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Bento Block 1 - Large Horizontal */}
            <div className="md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-background border border-border/60 hover:border-primary/30 p-8 md:p-12 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
              <div className="absolute -right-8 -top-8 text-primary/[0.03] transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
                <Target className="w-80 h-80" />
              </div>
              <div className="relative z-10 flex flex-col h-full min-h-[280px]">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                  <Target className="h-8 w-8" />
                </div>
                <div className="mt-auto">
                  <h3 className="text-3xl font-bold text-foreground mb-4 tracking-tight">Drilling Soal Tanpa Batas</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                    Latihan soal SNBT sepuasnya. Pilih topik secara spesifik hingga tingkat subtes untuk mempertajam materi yang paling kamu butuhkan.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Block 2 - Small Vertical */}
            <div className="md:col-span-2 lg:col-span-1 group relative overflow-hidden rounded-[2.5rem] bg-background border border-border/60 hover:border-primary/30 p-8 md:p-10 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1">
              <div className="absolute -right-4 -bottom-4 text-primary/[0.03] transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-12 pointer-events-none">
                <LineChart className="w-48 h-48" />
              </div>
              <div className="relative z-10 flex flex-col h-full min-h-[280px]">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-8 transition-colors duration-500 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm">
                  <LineChart className="h-7 w-7" />
                </div>
                <div className="mt-auto">
                  <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">Analisis Kelemahan Akurat</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    Ketahui di mana letak kesalahanmu. Sistem mendeteksi topik yang sering gagal dijawab dan memberikan rekomendasi perbaikan.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Block 3 - Full Width Hero */}
            <div className="md:col-span-2 lg:col-span-3 group relative overflow-hidden rounded-[2.5rem] bg-primary border border-primary-foreground/10 p-8 md:p-12 lg:p-16 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(79,70,229,0.25)] hover:-translate-y-1">
              <div className="absolute right-0 bottom-0 text-white/5 transition-transform duration-1000 group-hover:scale-110 group-hover:-translate-x-4 pointer-events-none translate-y-1/4 translate-x-1/4">
                <Library className="w-96 h-96" />
              </div>
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12 lg:gap-16">
                <div className="w-20 h-20 shrink-0 rounded-3xl bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <Library className="h-10 w-10" />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Fasilitas Belajar Terintegrasi</h3>
                  <p className="text-lg md:text-xl text-primary-foreground/90 leading-relaxed max-w-3xl font-medium">
                    Fasilitas lengkap untuk mempercepat pemahaman. Gunakan Flash Card interaktif, rangkuman materi, dan asisten AI yang siap memecahkan kebingunganmu 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 AUTHORITY QUOTE SECTION */}
      <section className="w-full py-20 px-6 md:px-12 lg:px-24 bg-primary text-primary-foreground relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="w-full max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <svg className="w-12 h-12 text-primary-foreground/20 mb-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-8 text-white">
            "Pendidikan adalah tiket ke masa depan. Hari esok dimiliki oleh orang-orang yang mempersiapkannya hari ini."
          </h2>
          <div className="flex flex-col items-center">
            <div className="font-semibold text-lg text-white">Malcolm X</div>
          </div>
        </div>
      </section>

      {/* 3. PRICING SECTION */}
      <section id="biaya" className="w-full py-24 lg:py-32 px-6 md:px-12 lg:px-24 bg-background relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        
        <div className="w-full mx-auto relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm tracking-widest uppercase mb-6 shadow-sm">
            Pilihan Paket
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-10 tracking-tight">
            Investasi Masa Depanmu
          </h2>
          
          <div className="flex flex-col lg:flex-row justify-center gap-8 w-full max-w-5xl items-stretch">
            {/* Basic Tier Wrapper */}
            <div className="flex-1 flex flex-col relative">
              {/* Invisible spacer matching the height of Pro toggle */}
              <div className="hidden lg:flex p-1.5 w-fit mx-auto invisible pointer-events-none mb-6">
                <div className="px-6 py-2 text-sm font-bold">Spacer</div>
              </div>

              {/* Basic Tier Card */}
              <div className="flex-1 bg-card border border-border/60 p-10 lg:p-12 rounded-[2rem] shadow-sm relative flex flex-col text-left transition-transform hover:-translate-y-2 duration-300">
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Gratis</h3>
                  <p className="text-muted-foreground">Alat persiapan esensial untuk memulai.</p>
                </div>

                {/* Spacer matching Promo Original Price row */}
                <div className="hidden lg:block h-6 mb-1"></div>

                <div className="mb-10 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-foreground tracking-tight">Rp 0</span>
                </div>
                <ul className="flex flex-col gap-5 mb-12 flex-1">
                  <li className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    <span>Akses Try Out gratis</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full h-14 rounded-full text-base font-semibold border-border hover:bg-muted mt-auto">
                  <Link to="/auth/login?view=register">Mulai Sekarang</Link>
                </Button>
              </div>
            </div>
  
            {/* Pro Tier Wrapper */}
            <div className="flex-1 flex flex-col relative">
              {/* Pro Price Toggle directly above card */}
              <div className="flex bg-secondary rounded-full p-1.5 mb-6 relative z-10 w-fit mx-auto shadow-inner">
                <button 
                  onClick={() => setProPlan("1_month")} 
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${proPlan === "1_month" ? "bg-background text-foreground shadow-md" : "text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-background/50"}`}
                >
                  1 Bulan
                </button>
                <button 
                  onClick={() => setProPlan("6_months")} 
                  className={`relative px-6 py-2 rounded-full text-sm font-bold transition-all ${proPlan === "6_months" ? "bg-background text-foreground shadow-md" : "text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-background/50"}`}
                >
                  6 Bulan
                </button>
                <button 
                  onClick={() => setProPlan("1_year")} 
                  className={`relative px-6 py-2 rounded-full text-sm font-bold transition-all ${proPlan === "1_year" ? "bg-background text-foreground shadow-md" : "text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-background/50"}`}
                >
                  1 Tahun
                  <span className="absolute -top-2.5 -right-2 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                    PROMO
                  </span>
                </button>
              </div>

              {/* Pro Tier Card */}
              <div className="flex-1 bg-primary p-10 lg:p-12 rounded-[2rem] shadow-2xl relative flex flex-col text-left transition-transform hover:-translate-y-2 duration-300 overflow-hidden border border-primary-foreground/10">
                {/* Giant background icon */}
                <div className="absolute -top-4 -right-4 p-6 opacity-10 pointer-events-none">
                  <Award className="w-48 h-48 text-primary-foreground" />
                </div>
                
                <div className="mb-4 relative z-10">
                  <h3 className="text-2xl font-bold text-primary-foreground mb-2">Pro</h3>
                  <p className="text-primary-foreground/80">Paket terlengkap untuk peserta serius.</p>
                </div>
  
                {/* Price Display */}
                <div className="mb-10 flex flex-col gap-1 relative z-10">
                  {currentPro.originalPrice ? (
                    <div className="flex items-center h-6">
                      <span className="text-primary-foreground/60 line-through font-medium">
                        {currentPro.originalPrice}
                      </span>
                      <span className="bg-emerald-400 text-emerald-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ml-2">
                        Promo Terbatas
                      </span>
                    </div>
                  ) : (
                    <div className="h-6"></div>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-primary-foreground tracking-tight">
                      {currentPro.price}
                    </span>
                    <span className="text-primary-foreground/70 font-medium">
                      {currentPro.period}
                    </span>
                  </div>
                </div>
  
                <ul className="flex flex-col gap-5 mb-8 flex-1 relative z-10">
                  <li className="flex items-start gap-3 text-primary-foreground">
                    <CheckCircle2 className="h-6 w-6 text-primary-foreground/80 shrink-0" />
                    <span>Try out unlimited</span>
                  </li>
                  <li className="flex items-start gap-3 text-primary-foreground">
                    <CheckCircle2 className="h-6 w-6 text-primary-foreground/80 shrink-0" />
                    <span>Try Out soal UTBK tahun-tahun sebelumnya</span>
                  </li>
                  <li className="flex items-start gap-3 text-primary-foreground">
                    <CheckCircle2 className="h-6 w-6 text-primary-foreground/80 shrink-0" />
                    <span>Rangkuman Materi</span>
                  </li>
                  <li className="flex items-start gap-3 text-primary-foreground">
                    <CheckCircle2 className="h-6 w-6 text-primary-foreground/80 shrink-0" />
                    <span>Flash Card Interaktif</span>
                  </li>
                  <li className="flex items-start gap-3 text-primary-foreground">
                    <CheckCircle2 className="h-6 w-6 text-primary-foreground/80 shrink-0" />
                    <span>Asisten AI 24/7</span>
                  </li>
                  <li className="flex items-start gap-3 text-primary-foreground">
                    <CheckCircle2 className="h-6 w-6 text-primary-foreground/80 shrink-0" />
                    <span>Analisis kelemahan detail</span>
                  </li>
                </ul>
                
                <div className="w-full text-center mb-4 relative z-10">
                  <span className="inline-block bg-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-xl text-sm shadow-md">
                    {currentPro.daily}
                  </span>
                </div>

                <Button asChild className="w-full h-14 rounded-full bg-primary-foreground text-primary hover:bg-white text-base font-bold shadow-lg hover:shadow-xl transition-all relative z-10 mt-auto mb-3">
                  <Link to="/auth/login?view=register">Tingkatkan ke Pro</Link>
                </Button>
                
                {/* Risk Reversal */}
                <div className="flex items-center justify-center gap-1.5 text-primary-foreground/70 text-xs font-medium relative z-10">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Pembayaran 100% Aman & Instan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
