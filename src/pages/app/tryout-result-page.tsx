import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle, Timer, Loader2, AlertTriangle, Package, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import { PaywallModal } from "../../components/layout/paywall-gate";
import { getButtonStyleProps } from "../../components/ui/button";
import SectionHeading from "../../components/ui/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { useSession } from "../../lib/auth/use-session";
import { findLatestSubmittedAttemptId, getAttemptResultPageData } from "../../lib/api/tryout-api";
import { formatDurationAsClock } from "../../lib/mappers/tryout-mappers";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";

function TryoutResultPage() {
  const [searchParams] = useSearchParams();
  const { user } = useSession();
  const studentShell = useStudentShell("/app/tryout");
  const attemptId = searchParams.get("attempt");
  
  const latestAttemptQuery = useQuery({
    queryKey: ["latest-submitted-attempt", user?.id],
    enabled: !attemptId && Boolean(user?.id),
    queryFn: () => findLatestSubmittedAttemptId({ userId: user!.id }),
  });
  
  const resolvedAttemptId = attemptId ?? latestAttemptQuery.data ?? null;
  const resultQuery = useQuery({
    queryKey: ["tryout-result", resolvedAttemptId],
    enabled: Boolean(resolvedAttemptId),
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: () => getAttemptResultPageData({ attemptId: resolvedAttemptId! }),
  });
  
  const resultData = resultQuery.data;
  const [showPaywall, setShowPaywall] = useState(false);
  const totalQuestions = resultData ? resultData.correctAnswers + resultData.wrongAnswers + resultData.unansweredCount : 0;
  
  const weakestWrongCount = resultData && resultData.blocks.length > 0 ? Math.max(...resultData.blocks.map(b => b.wrong)) : null;
  const weakestBlocks = resultData && weakestWrongCount !== null ? resultData.blocks.filter(b => b.wrong === weakestWrongCount) : [];
  
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CheckCircle, Timer, Loader2, AlertTriangle, Package, Lock } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import { PaywallModal } from "../../components/layout/paywall-gate";
import { getButtonStyleProps } from "../../components/ui/button";
import SectionHeading from "../../components/ui/section-heading";
import { Badge } from "../../components/ui/badge";
import { useSession } from "../../lib/auth/use-session";
import { findLatestSubmittedAttemptId, getAttemptResultPageData } from "../../lib/api/tryout-api";
import { formatDurationAsClock } from "../../lib/mappers/tryout-mappers";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";

