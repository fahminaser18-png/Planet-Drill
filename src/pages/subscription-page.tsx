import { CheckCircle2, Award, Lock, Loader2 } from "lucide-react";
import Button from "../components/ui/button";
import { Link } from "react-router";
import { useState } from "react";
import { createMidtransTransaction } from "../lib/api/payment-api";
import { toast } from "sonner";
import { useSession } from "../lib/auth/use-session";
import { useNavigate } from "react-router";

import ProductShell from "../components/layout/product-shell";
import { useStudentShell } from "./app/use-student-shell";
import { productShellMeta } from "../mocks/student-dashboard";

export default function SubscriptionPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);

  const handlePayment = async (packageCode: string) => {
    if (!user) {
      toast.info("Silakan login terlebih dahulu untuk berlangganan");
      navigate("/auth/login?view=register");
      return;
    }
    
    try {
      setLoadingPkg(packageCode);
      const data = await createMidtransTransaction(packageCode);
      
      // @ts-ignore
      if (window.snap) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: function(result: any) {
            toast.success("Pembayaran Berhasil! Mohon muat ulang halaman. Akun Anda sedang ditingkatkan ke Pro.");
          },
          onPending: function(result: any) {
            toast.info("Menunggu Pembayaran. Silakan selesaikan pembayaran Anda.");
          },
          onError: function(result: any) {
            toast.error("Pembayaran Gagal. Terjadi kesalahan saat memproses pembayaran.");
          },
          onClose: function() {
            toast.info("Pembayaran Dibatalkan. Anda menutup jendela pembayaran.");
          }
        });
      } else {
        toast.error("Midtrans Snap belum dimuat");
      }
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat transaksi");
    } finally {
      setLoadingPkg(null);
    }
  };
  const studentShell = useStudentShell("/subscription");

  const features = [
    "Try out unlimited",
    "Try Out soal UTBK tahun-tahun sebelumnya",
    "Rangkuman Materi",
    "Flash Card Interaktif",
    "Asisten AI 24/7",
    "Analisis kelemahan detail"
  ];

  return (
    <ProductShell 
      brand={productShellMeta.brand} 
      tierLabel={studentShell.tierLabel} 
      navItems={studentShell.navItems} 
      disablePadding
    >
      <main className="min-h-[100dvh] bg-background">
        <div className="mx-auto flex flex-col gap-12 px-4 py-12 sm:px-8 lg:px-12 xl:px-20 max-w-[1800px] w-full">
          
          <header className="text-center relative">
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-foreground sm:text-5xl max-w-4xl mx-auto">
              Pilihan paket, disesuaikan dengan kebutuhan belajarmu
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Mulai belajar gratis, atau pilih paket pro untuk fasilitas lebih lengkap dan dukungan prioritas.
            </p>
          </header>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 items-stretch max-w-full">
            
            {/* Gratis Card */}
            <div className="flex-1 bg-card border border-border/60 p-8 rounded-[2rem] shadow-sm relative flex flex-col text-left transition-transform hover:-translate-y-2 duration-300">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-foreground mb-2">Gratis</h3>
                <p className="text-muted-foreground text-sm">Alat persiapan esensial untuk memulai.</p>
              </div>

              <div className="hidden xl:block h-6 mb-1"></div>

              <div className="mb-10 flex items-baseline gap-2">
                <span className="text-4xl xl:text-4xl 2xl:text-5xl font-extrabold text-foreground tracking-tight">Rp 0</span>
              </div>
              
              <ul className="flex flex-col gap-4 mb-12 flex-1">
                <li className="flex items-start gap-3 text-muted-foreground text-sm">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span>Akses Try Out gratis</span>
                </li>
              </ul>
              
              <div className="flex flex-col gap-3 mt-auto">
                <div className="text-center w-full invisible">
                  <span className="text-sm font-semibold px-4 py-1.5 inline-block">Spacer</span>
                </div>
                <Button asChild variant="outline" className="w-full h-14 rounded-full text-base font-semibold border-border hover:bg-muted">
                  <Link to="/app/tryout-selection">Lanjutkan Gratis</Link>
                </Button>
                <div className="h-5 mt-2"></div>
              </div>
            </div>

            {/* Pro 1 Bulan Card */}
            <div className="flex-1 bg-primary p-8 rounded-[2rem] shadow-2xl relative flex flex-col text-left transition-transform hover:-translate-y-2 duration-300 overflow-hidden border border-primary-foreground/10">
              <div className="absolute -top-4 -right-4 p-6 opacity-10 pointer-events-none">
                <Award className="w-48 h-48 text-primary-foreground" />
              </div>
              
              <div className="mb-4 relative z-10">
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">Pro 1 Bulan</h3>
                <p className="text-primary-foreground/80 text-sm">Fokus belajar secara intensif.</p>
              </div>

              <div className="mb-10 flex flex-col gap-1 relative z-10">
                <div className="h-6"></div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl xl:text-4xl 2xl:text-5xl font-extrabold text-primary-foreground tracking-tight">Rp 70rb</span>
                  <span className="text-primary-foreground/70 font-medium text-sm">/bulan</span>
                </div>
              </div>

              <ul className="flex flex-col gap-4 mb-8 flex-1 relative z-10">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-primary-foreground text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary-foreground/80 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 mt-auto relative z-10">
                <div className="text-center w-full">
                  <span className="text-xs font-semibold text-primary-foreground/90 bg-primary-foreground/10 px-3 py-1.5 rounded-full inline-block">
                    Setara Rp 2.400/hari
                  </span>
                </div>
                <Button onClick={() => handlePayment("1_bulan")} disabled={loadingPkg === "1_bulan"} variant="secondary" className="w-full h-14 rounded-full text-base font-bold bg-white text-primary hover:bg-white/90 shadow-lg">
                  {loadingPkg === "1_bulan" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pilih 1 Bulan"}
                </Button>
                <p className="text-xs text-primary-foreground/70 text-center flex items-center justify-center gap-1.5 mt-2 font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  Pembayaran Aman & Instan
                </p>
              </div>
            </div>

            {/* Pro 6 Bulan Card */}
            <div className="flex-1 bg-primary p-8 rounded-[2rem] shadow-2xl relative flex flex-col text-left transition-transform hover:-translate-y-2 duration-300 overflow-hidden border border-primary-foreground/10">
              <div className="absolute -top-4 -right-4 p-6 opacity-10 pointer-events-none">
                <Award className="w-48 h-48 text-primary-foreground" />
              </div>
              
              <div className="mb-4 relative z-10">
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">Pro 6 Bulan</h3>
                <p className="text-primary-foreground/80 text-sm">Pilihan hemat untuk jangka menengah.</p>
              </div>

              <div className="mb-10 flex flex-col gap-1 relative z-10">
                <div className="flex items-center h-6">
                  <span className="text-primary-foreground/60 line-through font-medium text-sm">Rp 420rb</span>
                  <span className="bg-emerald-400 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ml-2 animate-pulse">
                    Promo Terbatas
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl xl:text-4xl 2xl:text-5xl font-extrabold text-primary-foreground tracking-tight">Rp 250rb</span>
                  <span className="text-primary-foreground/70 font-medium text-sm">/6 bulan</span>
                </div>
              </div>

              <ul className="flex flex-col gap-4 mb-8 flex-1 relative z-10">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-primary-foreground text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary-foreground/80 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 mt-auto relative z-10">
                <div className="text-center w-full">
                  <span className="text-xs font-semibold text-primary-foreground/90 bg-primary-foreground/10 px-3 py-1.5 rounded-full inline-block">
                    Setara Rp 1.400/hari
                  </span>
                </div>
                <Button onClick={() => handlePayment("6_bulan")} disabled={loadingPkg === "6_bulan"} variant="secondary" className="w-full h-14 rounded-full text-base font-bold bg-white text-primary hover:bg-white/90 shadow-lg">
                  {loadingPkg === "6_bulan" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pilih 6 Bulan"}
                </Button>
                <p className="text-xs text-primary-foreground/70 text-center flex items-center justify-center gap-1.5 mt-2 font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  Pembayaran Aman & Instan
                </p>
              </div>
            </div>

            {/* Pro 1 Tahun Card */}
            <div className="flex-1 bg-primary p-8 rounded-[2rem] shadow-2xl relative flex flex-col text-left transition-transform hover:-translate-y-2 duration-300 overflow-hidden border border-primary-foreground/10">
              <div className="absolute -top-4 -right-4 p-6 opacity-10 pointer-events-none">
                <Award className="w-48 h-48 text-primary-foreground" />
              </div>
              
              <div className="mb-4 relative z-10">
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">Pro 1 Tahun</h3>
                <p className="text-primary-foreground/80 text-sm">Akses penuh belajar santai.</p>
              </div>

              <div className="mb-10 flex flex-col gap-1 relative z-10">
                <div className="flex items-center h-6">
                  <span className="text-primary-foreground/60 line-through font-medium text-sm">Rp 840rb</span>
                  <span className="bg-emerald-400 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ml-2 animate-pulse">
                    Promo Terbatas
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl xl:text-4xl 2xl:text-5xl font-extrabold text-primary-foreground tracking-tight">Rp 500rb</span>
                  <span className="text-primary-foreground/70 font-medium text-sm">/1 tahun</span>
                </div>
              </div>

              <ul className="flex flex-col gap-4 mb-8 flex-1 relative z-10">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-primary-foreground text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary-foreground/80 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 mt-auto relative z-10">
                <div className="text-center w-full">
                  <span className="text-xs font-semibold text-primary-foreground/90 bg-primary-foreground/10 px-3 py-1.5 rounded-full inline-block">
                    Setara Rp 1.400/hari
                  </span>
                </div>
                <Button onClick={() => handlePayment("1_tahun")} disabled={loadingPkg === "1_tahun"} variant="secondary" className="w-full h-14 rounded-full text-base font-bold bg-white text-primary hover:bg-white/90 shadow-lg">
                  {loadingPkg === "1_tahun" ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pilih 1 Tahun"}
                </Button>
                <p className="text-xs text-primary-foreground/70 text-center flex items-center justify-center gap-1.5 mt-2 font-medium">
                  <Lock className="w-3.5 h-3.5" />
                  Pembayaran Aman & Instan
                </p>
              </div>
            </div>

          </section>

        </div>
      </main>
    </ProductShell>
  );
}
