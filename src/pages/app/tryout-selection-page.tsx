import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarClock, ArrowRight, Play, Clock, Lock } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import { PaywallModal } from "../../components/layout/paywall-gate";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { getButtonStyleProps } from "../../components/ui/button";
import { useSession } from "../../lib/auth/use-session";
import { findActiveAttemptForUser } from "../../lib/api/tryout-api";
import { Navigate } from "react-router";

function TryoutSelectionPage() {
  const studentShell = useStudentShell("/app/tryout-selection");
  const session = useSession();
  const userId = session?.user?.id;

  const { data: activeAttempt, isLoading } = useQuery({
    queryKey: ["activeAttempt", userId],
    queryFn: () => {
      if (!userId) return null;
      return findActiveAttemptForUser({ userId });
    },
    enabled: !!userId,
  });

  const [showPaywall, setShowPaywall] = useState(false);



  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <div className="flex flex-col gap-10 w-full py-6">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">
              Mode Latihan
            </span>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Pilih Mode Try Out
            </h1>
            <p className="text-lg text-muted-foreground mt-4 leading-relaxed">
              Sesuaikan dengan gaya belajar dan kesiapanmu hari ini untuk memaksimalkan persiapan UTBK SNBT.
            </p>
          </div>
        </div>

        {/* Active Attempt Banner */}
        {isLoading ? (
          <div className="w-full h-[100px] border-b border-border/40 animate-pulse flex items-center justify-between py-6 px-8 rounded-2xl bg-muted/20">
            <div className="flex items-center gap-5">
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div className="space-y-2">
                <div className="h-5 w-48 bg-muted rounded-md" />
                <div className="h-4 w-32 bg-muted rounded-md" />
              </div>
            </div>
            <div className="h-10 w-32 bg-muted rounded-md" />
          </div>
        ) : activeAttempt && (activeAttempt.status === "in_progress" || activeAttempt.status === "paused") ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 px-8 rounded-2xl bg-muted/40 border border-border/60 mb-2">
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Sesi Sedang Berlangsung</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {activeAttempt.title}
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-8">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Progres</p>
                <p className="text-base font-bold text-foreground mt-0.5">
                  {activeAttempt.answeredCount} <span className="text-muted-foreground font-medium">/ {activeAttempt.totalQuestions}</span>
                </p>
              </div>
              <Link
                {...getButtonStyleProps({ variant: "primary", className: "hover:-translate-y-0.5 transition-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none" })}
                to={`/app/tryout/session?attempt=${activeAttempt.attemptId}`}
              >
                Lanjutkan <Play className="ml-2 h-4 w-4 fill-current" />
              </Link>
            </div>
          </div>
        ) : null}

        {/* Selection List */}
        <div className="flex flex-col gap-0 w-full">
          {/* Item 1: Unlimited */}
          <div className="group flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-border/40 hover:bg-muted/20 transition-colors px-4 -mx-4 rounded-xl">
            <div className="flex items-start gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <BookOpen className="h-6 w-6" />
              </div>
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  Unlimited
                </h3>
                <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                  Latihan mandiri tanpa batas waktu. Fokus pada pemahaman materi dan blok yang spesifik.
                </p>
              </div>
            </div>
            <div className="shrink-0 pt-2 md:pt-0">
              {studentShell.role === "pendaftar_baru" ? (
                <button
                  {...getButtonStyleProps({
                    variant: "outline",
                    className: "w-full md:w-auto cursor-pointer hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                  })}
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPaywall(true);
                  }}
                >
                  Terkunci <Lock className="ml-2 h-4 w-4" />
                </button>
              ) : (
                <Link
                  {...getButtonStyleProps({
                    variant: "outline",
                    className: "w-full md:w-auto group-hover:border-primary group-hover:text-primary transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                  })}
                  to="/app/tryout/blocks"
                >
                  Pilih Unlimited <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>

          {/* Item 2: Terjadwal */}
          <div className="group flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 border-b border-border/40 hover:bg-muted/20 transition-colors px-4 -mx-4 rounded-xl">
            <div className="flex items-start gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <CalendarClock className="h-6 w-6" />
              </div>
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">Terjadwal</h3>
                <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                  Simulasi ujian sebenarnya dengan batasan waktu yang ketat dan saingan serentak.
                </p>
              </div>
            </div>
            <div className="shrink-0 pt-2 md:pt-0">
              <Link
                {...getButtonStyleProps({
                  variant: "outline",
                  className: "w-full md:w-auto group-hover:border-primary group-hover:text-primary transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                })}
                to="/app/scheduled-tryout"
              >
                Pilih Terjadwal <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </ProductShell>
  );
}

export default TryoutSelectionPage;
