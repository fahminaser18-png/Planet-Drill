import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, AlertCircle, Info, Trophy, Crown, Medal, Award, Clock } from "lucide-react";
import { Navigate } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import Button from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { Card, CardContent } from "../../components/ui/card";
import {
  getLeaderboard,
  type LeaderboardCategory,
} from "../../lib/api/leaderboard-api";
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
      bg: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40",
      card: "border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-card to-card shadow-md",
      icon: (
        <div className="flex flex-col items-center justify-center">
          <Crown className="h-4 w-4 text-amber-500 -mb-0.5" />
          <span className="text-sm font-extrabold">1</span>
        </div>
      ),
    };
  }
  if (rank === 2) {
    return {
      bg: "bg-slate-400/20 text-slate-700 dark:text-slate-300 border-slate-400/40",
      card: "border-slate-400/30 bg-gradient-to-r from-slate-400/10 via-card to-card shadow-sm",
      icon: (
        <div className="flex flex-col items-center justify-center">
          <Medal className="h-4 w-4 text-slate-400 -mb-0.5" />
          <span className="text-sm font-extrabold">2</span>
        </div>
      ),
    };
  }
  if (rank === 3) {
    return {
      bg: "bg-orange-700/20 text-orange-700 dark:text-orange-400 border-orange-700/30",
      card: "border-orange-700/30 bg-gradient-to-r from-orange-700/10 via-card to-card shadow-sm",
      icon: (
        <div className="flex flex-col items-center justify-center">
          <Award className="h-4 w-4 text-orange-700 dark:text-orange-500 -mb-0.5" />
          <span className="text-sm font-extrabold">3</span>
        </div>
      ),
    };
  }
  return {
    bg: "bg-primary/10 text-primary border-primary/20",
    card: "border-border bg-card",
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
    return <Navigate to="/app/beranda" replace />;
  }

  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <div className="flex flex-col gap-6 w-full py-4 ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Leaderboard
            </h1>
            
          </div>
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
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
                  : "rounded-full"
              }
            >
              {category.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-card/50">
            <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground">
              Belum ada data
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Belum ada peserta yang menyelesaikan simulasi tryout untuk kategori
              ini. Jadilah yang pertama!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {leaderboard.map((row) => {
              const styles = getRankBadgeStyle(row.rank);
              return (
                <Card
                  key={row.userId}
                  className={`overflow-hidden transition-all duration-200 hover:scale-[1.01] ${styles.card}`}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center p-4 gap-4">
                      <div
                        className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-xl border ${styles.bg}`}
                      >
                        {styles.icon}
                      </div>

                      {row.avatarUrl ? (
                        <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border border-border bg-muted">
                          <img src={row.avatarUrl} alt={row.alias} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center bg-primary/10 text-primary font-bold border border-primary/20 text-xs uppercase">
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

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge
                          variant="secondary"
                          className="font-mono bg-primary/10 text-primary border-primary/20"
                        >
                          <Trophy className="h-3 w-3 mr-1" />
                          Skor {formatScore(row.score)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                          {row.category === "overall" ? "Overall" : row.category}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProductShell>
  );
}
