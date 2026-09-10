import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useSearchParams } from "react-router";
import { Filter, ArrowRight, AlertCircle } from "lucide-react";
import ProductShell from "../../components/layout/product-shell";
import { Button, getButtonStyleProps } from "../../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { listPublishedFlashCardSubtopics } from "../../lib/api/flash-card-api";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { getTopicVisuals } from "../../lib/utils/topic-visuals";
import { PaywallGate } from "../../components/layout/paywall-gate";

function FlashCardsPage() {
  const studentShell = useStudentShell("/app/flash-cards");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get("group") || "ALL";

  const { data: libraryData, isLoading, isError } = useQuery({
    queryKey: ["flash-card-library"],
    queryFn: () => listPublishedFlashCardSubtopics(),
  });

  const allItems = libraryData || [];

  const uniqueGroupLabels = Array.from(
    new Set(allItems.map(t => t.academicGroupLabel).filter(Boolean))
  );

  if (studentShell.role === "pendaftar_baru") {
    return <PaywallGate brand={productShellMeta.brand} tierLabel={studentShell.tierLabel} navItems={studentShell.navItems} />;
  }

  const filteredItems = activeFilter === "ALL"
    ? allItems
    : allItems.filter((item) => item.academicGroupLabel === activeFilter);

  return (
    <ProductShell
      brand={productShellMeta.brand}
      navItems={studentShell.navItems}
      tierLabel={studentShell.tierLabel}
    >
      <div className="flex flex-col gap-8 w-full py-4">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <span className="mb-3 inline-flex items-center rounded bg-primary/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Filter className="mr-1.5 h-3 w-3" />
              Latihan Mandiri
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              Kartu Belajar
            </h1>
            <p className="text-base text-muted-foreground mt-2 max-w-2xl">
              Pilih submateri lalu ulang poin penting dengan kartu belajar singkat.
            </p>
          </div>
        </div>

        {isError ? (
          <div className="w-full">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Kartu belajar belum bisa dimuat</AlertTitle>
              <AlertDescription>
                Coba lagi sebentar.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            {!isLoading && (
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <Button
                  data-testid="filter-all"
                  variant={activeFilter === "ALL" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSearchParams((prev) => { prev.delete("group"); return prev; })}
                  className="rounded-full px-5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Semua Kelompok ({allItems.length})
                </Button>
                {uniqueGroupLabels.map((label) => (
                  <Button
                    key={label}
                    data-testid={`filter-${label}`}
                    variant={activeFilter === label ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setSearchParams((prev) => { prev.set("group", label); return prev; })}
                    className="rounded-full px-5 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}

            <div className="flex flex-col border-t border-border/40 mt-6 w-full">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} data-testid="skeleton-card" className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-border/40">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-muted animate-pulse shrink-0" />
                      <div className="space-y-3 pt-1">
                        <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                        <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-64 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-9 w-32 bg-muted rounded-md animate-pulse shrink-0" />
                  </div>
                ))
              ) : filteredItems.length === 0 ? (
                <div className="py-16 flex flex-col items-center justify-center text-center border-b border-border/40">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                    <Filter className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground">Folder kosong</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-sm">Belum ada materi kartu belajar di kelompok ini. Coba pilih kelompok lain.</p>
                </div>
              ) : (
                filteredItems.map((item) => {
                  const titleToSearch = `${item.subtopicTitle} ${item.materialTitle}`;
                  const visuals = getTopicVisuals(titleToSearch);
                  const Icon = visuals.icon;
                  return (
                    <div
                      key={item.subtopicId}
                      className="group flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-border/40 hover:bg-muted/30 transition-all duration-300 ease-out px-4 -mx-4 rounded-xl hover:shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          {item.academicGroupLabel && (
                            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {item.academicGroupLabel}
                            </span>
                          )}
                          <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                            {item.subtopicTitle}
                          </h3>
                          <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
                            {item.subtopicSummary}
                          </p>
                          <p className="mt-3 text-xs text-muted-foreground font-medium">
                            {item.materialTitle} • {item.cardCount} Kartu
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pt-2 md:pt-0 pl-10 md:pl-0">
                        <Link
                          {...getButtonStyleProps({
                            variant: "secondary",
                            size: "sm",
                            className: "font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          })}
                          to={`/app/flash-cards/${item.subtopicId}`}
                        >
                          Mulai Belajar <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </ProductShell>
  );
}

export default FlashCardsPage;
