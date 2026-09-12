import { useQuery } from "@tanstack/react-query";
import { Filter, ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { Link, useSearchParams, Navigate } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import SectionHeading from "../../components/ui/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button, getButtonStyleProps } from "../../components/ui/button";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { listTryoutCatalogEntries } from "../../lib/api/tryout-api";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { getTopicVisuals } from "../../lib/utils/topic-visuals";

function TryoutTopicSelectionPage() {
  const studentShell = useStudentShell("/app/tryout-selection");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeFilter = searchParams.get("block") || "ALL";

  const { data: catalogEntries, isLoading, error } = useQuery({
    queryKey: ["tryout-catalog"],
    queryFn: () => listTryoutCatalogEntries(),
  });

  const topicOptions = (catalogEntries || []).filter((entry) => entry.mode === "topic");

  const uniqueBlocks = Array.from(
    new Map(
      topicOptions
        .filter(t => t.blockId && t.blockName)
        .map((t) => [t.blockId, { id: t.blockId!, name: t.blockName! }])
    ).values()
  );

  const filteredTopics = activeFilter === "ALL"
    ? topicOptions
    : topicOptions.filter((item) => item.blockId === activeFilter);



  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <div className="flex flex-col gap-10 w-full py-6">
        {/* Page Header */}
        <div className="pb-6 border-b border-border/40">
          <SectionHeading
            title="Try Out Per Materi / Topik"
          />
        </div>

        {error ? (
          <div className="w-full rounded-xl border border-destructive/20 bg-destructive/5 p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-destructive">Gagal Memuat Data</h3>
              <p className="text-sm text-destructive/80 mt-1">Terjadi kesalahan saat memuat pilihan topik try out. Silakan coba beberapa saat lagi.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Filter Tabs */}
            {!isLoading && (
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  data-testid="filter-all"
                  variant={activeFilter === "ALL" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setSearchParams({})}
                  className={`rounded-md px-4 text-sm font-semibold hover:-translate-y-0.5 transition-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${activeFilter === "ALL" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Semua Blok ({topicOptions.length})
                </Button>
                {uniqueBlocks.map((block) => (
                  <Button
                    key={block.id}
                    data-testid={`filter-${block.id}`}
                    variant={activeFilter === block.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSearchParams({ block: block.id })}
                    className={`rounded-md px-4 text-sm font-semibold hover:-translate-y-0.5 transition-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${activeFilter === block.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    {block.name}
                  </Button>
                ))}
              </div>
            )}

            {/* Topic List */}
            <div className="flex flex-col gap-0 w-full border-t border-border/40">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="py-6 border-b border-border/40 flex items-center justify-between gap-4 animate-pulse">
                    <div className="flex items-start gap-4 w-full">
                      <div className="h-10 w-10 bg-muted rounded-lg shrink-0 mt-0.5" />
                      <div className="space-y-3 w-full max-w-md">
                        <div className="h-5 bg-muted rounded-md w-3/4" />
                        <div className="h-4 bg-muted rounded-md w-full" />
                        <div className="h-4 bg-muted rounded-md w-1/4" />
                      </div>
                    </div>
                    <div className="h-9 w-24 bg-muted rounded-md shrink-0 hidden sm:block" />
                  </div>
                ))
              ) : filteredTopics.length === 0 ? (
                <div className="py-12 text-muted-foreground">
                  Belum ada data materi try out yang tersedia untuk blok ini.
                </div>
              ) : (
                filteredTopics.map((topic) => {
                  const visuals = getTopicVisuals(topic.title);
                  const Icon = visuals.icon;
                  return (
                    <div
                      key={topic.id}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-b border-border/40 hover:bg-muted/10 transition-colors px-4 -mx-4 rounded-xl"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0 group-hover:text-primary transition-colors mt-0.5">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="max-w-xl">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                              {topic.title}
                            </h3>
                            {topic.blockName && (
                              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md w-fit">
                                {topic.blockName}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                            {topic.description}
                          </p>
                          <p className="text-xs font-semibold text-muted-foreground font-mono mt-3">
                            {topic.requiredQuestionCount} Soal Latihan
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 flex flex-col items-start sm:items-end w-full sm:w-auto">
                        {topic.isStartable ? (
                          <Link
                            {...getButtonStyleProps({
                              variant: "outline",
                              size: "sm",
                              className: "w-full sm:w-auto font-semibold group-hover:border-primary group-hover:text-primary transition-all hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                            })}
                            to={`/app/tryout/session?template=${topic.sessionTemplateId}`}
                          >
                            Mulai <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                          </Link>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full sm:w-auto font-semibold opacity-50"
                            disabled
                          >
                            Mulai <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        )}
                        
                        {!topic.isStartable && topic.disabledReason && (
                          <span className="text-xs text-destructive mt-2 font-medium">
                            {topic.disabledReason}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </ProductShell>
  );
}

export default TryoutTopicSelectionPage;

