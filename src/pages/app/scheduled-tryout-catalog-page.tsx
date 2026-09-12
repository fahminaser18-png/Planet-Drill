import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ArrowRight, Calendar, Loader2 } from "lucide-react";
import { Link } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import Button, { getButtonStyleProps } from "../../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import SectionHeading from "../../components/ui/section-heading";
import {
  findActiveScheduledAttemptForUser,
  listScheduledTryoutCatalogEntries,
} from "../../lib/api/scheduled-tryout-api";
import {
  formatScheduledDurationAsClock,
  mapScheduledCatalogEntriesToCards,
} from "../../lib/mappers/scheduled-tryout-mappers";
import { useSession } from "../../lib/auth/use-session";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";

function ScheduledTryoutCatalogCardView({
  item,
}: {
  item: ReturnType<typeof mapScheduledCatalogEntriesToCards>[number];
}) {
  const isStartDisabled = item.isLocked;

  return (
    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/50 transition-colors focus-within:bg-muted/50">
      <div className="flex-1 min-w-0">
        <Badge variant="secondary" className="w-fit flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {item.subtitle}
        </Badge>
        <h3 className="mt-3 text-xl font-semibold text-foreground">{item.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
        
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{item.questionCountLabel}</Badge>
          <Badge variant="outline">{item.durationLabel}</Badge>
          <Badge variant="outline">{item.attemptsRemainingLabel}</Badge>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{item.windowLabel}</p>
      </div>

      <div className="flex flex-col gap-2 shrink-0 sm:items-end mt-4 sm:mt-0">
        {!isStartDisabled ? (
          <Link
            {...getButtonStyleProps({
              variant: "primary",
              className: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none",
            })}
            to={`/app/scheduled-tryout/session?event=${item.id}`}
          >
            Mulai sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <>
            <Button
              disabled
              trailingIcon={<ArrowRight className="h-4 w-4" />}
              variant="secondary"
            >
              Mulai sesi
            </Button>
            <p className="text-xs text-muted-foreground text-center sm:text-right">
              Sesi sudah habis.
            </p>
          </>
        )}
        <Link
          {...getButtonStyleProps({
            variant: "outline",
            className: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none",
          })}
          to={`/app/scheduled-tryout/leaderboard?event=${item.id}`}
        >
          Lihat leaderboard
        </Link>
      </div>
    </div>
  );
}

function ScheduledTryoutCatalogPage() {
  const { user } = useSession();
  const studentShell = useStudentShell("/app/scheduled-tryout");
  const catalogQuery = useQuery({
    queryKey: ["scheduled-tryout-catalog", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => listScheduledTryoutCatalogEntries({
      userId: user!.id,
    }),
  });
  const activeAttemptQuery = useQuery({
    queryKey: ["active-scheduled-tryout-attempt", user?.id],
    enabled: Boolean(user?.id),
    queryFn: () => findActiveScheduledAttemptForUser({
      userId: user!.id,
    }),
  });
  const cards = mapScheduledCatalogEntriesToCards(catalogQuery.data ?? []);
  const activeAttempt = activeAttemptQuery.data;
  const remainingCards = activeAttempt
    ? cards.filter((item) => item.id !== activeAttempt.eventId)
    : cards;

  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <section id="scheduled-tryout">
        <SectionHeading
          title="Try Out Terjadwal"
          eyebrow="Event aktif"
        />

        <div className="mt-6">
          {catalogQuery.isPending ? (
            <div className="mt-8 divide-y border rounded-xl bg-card">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-5 flex flex-col sm:flex-row gap-4 justify-between animate-pulse">
                  <div className="space-y-3 flex-1">
                    <div className="h-5 w-24 bg-muted rounded" />
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-4 w-1/2 bg-muted rounded" />
                    <div className="flex gap-2 mt-4">
                      <div className="h-6 w-16 bg-muted rounded" />
                      <div className="h-6 w-16 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="h-10 w-32 bg-muted rounded mt-4 sm:mt-0" />
                </div>
              ))}
            </div>
          ) : catalogQuery.isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Daftar sesi belum bisa dimuat</AlertTitle>
              <AlertDescription>Coba lagi sebentar.</AlertDescription>
            </Alert>
          ) : cards.length === 0 ? (
            <Alert className="border-dashed">
              <AlertTitle>Belum ada sesi aktif</AlertTitle>
              <AlertDescription>Belum ada sesi yang bisa diikuti saat ini.</AlertDescription>
            </Alert>
          ) : activeAttemptQuery.isPending ? (
            <div className="mt-8 divide-y border rounded-xl bg-card">
              {[1, 2].map((i) => (
                <div key={i} className="p-5 flex flex-col sm:flex-row gap-4 justify-between animate-pulse">
                  <div className="space-y-3 flex-1">
                    <div className="h-5 w-24 bg-muted rounded" />
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-4 w-1/2 bg-muted rounded" />
                  </div>
                  <div className="h-10 w-32 bg-muted rounded mt-4 sm:mt-0" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {activeAttempt ? (
                <Card className="mb-6 p-6 sm:p-7 bg-accent text-accent-foreground">
                  <Badge variant="outline" className="w-fit bg-background text-foreground">
                    {activeAttempt.status === "paused" ? "Lanjutkan sesi" : "Sesi masih berjalan"}
                  </Badge>
                  <h3 className="mt-4 text-3xl font-semibold text-foreground">
                    {activeAttempt.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Lanjutkan sesi yang tertunda tanpa mulai dari awal.
                  </p>
                  <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="secondary">
                        {activeAttempt.answeredCount} dari {activeAttempt.totalQuestions} soal terjawab
                      </Badge>
                      <Badge variant="secondary">
                        Timer sesi {formatScheduledDurationAsClock(activeAttempt.timeRemainingSeconds)}
                      </Badge>
                    </div>
                    <Link
                      {...getButtonStyleProps({
                        variant: "primary",
                        className: "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none",
                      })}
                      to={`/app/scheduled-tryout/session?attempt=${activeAttempt.attemptId}`}
                    >
                      <span className="flex items-center gap-2">
                        Lanjutkan sesi
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </Card>
              ) : null}

              {remainingCards.length > 0 ? (
                <div className="divide-y border rounded-xl bg-card">
                  {remainingCards.map((item) => (
                    <ScheduledTryoutCatalogCardView key={item.id} item={item} />
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </ProductShell>
  );
}

export default ScheduledTryoutCatalogPage;
