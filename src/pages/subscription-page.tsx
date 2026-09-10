import { CheckCircle2, Award, Lock, Loader2, CalendarDays } from "lucide-react";
import Button from "../components/ui/button";
import { Link } from "react-router";
import { useState } from "react";
import { createMidtransTransaction, getCurrentSubscription } from "../lib/api/payment-api";
import { toast } from "sonner";
import { useSession } from "../lib/auth/use-session";
import { useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import ConfirmDialog from "../components/ui/confirm-dialog";

import ProductShell from "../components/layout/product-shell";
import { useStudentShell } from "./app/use-student-shell";
import { productShellMeta } from "../mocks/student-dashboard";

export default function SubscriptionPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
  const [confirmPkg, setConfirmPkg] = useState<string | null>(null);

  const packageNames: Record<string, string> = {
    "1_bulan": "Pro 1 Bulan",
    "6_bulan": "Pro 6 Bulan",
    "1_tahun": "Pro 1 Tahun",
  };

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
      setConfirmPkg(null);
    }
  };
  const studentShell = useStudentShell("/subscription");
  const [forcePricing, setForcePricing] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<"1_bulan" | "6_bulan" | "1_tahun">("6_bulan");
  const [isToggling, setIsToggling] = useState(false);

  const planDetails = {
    "1_bulan": {
      name: "1 Bulan",
      price: "Rp 70rb",
      originalPrice: null,
      period: "/bulan",
      equivalent: "Setara Rp 2.400/hari",
      badge: null,
    },
    "6_bulan": {
      name: "6 Bulan",
      price: "Rp 250rb",
      originalPrice: "Rp 420rb",
      period: "/6 bulan",
      equivalent: "Setara Rp 1.400/hari",
      badge: "Promo Terbatas",
    },
    "1_tahun": {
      name: "1 Tahun",
      price: "Rp 500rb",
      originalPrice: "Rp 840rb",
      period: "/1 tahun",
      equivalent: "Setara Rp 1.400/hari",
      badge: "Promo Terbatas",
    }
  };

  const handlePlanToggle = (plan: "1_bulan" | "6_bulan" | "1_tahun") => {
    if (plan === selectedPlan) return;
    setIsToggling(true);
    setSelectedPlan(plan);
    setTimeout(() => setIsToggling(false), 200);
  };

  const subQuery = useQuery({
    queryKey: ["current-subscription", user?.id],
    enabled: Boolean(user?.id) && studentShell.role === "pro",
    queryFn: () => getCurrentSubscription(),
  });

  const isPro = studentShell.role === "pro";
  const showActiveSubscription = isPro && !forcePricing;

  const features = [
    "Try out unlimited",
    "Try Out soal UTBK tahun-tahun sebelumnya",
    "Rangkuman Materi",
    "Flash Card Interaktif",
    "Asisten AI 24/7",
    "Analisis kelemahan detail"
  ];

  if (showActiveSubscription) {
    const endsAt = subQuery.data?.ends_at ? new Date(subQuery.data.ends_at) : null;
    const daysRemaining = endsAt 
      ? Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 0;

    return (
      <ProductShell 
        brand={productShellMeta.brand} 
        tierLabel={studentShell.tierLabel} 
        navItems={studentShell.navItems} 
        disablePadding
      >
        <main className="min-h-[100dvh] bg-background">
          <div className="mx-auto flex flex-col gap-12 px-4 py-12 sm:px-8 lg:px-12 xl:px-20 max-w-[1200px] w-full items-center justify-center pt-24">
            
            <div className="bg-card border border-border/60 p-10 rounded-[2rem] shadow-sm max-w-2xl w-full text-center space-y-8 relative overflow-hidden">

              
              <div className="space-y-4 relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-2">
                  <Award className="w-10 h-10" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                  Status Langganan Pro
                </h1>
                
                {subQuery.isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <p className="text-xl text-muted-foreground mt-4">
                      Masa berlangganan Anda akan habis dalam
                    </p>
                    <div className="py-6">
                      <span className="text-6xl font-black text-primary">{daysRemaining}</span>
                      <span className="text-2xl font-bold text-muted-foreground ml-3">hari lagi</span>
                    </div>
                    {endsAt && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 py-3 rounded-xl">
                        <CalendarDays className="w-4 h-4" />
                        <span>Berakhir pada: {endsAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="pt-6 relative z-10">
                <Button 
                  variant="primary" 
                  className="w-full sm:w-auto px-8 rounded-xl h-12 text-sm font-bold cursor-pointer"
                  onClick={() => setForcePricing(true)}
                >
                  Perpanjang masa aktif
                </Button>
              </div>
            </div>

          </div>
        </main>
      </ProductShell>
    );
  }

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

          <section className="max-w-2xl mx-auto w-full flex flex-col gap-8">
            
            {/* Pro Card */}
            <div className="w-full bg-primary p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative flex flex-col text-left transition-all duration-500 overflow-hidden border border-primary-foreground/10">
              <div className="absolute -top-10 -right-10 p-6 opacity-10 pointer-events-none">
                <Award className="w-64 h-64 text-primary-foreground" />
              </div>
              
              <div className="mb-6 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-bold text-primary-foreground mb-2">Pro</h3>
                  <p className="text-primary-foreground/80 text-sm md:text-base">Akses semua fitur pro tanpa batas.</p>
                </div>
                
                {/* Toggle / Tabs */}
                <div className="flex items-center bg-primary-foreground/10 p-1.5 rounded-2xl w-full md:w-auto relative">
                  {(["1_bulan", "6_bulan", "1_tahun"] as const).map((plan) => (
                    <button
                      key={plan}
                      onClick={() => handlePlanToggle(plan)}
                      className={`flex-1 md:flex-none px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 relative z-10 ${
                        selectedPlan === plan 
                          ? "text-primary shadow-sm" 
                          : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/5"
                      }`}
                    >
                      {planDetails[plan].name}
                    </button>
                  ))}
                  <div 
                    className="absolute top-1.5 bottom-1.5 w-[calc(33.33%-4px)] bg-white rounded-xl transition-all duration-300 ease-out z-0"
                    style={{
                      left: selectedPlan === "1_bulan" ? "6px" : selectedPlan === "6_bulan" ? "calc(33.33% + 2px)" : "calc(66.66% - 2px)"
                    }}
                  />
                </div>
              </div>

              <div className="mb-10 flex flex-col gap-2 relative z-10 min-h-[6rem]">
                <div className="flex items-center h-6">
                  {planDetails[selectedPlan].originalPrice ? (
                    <>
                      <span className={`text-primary-foreground/60 line-through font-medium text-base transition-all duration-300 ${isToggling ? "opacity-0 translate-y-1" : "opacity-100 translate-y-0"}`}>
                        {planDetails[selectedPlan].originalPrice}
                      </span>
                      {planDetails[selectedPlan].badge && (
                        <span className={`bg-emerald-400 text-emerald-950 text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ml-2 transition-all duration-300 ${isToggling ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                          {planDetails[selectedPlan].badge}
                        </span>
                      )}
                    </>
                  ) : null}
                </div>
                
                <div className="relative h-16">
                  <div className={`absolute inset-0 flex items-baseline gap-1 transition-all duration-300 ${isToggling ? "opacity-0 translate-y-2 blur-sm" : "opacity-100 translate-y-0 blur-0"}`}>
                    <span className="text-5xl md:text-6xl font-extrabold text-primary-foreground tracking-tight">
                      {planDetails[selectedPlan].price}
                    </span>
                    <span className="text-primary-foreground/70 font-medium text-lg">
                      {planDetails[selectedPlan].period}
                    </span>
                  </div>
                  {isToggling && (
                    <div className="absolute inset-0 flex items-center gap-2">
                      <div className="h-12 bg-primary-foreground/20 rounded-xl w-32 md:w-48 animate-pulse"></div>
                      <div className="h-6 bg-primary-foreground/20 rounded-md w-16 animate-pulse mt-4"></div>
                    </div>
                  )}
                </div>
              </div>

              <ul className="flex flex-col gap-4 mb-10 flex-1 relative z-10">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-primary-foreground text-sm md:text-base">
                    <CheckCircle2 className="h-6 w-6 text-primary-foreground/80 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-4 mt-auto relative z-10">
                <div className="text-center w-full">
                  <span className={`text-sm font-semibold text-primary-foreground/90 bg-primary-foreground/10 px-4 py-2 rounded-full inline-block transition-all duration-300 ${isToggling ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
                    {planDetails[selectedPlan].equivalent}
                  </span>
                </div>
                <Button 
                  onClick={() => setConfirmPkg(selectedPlan)} 
                  disabled={loadingPkg === selectedPlan} 
                  variant="secondary" 
                  className="w-full h-16 rounded-2xl text-lg font-bold bg-white text-primary hover:bg-white/90 shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group overflow-hidden relative"
                >
                  <div className={`absolute inset-0 bg-primary/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out`} />
                  <div className="relative flex items-center justify-center gap-2">
                    {loadingPkg === selectedPlan ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>Memproses Pembayaran...</span>
                      </>
                    ) : (
                      <>
                        <span>Pilih {planDetails[selectedPlan].name}</span>
                      </>
                    )}
                  </div>
                </Button>
                <p className="text-sm text-primary-foreground/70 text-center flex items-center justify-center gap-2 mt-2 font-medium">
                  <Lock className="w-4 h-4" />
                  Pembayaran Aman & Instan
                </p>
              </div>
            </div>

            {/* Gratis Tier Simple Text/Button */}
            <div className="text-center flex flex-col items-center gap-4 mt-4">
              <p className="text-muted-foreground text-sm md:text-base">Belum yakin? Mulai dengan akses try out gratis.</p>
              <Button asChild variant="outline" className="rounded-full text-base font-semibold px-8 h-12 border-border hover:bg-muted transition-colors">
                <Link to="/app/tryout-selection">Lanjutkan Gratis</Link>
              </Button>
            </div>
          </section>

          <ConfirmDialog
            open={confirmPkg !== null}
            title="Konfirmasi Pembelian"
            description={
              <div className="space-y-4 mt-2">
                <p>
                  Apakah Anda yakin ingin membeli paket <strong className="text-foreground">{confirmPkg ? packageNames[confirmPkg] : ""}</strong>?
                </p>
                <div className="bg-muted/50 p-4 rounded-xl text-sm space-y-2 border border-border/50 text-left">
                  <p className="font-semibold text-foreground">Informasi Pembayaran:</p>
                  <ul className="list-disc pl-4 space-y-1.5 text-muted-foreground text-xs leading-relaxed">
                    <li>Harga belum termasuk biaya layanan pihak ketiga.</li>
                    <li>Estimasi biaya: <span className="font-medium text-foreground">QRIS (0.7%)</span>, <span className="font-medium text-foreground">Virtual Account (±Rp4.000)</span>, <span className="font-medium text-foreground">e-Wallet (2%)</span>.</li>
                    <li>Jika pop-up pembayaran tertutup, Anda bisa <strong>mengklik tombol beli kembali</strong> untuk mengulang pesanan.</li>
                  </ul>
                </div>
              </div>
            }
            confirmLabel="Ya, Beli"
            cancelLabel="Batal"
            onClose={() => setConfirmPkg(null)}
            onConfirm={() => {
              if (confirmPkg) handlePayment(confirmPkg);
            }}
            isPending={loadingPkg !== null}
            pendingLabel="Memproses..."
            confirmVariant="default"
          />
        </div>
      </main>
    </ProductShell>
  );
}
