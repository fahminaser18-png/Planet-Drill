import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, Trophy, Crown, Medal, Award } from "lucide-react";
import { useSearchParams } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import SectionHeading from "../../components/ui/section-heading";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { useSession } from "../../lib/auth/use-session";
import { getScheduledEventLeaderboard } from "../../lib/api/scheduled-tryout-api";
import { mapScheduledEventLeaderboardToPageData } from "../../lib/mappers/scheduled-tryout-mappers";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";

function getRankBadgeStyle(rank: number) {
  if (rank === 1) {
    return {
      bg: "bg-primary text-primary-foreground",
      icon: <span className="text-sm font-bold">1</span>,
    };
  }
  if (rank === 2) {
    return {
      bg: "bg-muted text-foreground",
      icon: <span className="text-sm font-bold">2</span>,
    };
  }
  if (rank === 3) {
    return {
      bg: "bg-muted text-muted-foreground",
      icon: <span className="text-sm font-bold">3</span>,
    };
  }
  return {
    bg: "text-muted-foreground",
    icon: <span className="text-base font-bold">{rank}</span>,
  };
}

function ScheduledTryoutLeaderboardPage() {
  const [searchParams] = useSearchParams();
  const { user } = useSession();
  const studentShell = useStudentShell("/app/scheduled-tryout");
  const eventId = searchParams.get("event");
  const cycleParam = searchParams.get("cycle");
  const eventCycle = cycleParam ? Number(cycleParam) : null;
  const leaderboardQuery = useQuery({
    queryKey: ["scheduled-event-leaderboard", user?.id, eventId, eventCycle],
    enabled: Boolean(user?.id && eventId && (cycleParam === null || Number.isFinite(eventCycle))),
    queryFn: () =>
      getScheduledEventLeaderboard({
        eventId: eventId!,
        eventCycle,
      }),
  });
  const pageData = leaderboardQuery.data
    ? mapScheduledEventLeaderboardToPageData(leaderboardQuery.data)
    : null;
  const isLiveEmpty = pageData?.state === "live" && pageData.rows.length === 0;
  const isFinalEmpty = pageData?.state === "final" && pageData.rows.length === 0;

  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <div className="flex flex-col gap-8 w-full py-4">
        {/* Header Section */}
        <div className="pb-4 border-b border-border/40">
          <SectionHeading
            eyebrow="Peringkat Terjadwal"
            title="Leaderboard Event" - Siklus ${pageData.eventCycle}. Pantau posisi skor terbaikmu di event ini.` : "Pantau posisi dan skor terbaikmu pada event try out terjadwal."}
          />
        </div>

        {!eventId ? (
          <Alert className="mt-6 border-dashed bg-card/60">
            <AlertTitle>Event belum dipilih</AlertTitle>
            <AlertDescription>Pilih event terlebih dahulu dari katalog atau halaman hasil.</AlertDescription>
          </Alert>
        ) : leaderboardQuery.isLoading ? (
          <div className="mt-6 grid gap-6 w-full">
            <div className="h-[6.5rem] w-full bg-muted/50 rounded-xl animate-pulse" />
            <div className="divide-y border rounded-xl bg-card/60">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="space-y-2">
                      <div className="h-5 w-32 bg-muted rounded" />
                      <div className="h-3 w-40 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-20 bg-muted rounded-full" />
                    <div className="h-6 w-20 bg-muted rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : leaderboardQuery.isError ? (
          <Alert variant="destructive" className="mt-6 border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Leaderboard belum bisa dimuat</AlertTitle>
            <AlertDescription>Coba lagi sebentar.</AlertDescription>
          </Alert>
        ) : isLiveEmpty ? (
          <div className="mt-6 flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-card/60 shadow-sm">
            <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Belum ada hasil untuk event ini</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Event masih berjalan, tetapi belum ada hasil yang masuk. Jadilah yang pertama!</p>
          </div>
        ) : isFinalEmpty ? (
          <div className="mt-6 flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-card/60 shadow-sm">
            <Award className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Belum ada hasil final untuk siklus ini</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Siklus ini selesai, tetapi hasil final belum tersedia.</p>
          </div>
        ) : !pageData || pageData.rows.length === 0 ? (
          <div className="mt-6 flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-card/60 shadow-sm">
            <Crown className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">Leaderboard masih kosong</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Belum ada data peringkat untuk event ini.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 w-full">
            {/* Event Summary Status Card */}
            <Card className="p-6">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5" />
                  {pageData.stateLabel}
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-3xl">
                {pageData.helperText}
              </p>
            </Card>

            {/* Leaderboard Rows Container */}
            <div className="divide-y border rounded-xl bg-card">
              {pageData.rows.map((row, index) => {
                const rankStyle = getRankBadgeStyle(row.rank);

                return (
                  <div
                    key={row.attemptId}
                    data-testid={`scheduled-leaderboard-row-${index}`}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${rankStyle.bg}`}>
                        {rankStyle.icon}
                      </div>
                      {row.avatarUrl ? (
                        <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border border-border bg-muted">
                          <img src={row.avatarUrl} alt={row.alias} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-muted text-muted-foreground font-bold border border-border text-xs uppercase">
                          {row.alias.substring(0, 2)}
                        </div>
                      )}
                      <div>
                        <p className="font-extrabold tracking-tight text-foreground text-base">{row.alias}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">
                          Skor terbaik di percobaan #{row.bestScoreAttemptNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      <Badge variant="secondary" className="font-mono text-xs font-bold px-3 py-1">
                        Skor {Math.round(row.bestScore)}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-semibold text-muted-foreground px-3 py-1">
                        Siklus {row.eventCycle}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ProductShell>
  );
}

export default ScheduledTryoutLeaderboardPage;
