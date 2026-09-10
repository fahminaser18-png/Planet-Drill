import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, Navigate } from "react-router";
import DiagnosisHeroCard from "../../components/diagnosis/diagnosis-hero-card";
import GlobalBehaviorPanel from "../../components/diagnosis/global-behavior-panel";
import DiagnosisRangeControls from "../../components/diagnosis/diagnosis-range-controls";
import SubtopicRankingList from "../../components/diagnosis/subtopic-ranking-list";
import ProductShell from "../../components/layout/product-shell";
import { PaywallGate } from "../../components/layout/paywall-gate";
import { getButtonStyleProps } from "../../components/ui/button";
import Button from "../../components/ui/button";
import { getPersonalWeaknessDiagnosis, generateStudentAiRangeInsight } from "../../lib/api/analytics-api";
import { getGlobalAiCredentialStatus } from "../../lib/api/global-ai-credential-api";
import { useSession } from "../../lib/auth/use-session";
import {
  createDefaultDiagnosisRange,
  createPresetDiagnosisRange,
  resolveUserTimezone,
  toAppliedDiagnosisRange,
} from "../../lib/diagnosis-date-range";
import { usePreviewRouteState } from "../../lib/preview-route-state";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { Loader2, PackageSearch, Bot } from "lucide-react";