function TryoutResultPage() {
  const [searchParams] = useSearchParams();
  const { user } = useSession();
  const studentShell = useStudentShell("/app/tryout");
  const attemptId = searchParams.get("attempt");
  
  const latestAttemptQuery = useQuery({
    queryKey: ["latest-submitted-attempt", user?.id],
    enabled: !attemptId && Boolean(user?.id),
    queryFn: () => findLatestSubmittedAttemptId({ userId: user!.id }),
  });
  
  const resolvedAttemptId = attemptId ?? latestAttemptQuery.data ?? null;
  const resultQuery = useQuery({
    queryKey: ["tryout-result", resolvedAttemptId],
    enabled: Boolean(resolvedAttemptId),
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: () => getAttemptResultPageData({ attemptId: resolvedAttemptId! }),
  });
  
  const resultData = resultQuery.data;
  const [showPaywall, setShowPaywall] = useState(false);
  const totalQuestions = resultData ? resultData.correctAnswers + resultData.wrongAnswers + resultData.unansweredCount : 0;
  
  const weakestWrongCount = resultData && resultData.blocks.length > 0 ? Math.max(...resultData.blocks.map(b => b.wrong)) : null;
  const weakestBlocks = resultData && weakestWrongCount !== null ? resultData.blocks.filter(b => b.wrong === weakestWrongCount) : [];
  
  let weakestBlockInsight = "Review jawaban yang masih salah lebih dulu.";
  if (weakestWrongCount === 0) weakestBlockInsight = "Semua jawaban sudah tepat. Lanjut review untuk mengunci strategi ini.";
  else if (weakestWrongCount !== null && weakestWrongCount > 0 && weakestBlocks.length === 1) weakestBlockInsight = `Review jawaban ${weakestBlocks[0].blockLabel} yang masih salah lebih dulu.`;

  return (
    <ProductShell brand={productShellMeta.brand} tierLabel={studentShell.tierLabel} navItems={studentShell.navItems}>
      <section id="tryout">
        <SectionHeading title="Hasil try out" description="Skor akhir, hasil per blok, dan akses pembahasan." />

        {latestAttemptQuery.isLoading || resultQuery.isLoading ? (
          <div className="mt-12 flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Menyiapkan hasil...</h3>
            <p className="text-sm">Mohon tunggu sebentar.</p>
          </div>
        ) : latestAttemptQuery.isError || resultQuery.isError ? (
          <div className="mt-12 rounded-xl border border-destructive/20 bg-destructive/5 p-6 flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-destructive">Gagal memuat hasil</h3>
              <p className="text-sm text-destructive/80 mt-1">Coba muat ulang halaman.</p>
            </div>
          </div>
        ) : !resolvedAttemptId || !resultData ? (
          <div className="mt-12 flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="h-10 w-10 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground">Belum ada hasil</h3>
            <p className="text-sm mt-1">Belum ada hasil try out untuk ditampilkan.</p>
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-12 max-w-4xl">
            {/* Top Section: Score */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 pb-8 border-b border-border/40">
              <div>
                <Badge variant="secondary" className="mb-6 flex items-center w-fit gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" /> Sesi selesai
                </Badge>
                <div className="flex items-baseline gap-4">
                  <span className="text-8xl md:text-9xl font-black tracking-tighter text-foreground leading-none">{Math.round(resultData.score)}</span>
                  <span className="text-lg font-bold text-muted-foreground uppercase tracking-wider">Skor Akhir</span>
                </div>
                <p className="text-lg text-muted-foreground mt-6">
                  <strong className="text-foreground">{resultData.correctAnswers}</strong> dari {totalQuestions} soal terjawab benar
                </p>
                <p className="text-sm font-medium text-foreground mt-2 bg-muted/50 w-fit px-3 py-1.5 rounded-md">
                  Rekomendasi: {weakestBlockInsight}
                </p>
              </div>
              <div className="w-full md:w-auto">
                {studentShell.role === "pendaftar_baru" ? (
                  <button
                    {...getButtonStyleProps({ variant: "outline", className: "w-full md:w-auto cursor-pointer" })}
                    onClick={(e) => {
                      e.preventDefault();
                      setShowPaywall(true);
                    }}
                  >
                    Pembahasan Terkunci <Lock className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <Link {...getButtonStyleProps({ variant: "primary", className: "w-full md:w-auto" })} to={`/app/review/${resultData.attemptId}`}>
                    Review jawaban <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                )}
              </div>
            </div>

            {/* Bottom Section: Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
              <div className="space-y-8 col-span-1">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Jawaban Benar</p>
                  <p className="text-4xl font-black tracking-tight text-foreground">{resultData.correctAnswers}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Waktu Terpakai</p>
                  <p className="text-4xl font-black tracking-tight text-foreground">{formatDurationAsClock(resultData.timeUsedSeconds)}</p>
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
                  <Timer className="w-4 h-4" /> Distribusi Hasil
                </div>
                {resultData.blocks.length > 0 ? (
                  <div className="flex flex-col">
                    {resultData.blocks.map((item, i) => (
                      <div key={item.blockLabel} className={`flex items-center justify-between py-4 ${i !== resultData.blocks.length - 1 ? 'border-b border-border/40' : ''}`}>
                        <div>
                          <p className="font-semibold text-foreground text-base">{item.blockLabel}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{item.correct} benar, {item.wrong} salah</p>
                        </div>
                        <Badge variant={item.wrong > item.correct ? "destructive" : "secondary"} className={item.wrong <= item.correct ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10" : ""}>
                          {item.correct + item.wrong} soal
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Distribusi hasil belum tersedia.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </ProductShell>
  );
}
export default TryoutResultPage;
