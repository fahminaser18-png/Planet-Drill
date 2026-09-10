import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, Trophy, Crown, Medal, Award } from "lucide-react";
import { useSearchParams } from "react-router";
import ProductShell from "../../components/layout/product-shell";
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <Badge variant="outline" className="mb-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
              <Trophy className="mr-1.5 h-3.5 w-3.5 inline-block" />
              Peringkat Terjadwal
            </Badge>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Peringkat Event
            </h1>
            <p className="text-base text-muted-foreground mt-2 max-w-2xl">
              {pageData
                ? `${pageData.eventTitle} - Siklus ${pageData.eventCycle}. Lihat skor terbaik dan peserta tercepat.`
                : "Lihat skor terbaik dan peserta tercepat di setiap event."}
            </p>
          </div>
        </div>

        {!eventId ? (
          <Alert className="mt-6 border-dashed bg-card/60">
            <AlertTitle>Event belum dipilih</AlertTitle>
            <AlertDescription>Pilih event terlebih dahulu dari katalog atau halaman hasil.</AlertDescription>
          </Alert>
        ) : leaderboardQuery.isLoading ? (
          <div className="mt-6 flex flex-col items-center justify-center space-y-4 py-16 text-center text-muted-foreground border rounded-2xl bg-card/60 shadow-sm backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div>
              <h3 className="font-semibold text-foreground">Leaderboard sedang dimuat</h3>
              <p className="text-sm">Peringkat sedang disiapkan.</p>
            </div>
          </div>
        ) : leaderboardQuery.isError ? (
          <Alert variant="destructive" className="mt-6 border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Leaderboard belum bisa dimuat</AlertTitle>
            <AlertDescription>Coba lagi sebentar.</AlertDescription>
          </Alert>
        ) : isLiveEmpty ? (
          <Alert className="mt-6 border-dashed bg-card/60">
            <AlertTitle>Belum ada hasil untuk event ini</AlertTitle>
            <AlertDescription>Event masih berjalan, tetapi hasil belum masuk.</AlertDescription>
          </Alert>
        ) : isFinalEmpty ? (
          <Alert className="mt-6 border-dashed bg-card/60">
            <AlertTitle>Belum ada hasil final untuk siklus ini</AlertTitle>
            <AlertDescription>Siklus ini selesai, tetapi hasil final belum tersedia.</AlertDescription>
          </Alert>
        ) : !pageData || pageData.rows.length === 0 ? (
          <Alert className="mt-6 border-dashed bg-card/60">
            <AlertTitle>Leaderboard masih kosong</AlertTitle>
            <AlertDescription>Belum ada data peringkat untuk event ini.</AlertDescription>
          </Alert>
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
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4"
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