function AnalyticsPage() {
  const { user } = useSession();
  const studentShell = useStudentShell("/app/analytics");
  const analyticsView = usePreviewRouteState("analyticsView");
  const [draftRange, setDraftRange] = useState(createDefaultDiagnosisRange);
  const [appliedRange, setAppliedRange] = useState(createDefaultDiagnosisRange);
  const queryClient = useQueryClient();
  const timezone = resolveUserTimezone();

  if (studentShell.role === "pendaftar_baru") {
    return <PaywallGate brand={productShellMeta.brand} tierLabel={studentShell.tierLabel} navItems={studentShell.navItems} />;
  }
  
  const diagnosisQuery = useQuery({
    queryKey: [
      "personal-weakness-diagnosis",
      user?.id,
      appliedRange.dateFrom,
      appliedRange.dateTo,
      timezone,
    ],
    enabled: analyticsView === "ready" && Boolean(user?.id),
    placeholderData: (previous) => previous,
    queryFn: () =>
      getPersonalWeaknessDiagnosis({
        dateFrom: appliedRange.dateFrom,
        dateTo: appliedRange.dateTo,
        timezone,
      }),
  });
  const diagnosis = diagnosisQuery.data;
  const diagnosisMode = diagnosis?.summary.diagnosisMode ?? null;
  const weakestSubtopic = diagnosis?.subtopicRankings[0] ?? null;
  const canApplyCustomRange = toAppliedDiagnosisRange(draftRange) !== null;

  const aiCredentialQuery = useQuery({
    queryKey: ["global-ai-credential-status"],
    queryFn: () => getGlobalAiCredentialStatus(),
    enabled: analyticsView === "ready" && diagnosisMode === "full",
  });

  const aiInsightQuery = useQuery({
    queryKey: [
      "student-ai-range-insight",
      user?.id,
      appliedRange.dateFrom,
      appliedRange.dateTo,
      timezone,
    ],
    queryFn: () => generateStudentAiRangeInsight({
      dateFrom: appliedRange.dateFrom,
      dateTo: appliedRange.dateTo,
      timezone,
    }),
    enabled: false,
  });

  function handlePresetSelect(preset: "7d" | "14d" | "30d") {
    const nextRange = createPresetDiagnosisRange(preset);
    setDraftRange(nextRange);
    setAppliedRange(nextRange);
  }

  function handleApplyCustomRange() {
    const nextRange = toAppliedDiagnosisRange(draftRange);
    if (!nextRange) return;
    setAppliedRange(nextRange);
  }

  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <div className="flex flex-col gap-10 w-full py-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Area yang Perlu Diperbaiki
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Lihat topik dan materi yang sering menahan peningkatan skormu pada rentang waktu ini.
          </p>
        </div>

        <DiagnosisRangeControls
          appliedRange={appliedRange}
          canApplyCustomRange={canApplyCustomRange}
          draftRange={draftRange}
          isApplying={diagnosisQuery.isFetching && !diagnosisQuery.isLoading}
          onApplyCustomRange={handleApplyCustomRange}
          onDraftChange={setDraftRange}
          onSelectPreset={handlePresetSelect}
        />

        {analyticsView === "loading" || (analyticsView === "ready" && diagnosisQuery.isLoading) ? (
          <div className="py-12 flex flex-col gap-4">
             <div className="flex items-center gap-3">
               <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
               <span className="text-sm text-muted-foreground">Memuat data analisis...</span>
             </div>
             <div>
                <Link
                  {...getButtonStyleProps({ variant: "outline" })}
                  to="/app/tryout/result"
                >
                  Buka hasil terakhir
                </Link>
             </div>
          </div>
        ) : analyticsView === "error" || (analyticsView === "ready" && diagnosisQuery.isError) ? (
          <div className="py-8 space-y-4">
            <p className="text-sm text-destructive">Analisis gagal dimuat. Coba buka review terlebih dahulu.</p>
            <Link
              {...getButtonStyleProps({ variant: "outline" })}
              to="/app/review"
            >
              Buka review
            </Link>
          </div>
        ) : analyticsView === "empty" || diagnosisMode === "empty" ? (
          <div className="py-12 space-y-4">
            <PackageSearch className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="font-medium text-foreground">Belum ada data</p>
              <p className="text-sm text-muted-foreground">Belum ada try out besar di rentang ini.</p>
            </div>
            <Link
              {...getButtonStyleProps({ variant: "outline" })}
              to="/app/tryout-selection"
            >
              Mulai try out besar
            </Link>
          </div>
        ) : diagnosisMode === "basic" && diagnosis ? (
          <div className="space-y-10">
            <section className="space-y-2">
              <h2 className="text-lg font-medium text-foreground">Ringkasan awal</h2>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Terdapat {diagnosis.summary.eligibleAttemptCount} try out besar pada rentang ini.</p>
                <p>Akurasi saat ini {diagnosis.summary.overallAccuracy}% dari {diagnosis.summary.overallQuestionCount} soal.</p>
              </div>
            </section>

            <GlobalBehaviorPanel
              patterns={diagnosis.basicSummary?.globalBehaviorPatterns ?? diagnosis.globalBehaviorPatterns}
            />

            <section className="space-y-2">
              <h2 className="text-lg font-medium text-foreground">Analisis lengkap belum tersedia</h2>
              <p className="text-sm text-muted-foreground">
                {diagnosis.basicSummary?.message ?? diagnosis.narrative.nextReadiness}
              </p>
            </section>
          </div>
        ) : diagnosisMode === "full" && diagnosis && weakestSubtopic ? (
          <div className="space-y-12">
            <DiagnosisHeroCard
              behaviorPatterns={diagnosis.globalBehaviorPatterns}
              narrative={diagnosis.narrative}
              weakestSubtopic={weakestSubtopic}
            />

            <GlobalBehaviorPanel
              title="Pola yang paling sering muncul"
              patterns={diagnosis.globalBehaviorPatterns}
            />

            <SubtopicRankingList rankings={diagnosis.subtopicRankings} />

            <section className="space-y-6 pt-6 border-t border-border/50">
               <div className="flex items-center gap-2">
                 <Bot className="h-5 w-5 text-foreground" />
                 <h2 className="text-lg font-medium text-foreground">
                   Analisis AI
                 </h2>
               </div>

                {!aiCredentialQuery.data?.hasCredential ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground max-w-lg">
                      Fitur analisis menggunakan Bring Your Own Key (BYOK). Atur API Key Gemini Anda di Pengaturan AI Global untuk mengaktifkan fitur ini.
                    </p>
                    <Link
                      {...getButtonStyleProps({ variant: "outline" })}
                      to="/app/settings/ai-config"
                    >
                      Buka Pengaturan AI
                    </Link>
                  </div>
                ) : !aiInsightQuery.data && !aiInsightQuery.isFetching && !aiInsightQuery.isError ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground max-w-lg">
                      Dapatkan rangkuman kelemahan spesifik dan saran strategi belajar berdasarkan {diagnosis.summary.eligibleAttemptCount} try out Anda.
                    </p>
                    <Button 
                      onClick={() => aiInsightQuery.refetch()}
                      variant="outline"
                    >
                      Buat Analisis AI
                    </Button>
                  </div>
                ) : aiInsightQuery.isFetching ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Menganalisis data try out...</p>
                  </div>
                ) : aiInsightQuery.isError ? (
                  <div className="space-y-3">
                    <p className="text-sm text-destructive">
                      {aiInsightQuery.error instanceof Error ? aiInsightQuery.error.message : "Terjadi kesalahan saat memproses data."}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => aiInsightQuery.refetch()}>
                      Coba Lagi
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                      {aiInsightQuery.data?.summary}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Model: Gemini 3.6 Flash &middot; Digenerasi: {new Date(aiInsightQuery.data?.generatedAt ?? "").toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                )}
            </section>
          </div>
        ) : (
          <section className="space-y-2">
             <h2 className="text-lg font-medium text-foreground">Analisis rentang ini siap dipakai</h2>
             <div className="text-sm text-muted-foreground space-y-1">
               <p>Periode aktif {appliedRange.dateFrom} sampai {appliedRange.dateTo} ({timezone}).</p>
               {diagnosis && (
                 <p>Mode analisis: {diagnosis.summary.diagnosisMode}.</p>
               )}
             </div>
          </section>
        )}
      </div>
    </ProductShell>
  );
}

export default AnalyticsPage;
