import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  AlertCircle,
  LayoutGrid,
  icons
} from "lucide-react";
import { Link, Navigate } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import SectionHeading from "../../components/ui/section-heading";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button, getButtonStyleProps } from "../../components/ui/button";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { PaywallGate } from "../../components/layout/paywall-gate";
import { listTryoutCatalogEntries } from "../../lib/api/tryout-api";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import type { ElementType } from "react";

export const mapBlockVisuals = (iconName?: string | null, colorTheme?: string | null) => {
  const IconComponent = iconName && iconName in icons 
    ? icons[iconName as keyof typeof icons] 
    : LayoutGrid;

  const theme = (colorTheme || "slate").toLowerCase();
  
  let accentBg = "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400";
  
  if (theme === "teal") {
    accentBg = "bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400";
  } else if (theme === "indigo") {
    accentBg = "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400";
  } else if (theme === "amber" || theme === "yellow") {
    accentBg = "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";
  } else if (theme === "fuchsia" || theme === "purple") {
    accentBg = "bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 text-fuchsia-600 dark:text-fuchsia-400";
  } else if (theme === "blue") {
    accentBg = "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400";
  } else if (theme === "green") {
    accentBg = "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400";
  } else if (theme === "rose" || theme === "red") {
    accentBg = "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400";
  } else if (theme === "cyan") {
    accentBg = "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400";
  }
  
  return {
    icon: IconComponent as ElementType,
    accentBg,
  };
};

function TryoutBlockSelectionPage() {
  const studentShell = useStudentShell("/app/tryout-selection");

  if (studentShell.role === "pendaftar_baru") {
    return <PaywallGate brand={productShellMeta.brand} tierLabel={studentShell.tierLabel} navItems={studentShell.navItems} />;
  }

  const { data: catalogEntries, isLoading, error } = useQuery({
    queryKey: ["tryout-catalog"],
    queryFn: () => listTryoutCatalogEntries(),
  });

  const blockOptions = (catalogEntries || []).filter((entry) => entry.mode === "block" || entry.mode === "full");



  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <div className="flex flex-col gap-10 w-full py-6">
        {/* Header Section */}
        <div className="pb-6 border-b border-border/40">
          <SectionHeading
            title="Latihan Try Out Per Blok"
            description="Fokuskan penguasaan materi pada salah satu dari kelompok subtes UTBK."
          />
        </div>

        {error ? (
          <div className="w-full rounded-xl border border-destructive/20 bg-destructive/5 p-6 flex items-start gap-4">
            <AlertCircle className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-destructive">Gagal Memuat Data</h3>
              <p className="text-sm text-destructive/80 mt-1">Terjadi kesalahan saat memuat pilihan blok try out. Silakan coba beberapa saat lagi.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-0 w-full">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="py-8 border-b border-border/40 animate-pulse flex items-center justify-between gap-6">
                  <div className="flex items-start gap-6 w-full">
                    <div className="h-14 w-14 bg-muted rounded-xl shrink-0" />
                    <div className="space-y-3 w-full max-w-xl mt-1">
                      <div className="h-6 bg-muted rounded-md w-1/2" />
                      <div className="h-4 bg-muted rounded-md w-5/6" />
                      <div className="h-4 bg-muted rounded-md w-3/4" />
                    </div>
                  </div>
                  <div className="h-10 w-32 bg-muted rounded-md shrink-0 hidden md:block" />
                </div>
              ))
            ) : blockOptions.length === 0 ? (
              <div className="py-12 text-muted-foreground">
                Belum ada data blok try out yang tersedia.
              </div>
            ) : (
              blockOptions.map((block) => {
                const visuals = mapBlockVisuals(block.iconName, block.colorTheme);
                const Icon = visuals.icon;
                const buttonText = block.mode === "full" ? "Mulai Try Out Besar" : "Mulai Try Out Blok Ini";
                const subtitle = block.mode === "full" ? "Seluruh Materi Blok" : block.mode === "block" ? "Latihan Per Blok" : "Materi Khusus";
                
                return (
                  <div
                    key={block.id}
                    className="group flex flex-col md:flex-row md:items-start justify-between gap-6 py-8 border-b border-border/40 hover:bg-muted/20 transition-colors px-4 -mx-4 rounded-xl"
                  >
                    <div className="flex items-start gap-6">
                      <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${visuals.accentBg} shrink-0`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-2xl font-bold tracking-tight text-foreground">
                            {block.title}
                          </h3>
                          <Badge variant="secondary" className="font-mono text-xs hidden sm:inline-flex">{subtitle}</Badge>
                        </div>
                        <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                          {block.description}
                        </p>
                      </div>
                    </div>
    
                    <div className="flex flex-col gap-3 shrink-0 pt-2 md:pt-0 w-full md:w-auto">
                      {block.isStartable ? (
                        <Link
                          {...getButtonStyleProps({
                            variant: "primary",
                            className: "w-full md:w-auto justify-center hover:-translate-y-0.5 transition-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                          })}
                          to={`/app/tryout/session?template=${block.sessionTemplateId}`}
                        >
                          {buttonText} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      ) : (
                        <div className="flex flex-col gap-1 w-full text-right md:items-end">
                          <Button
                            variant="primary"
                            className="w-full md:w-auto justify-center opacity-50"
                            disabled
                          >
                            {buttonText} <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                          {block.disabledReason && (
                            <span className="text-xs font-medium text-destructive mt-1">
                              {block.disabledReason}
                            </span>
                          )}
                        </div>
                      )}
    
                      {block.blockId && (
                        <Link
                          {...getButtonStyleProps({
                            variant: "outline",
                            className: "w-full md:w-auto justify-center text-sm font-semibold hover:-translate-y-0.5 transition-transform focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none",
                          })}
                          to={`/app/tryout/topics?block=${block.blockId}`}
                        >
                          <BookOpen className="mr-1.5 h-4 w-4" />
                          Pilih per Materi
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </ProductShell>
  );
}

export default TryoutBlockSelectionPage;

