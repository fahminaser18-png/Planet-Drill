import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Info,
  BookOpenCheck,
  Calendar,
  Award,
  ArrowRight,
  ArrowLeft,
  Check,
  HelpCircle,
  User,
  X,
  PieChart
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import SectionHeading from "../../components/ui/section-heading";
import Button, { getButtonStyleProps } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { listReviewHistory, getReviewDetailData } from "../../lib/api/review-api";
import { useSession } from "../../lib/auth/use-session";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";

function formatSubmittedAttemptLabel(value: string) {
  const submittedAt = new Date(value);

  if (Number.isNaN(submittedAt.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(submittedAt);
}

function formatSubmittedAttemptSummaryLabel(value: string | null | undefined) {
  if (!value) {
    return "Waktu submit belum tersedia";
  }

  const submittedAt = new Date(value);

  if (Number.isNaN(submittedAt.getTime())) {
    return "Waktu submit belum tersedia";
  }

  return formatSubmittedAttemptLabel(value);
}

function getUserAnswerCopy(value: string | null | undefined) {
  if (value == null || value === "") {
    return "Belum dijawab";
  }

  return value;
}

function ReviewPage() {
  const { attemptId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useSession();
  const studentShell = useStudentShell("/app/review");
  const [currentIndex, setCurrentIndex] = useState(0);
  const isDetailRoute = Boolean(attemptId);
  const searchSource = searchParams.get("source");
  const source = searchSource === "scheduled" ? "scheduled" : searchSource === "tutor" ? "tutor" : "tryout";

  const historyQuery = useQuery({
    queryKey: ["review-history", user?.id],
    enabled: !isDetailRoute && Boolean(user?.id),
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: () =>
      listReviewHistory({
        userId: user!.id,
      }),
  });

  const reviewQuery = useQuery({
    queryKey: ["review-detail", attemptId, source],
    enabled: Boolean(attemptId),
    staleTime: 1000 * 60 * 60, // 1 hour
    queryFn: () =>
      getReviewDetailData({
        attemptId: attemptId!,
        source,
      }),
  });

  const reviewSummary = reviewQuery.data?.summary;
  const items = reviewQuery.data?.items ?? [];
  const currentItem = items[currentIndex] ?? items[0] ?? null;
  const tutorData = (reviewQuery.data as any)?.tutor_data;

  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <div className="flex flex-col gap-8 w-full py-4">
        {!isDetailRoute ? (
          <>
            {/* Header Section */}
            <div className="pb-4 border-b border-border/40">
              <SectionHeading
                eyebrow="Pembahasan Soal"
                title="Riwayat Pembahasan"
              />
            </div>

            {historyQuery.isLoading ? (
              <div className="mt-6 flex flex-col gap-0 w-full border-t border-border/40 animate-pulse">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-border/40">
                    <div className="flex flex-col gap-3 md:max-w-xl w-full">
                      <div className="h-4 bg-muted rounded-md w-32" />
                      <div className="h-6 bg-muted rounded-md w-3/4 mt-1" />
                      <div className="flex items-center gap-6 mt-2">
                        <div className="h-4 bg-muted rounded-md w-24" />
                        <div className="h-4 bg-muted rounded-md w-24" />
                      </div>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-4 shrink-0 mt-2 md:mt-0">
                      <div className="h-6 bg-muted rounded-md w-24" />
                      <div className="h-10 bg-muted rounded-md w-36" />
                    </div>
                  </div>
                ))}
              </div>
            ) : historyQuery.isError ? (
              <Alert variant="destructive" className="mt-6 border-destructive/50 bg-destructive/5">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Riwayat pembahasan belum bisa dimuat</AlertTitle>
                <AlertDescription>Coba lagi sebentar.</AlertDescription>
              </Alert>
            ) : (historyQuery.data?.length ?? 0) === 0 ? (
              <Alert className="mt-6 border-border/80 bg-card/60">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle>Belum ada hasil untuk dibahas</AlertTitle>
                <AlertDescription>Hasil yang sudah selesai akan muncul di sini.</AlertDescription>
              </Alert>
            ) : (
              <div className="mt-6 flex flex-col gap-0 w-full border-t border-border/40">
                {historyQuery.data?.map((attempt) => (
                  <div 
                    key={attempt.attemptId}
                    className="group flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-border/40 hover:bg-muted/10 transition-colors px-4 -mx-4 rounded-xl"
                  >
                    <div className="flex flex-col gap-2 md:max-w-xl">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={attempt.source === "scheduled" ? "secondary" : attempt.source === "tutor" ? "default" : "outline"}
                          className="font-mono text-[10px] uppercase font-bold px-2 py-0.5"
                        >
                          {attempt.source === "scheduled" ? "Terjadwal" : attempt.source === "tutor" ? "Simulasi TUTOR" : "Try out"}
                        </Badge>
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 font-medium">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatSubmittedAttemptLabel(attempt.submittedAt)}
                        </p>
                      </div>
                      
                      <h2 className="text-xl font-bold tracking-tight text-foreground transition-colors">
                        {attempt.title}
                      </h2>
                      
                      <div className="flex items-center gap-6 mt-2">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-foreground">{attempt.correctAnswers}</span> <span className="text-muted-foreground">Benar</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <XCircle className="h-4 w-4 text-destructive/80" />
                          <span className="text-foreground">{attempt.wrongAnswers}</span> <span className="text-muted-foreground">Salah</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-4 shrink-0 mt-2 md:mt-0">
                      <div className="flex items-center gap-2 text-lg font-black text-foreground">
                        <Award className="h-5 w-5 text-primary" />
                        Skor {Math.round(attempt.score)}
                      </div>
                      <Link
                        aria-label={`Buka pembahasan ${attempt.title}`}
                        {...getButtonStyleProps({
                          variant: "outline",
                          className: "w-full md:w-auto justify-center font-semibold transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                        })}
                        to={attempt.source === "scheduled"
                          ? `/app/review/${attempt.attemptId}?source=scheduled`
                          : attempt.source === "tutor"
                          ? `/app/review/${attempt.attemptId}?source=tutor`
                          : `/app/review/${attempt.attemptId}`}
                      >
                        Buka pembahasan <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Header Title Section */}
            <div className="mb-4">
              <SectionHeading
                eyebrow="Pembahasan Sesi"
                title="Jawaban dan Pembahasan"
                
              />
            </div>

            {reviewQuery.isLoading ? (
              <div className="mt-6 flex flex-col gap-8 max-w-4xl animate-pulse">
                <div className="flex flex-col gap-4 pb-4 border-b border-border/40">
                  <div className="h-6 w-32 bg-muted rounded-full" />
                  <div className="h-8 w-64 bg-muted rounded-md mt-2" />
                </div>
                <div className="space-y-4">
                  <div className="h-6 w-full bg-muted rounded-md" />
                  <div className="h-6 w-5/6 bg-muted rounded-md" />
                  <div className="h-6 w-3/4 bg-muted rounded-md" />
                </div>
                <div className="mt-8 grid gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 w-full bg-muted rounded-xl border border-border/40" />
                  ))}
                </div>
                <div className="mt-8 h-40 w-full bg-muted rounded-xl border border-border/40" />
              </div>
            ) : reviewQuery.isError ? (
              <Alert variant="destructive" className="mt-6 border-destructive/50 bg-destructive/5">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Pembahasan belum bisa dimuat</AlertTitle>
                <AlertDescription>Buka lagi dari riwayat.</AlertDescription>
              </Alert>
            ) : (
              <div className="mt-2 space-y-8">
                {source === "tutor" ? (
                  !tutorData ? (
                    <Alert className="mt-6 border-border/80 bg-card/60">
                      <Info className="h-4 w-4 text-primary" />
                      <AlertTitle>Data TUTOR tidak ditemukan</AlertTitle>
                      <AlertDescription>Belum ada data evaluasi untuk sesi ini.</AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center">
                        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                        <h2 className="text-2xl font-bold text-slate-800">Detail Evaluasi TUTOR</h2>
                        <p className="text-slate-600">Skor Total: <span className="font-bold text-xl text-blue-600">{tutorData.total_score}</span> / {tutorData.max_score}</p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-lg text-slate-800">Detail Rubrik</h3>
                        {tutorData.rubric_results?.map((r: any, idx: number) => (
                          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                              <span className="font-bold text-slate-700">{r.competency}</span>
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-sm">Skor: {r.score}</span>
                            </div>
                            <p className="text-sm text-slate-600">{r.reasoning}</p>
                          </div>
                        ))}
                      </div>

                      <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                        <h4 className="font-bold text-orange-800 mb-1">Feedback Keseluruhan</h4>
                        <p className="text-sm text-orange-700">{tutorData.feedback}</p>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-lg text-slate-800">Log Interaksi</h3>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-h-96 overflow-y-auto space-y-2">
                          {tutorData.transcript?.map((t: any, idx: number) => (
                            <div key={idx} className={`p-3 rounded-lg text-sm ${t.role === 'Kandidat' ? 'bg-blue-50' : 'bg-slate-100'}`}>
                              <span className="font-bold text-xs uppercase text-slate-500 block mb-1">{t.role}</span>
                              <span className="text-slate-800">{t.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-bold text-lg text-slate-800">Lembar Kerja</h3>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm whitespace-pre-wrap text-sm text-slate-700 font-mono">
                          {tutorData.form_data || "Tidak ada data lembar kerja."}
                        </div>
                      </div>
                    </div>
                  )
                ) : items.length === 0 ? (
                  <Alert className="mt-6 border-border/80 bg-card/60">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle>Pembahasan belum tersedia</AlertTitle>
                    <AlertDescription>Belum ada pembahasan untuk sesi ini.</AlertDescription>
                  </Alert>
                ) : (
                  /* 2-Column Tryout Layout (Exact structure of tryout-session-page.tsx) */
                  <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)] items-start">
                    {/* Left Sidebar - Navigasi Soal Grid (With p-1.5 padding to prevent active ring cutoff) */}
                    <Card className="shadow-xs h-fit">
                      <CardHeader className="pb-3 border-b bg-muted/20">
                        <CardDescription className="font-semibold uppercase tracking-wider text-primary text-xs">
                          Navigasi Soal
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4 px-3 pb-3">
                        <div className="grid grid-cols-4 gap-2.5 max-h-[70vh] overflow-y-auto p-1.5">
                          {items.map((item, index) => {
                            const isCurrent = index === currentIndex;
                            return (
                              <button
                                key={item.id}
                                onClick={() => setCurrentIndex(index)}
                                aria-label={`Soal ${index + 1}`}
                                className={[
                                  "h-10 w-full rounded-2xl border text-sm font-bold transition-all duration-150 flex items-center justify-center cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none hover:-translate-y-0.5",
                                  item.isWrong
                                    ? "!border-rose-600 !bg-rose-600 !text-white hover:!bg-rose-700"
                                    : "!border-emerald-600 !bg-emerald-600 !text-white hover:!bg-emerald-700",
                                  isCurrent ? "ring-2 ring-primary ring-offset-2 !border-primary scale-[1.03]" : "",
                                ].filter(Boolean).join(" ")}
                              >
                                {index + 1}
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Right Main View - Current Question & Pembahasan */}
                    {currentItem ? (
                      <div className="flex flex-col gap-6 w-full">
                        <div className="pb-4 border-b border-border/40">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                {currentItem.blockLabel}
                              </Badge>
                              <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground">
                                Soal {currentIndex + 1} <span className="text-muted-foreground font-medium text-lg">dari {items.length}</span>
                              </h2>
                            </div>

                            {/* Status Badge */}
                            <Badge
                              variant={currentItem.isWrong ? "secondary" : "outline"}
                              className={`px-3 py-1 text-xs font-bold flex items-center gap-1.5 border ${
                                currentItem.isWrong
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {currentItem.isWrong ? (
                                <>
                                  <XCircle className="h-4 w-4 text-destructive" />
                                  Perlu diulang
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  Sudah benar
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          {/* Question Text */}
                          <p className="text-base leading-relaxed font-medium text-foreground">
                            {currentItem.question}
                          </p>

                          {/* Question Image if present */}
                          {currentItem.questionImageUrl ? (
                            <div className="mt-6 overflow-hidden rounded-xl bg-muted/30 p-2">
                              <img
                                alt={`Gambar soal ${currentIndex + 1}`}
                                className="max-h-[26rem] w-full rounded-lg object-contain"
                                src={currentItem.questionImageUrl}
                              />
                            </div>
                          ) : null}

                          {/* Multiple Choice Options List */}
                          {currentItem.options && currentItem.options.length > 0 ? (
                            <div className="mt-8 grid gap-3">
                              {currentItem.options.map((option) => {
                                const isCorrectAnswer =
                                  option.key === currentItem.correctOptionKey ||
                                  option.text === currentItem.correctAnswer;
                                const isUserAnswer =
                                  option.key === currentItem.selectedOptionKey ||
                                  option.text === currentItem.userAnswer;
                                const isUserWrong = isUserAnswer && !isCorrectAnswer;

                                return (
                                  <div
                                    key={option.key}
                                    className={`relative flex items-center justify-between rounded-xl border p-4 text-left font-medium transition-all text-sm ${
                                      isCorrectAnswer
                                        ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-900 dark:text-emerald-100"
                                        : isUserWrong
                                        ? "border-destructive/30 bg-destructive/5 text-destructive"
                                        : "border-border/60 bg-transparent text-foreground"
                                    }`}
                                  >
                                    <div className="flex items-start gap-3 pr-4">
                                      <span
                                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold border ${
                                          isCorrectAnswer
                                            ? "bg-emerald-600 text-white border-emerald-600"
                                            : isUserWrong
                                            ? "bg-destructive text-white border-destructive"
                                            : "border-border text-muted-foreground bg-muted/30"
                                        }`}
                                      >
                                        {option.key}
                                      </span>
                                      <p className="pt-0.5 text-sm leading-relaxed font-medium">{option.text}</p>
                                    </div>

                                    {/* Badges */}
                                    {isCorrectAnswer && (
                                      <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                                        <Check className="h-3.5 w-3.5" />
                                        Jawaban Benar
                                      </span>
                                    )}

                                    {isUserWrong && (
                                      <span className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-destructive bg-destructive/10 border border-destructive/20 px-2.5 py-1 rounded-md">
                                        <X className="h-3.5 w-3.5" />
                                        Jawabanmu
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            /* Fallback to Jawabanmu & Jawaban Benar cards if options array is empty */
                            <div className="mt-8 grid gap-6 sm:grid-cols-2">
                              <div className="flex flex-col border-l-2 border-border/40 pl-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                                  Jawabanmu
                                </p>
                                <p className="text-base font-semibold leading-relaxed text-foreground">
                                  {getUserAnswerCopy(currentItem.userAnswer)}
                                </p>
                              </div>
                              <div className="flex flex-col border-l-2 border-emerald-500/40 pl-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
                                  Jawaban benar
                                </p>
                                <p className="text-base font-bold leading-relaxed text-emerald-700 dark:text-emerald-300">
                                  {currentItem.correctAnswer}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Embedded Pembahasan Box */}
                          <div className="mt-8 rounded-xl border border-border/40 bg-muted/20 p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                                Pembahasan
                              </h3>
                            </div>

                            {currentItem.explanationText ? (
                              <p className="text-sm leading-relaxed text-foreground/90">
                                {currentItem.explanationText}
                              </p>
                            ) : null}

                            {currentItem.explanationImageUrl ? (
                              <div className={currentItem.explanationText ? "mt-4" : "mt-2"}>
                                <img
                                  alt={`Gambar pembahasan ${currentItem.question}`}
                                  className="max-h-72 w-full rounded-lg border border-border/40 bg-background object-contain"
                                  src={currentItem.explanationImageUrl}
                                />
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Bottom Navigation Controls */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between py-4 mt-2">
                          <Button
                            disabled={currentIndex === 0}
                            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                            variant="outline"
                            className="w-full sm:w-auto hover:-translate-y-0.5 transition-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                          >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Sebelumnya
                          </Button>

                          <Button
                            disabled={currentIndex === items.length - 1}
                            onClick={() => setCurrentIndex((prev) => Math.min(items.length - 1, prev + 1))}
                            variant="default"
                            className="w-full sm:w-auto hover:-translate-y-0.5 transition-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                          >
                            Selanjutnya
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Redesigned Summary Stats Section at the VERY BOTTOM */}
                {reviewSummary ? (
                  <div aria-label="Ringkasan hasil sesi" className="mt-16 pt-10 border-t border-border/40 w-full">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-black tracking-tight text-foreground">
                          Ringkasan Hasil Sesi
                        </h2>
                        <p className="text-base text-muted-foreground mt-1">
                          Statistik keseluruhan performa dan skor akhir Anda
                        </p>
                      </div>
                      
                      <Badge 
                        variant={reviewSummary.source === "scheduled" ? "secondary" : reviewSummary.source === "tutor" ? "default" : "outline"}
                        className="font-mono text-xs font-semibold px-3 py-1 self-start sm:self-auto"
                      >
                        {reviewSummary.source === "scheduled" ? "Terjadwal" : reviewSummary.source === "tutor" ? "Simulasi TUTOR" : "Try out"}
                      </Badge>
                    </div>

                    <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
                      {/* Stat 1: Skor */}
                      <div className="flex flex-col border-l-2 border-border/40 pl-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          Skor Akhir
                        </p>
                        <p className="text-4xl font-black tracking-tight text-foreground">
                          {Math.round(reviewSummary.score)}
                        </p>
                      </div>

                      {/* Stat 2: Jawaban Benar */}
                      <div className="flex flex-col border-l-2 border-border/40 pl-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          Jawaban Benar
                        </p>
                        <p className="text-4xl font-black tracking-tight text-foreground">
                          {reviewSummary.correctAnswers} <span className="text-sm font-semibold text-muted-foreground">Soal</span>
                        </p>
                      </div>

                      {/* Stat 3: Jawaban Salah */}
                      <div className="flex flex-col border-l-2 border-border/40 pl-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          Jawaban Salah
                        </p>
                        <p className="text-4xl font-black tracking-tight text-foreground">
                          {reviewSummary.wrongAnswers} <span className="text-sm font-semibold text-muted-foreground">Soal</span>
                        </p>
                      </div>

                      {/* Stat 4: Tanggal Submit */}
                      <div className="flex flex-col border-l-2 border-border/40 pl-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          Tanggal Selesai
                        </p>
                        <p className="text-lg font-bold tracking-tight text-foreground leading-snug mt-1">
                          {formatSubmittedAttemptSummaryLabel(reviewSummary.submittedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </ProductShell>
  );
}

export default ReviewPage;
