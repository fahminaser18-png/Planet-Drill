import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, AlertCircle, Info, Trophy, Crown, Medal, Award, Clock } from "lucide-react";
import { Navigate } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import SectionHeading from "../../components/ui/section-heading";
import Button from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { Card, CardContent } from "../../components/ui/card";
import {
  getLeaderboard,
  type LeaderboardCategory,
} from "../../lib/api/leaderboard-api";
import { PaywallGate } from "../../components/layout/paywall-gate";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser-client";

function formatScore(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(2);
}

function formatDuration(value: number | null) {
  if (value === null) {
    return "-";
  }

  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

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
    icon: <span className="text-sm font-bold">{rank}</span>,
  };
}

export default function LeaderboardPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<LeaderboardCategory>("overall");
  const studentShell = useStudentShell("/app/leaderboard");

  const { data: blocks } = useQuery({
    queryKey: ["content-blocks-leaderboard"],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from("content_blocks").select("name").order("name");
      return data || [];
    }
  });

  const categories = [
    { id: "overall", label: "Overall" },
    ...(blocks?.map(b => ({ id: b.name, label: b.name })) || [])
  ];

  const {
    data: leaderboard,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["leaderboard", selectedCategory],
    queryFn: () => getLeaderboard({ category: selectedCategory }),
  });

  if (studentShell.role === "pendaftar_baru") {
    return <PaywallGate brand={productShellMeta.brand} tierLabel={studentShell.tierLabel} navItems={studentShell.navItems} />;
  }

  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <div className="flex flex-col gap-6 w-full py-4 ">
        <div className="pb-4 border-b border-border/40">
          <SectionHeading
            eyebrow="Peringkat Keseluruhan"
            title="Leaderboard Nasional"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
                  : "rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
              }
            >
              {category.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
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
                <div className="flex flex-col sm:items-end gap-2">
                  <div className="h-6 w-20 bg-muted rounded-full" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Gagal memuat leaderboard</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : "Terjadi kesalahan yang tidak diketahui."}
            </AlertDescription>
          </Alert>
        ) : !leaderboard || leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-card/60 shadow-sm">
            <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              Belum ada data
            </h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Belum ada peserta yang menyelesaikan simulasi tryout untuk kategori
              ini. Jadilah yang pertama!
            </p>
          </div>
        ) : (
          <div className="divide-y border rounded-xl bg-card">
            {leaderboard.map((row) => {
              const styles = getRankBadgeStyle(row.rank);
              return (
                <div
                  key={row.userId}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 hover:bg-muted/50 transition-colors focus-within:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-full ${styles.bg}`}
                    >
                      {styles.icon}
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

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base truncate pr-4 text-foreground">
                        {row.alias}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Waktu terbaik {formatDuration(row.timeUsedSeconds)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1 shrink-0">
                    <Badge variant="secondary" className="font-mono">
                      Skor {formatScore(row.score)}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {row.category === "overall" ? "Overall" : row.category}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </ProductShell>
  );
}
