import React from "react";
import { Link } from "react-router";
import {
  BookOpen,
  Sparkles,
  Layers,
  CalendarClock,
  Video,
  Presentation,
  ArrowRight,
  Settings2,
  Lock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductShell from "../../components/layout/product-shell";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { getGlobalAiCredentialStatus } from "../../lib/api/global-ai-credential-api";

interface MentorFeatureCard {
  id: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  icon: React.ComponentType<{ className?: string }>;
}

const MENTOR_FEATURES: MentorFeatureCard[] = [
  {
    id: "bank-soal",
    title: "Bank Soal",
    description: "Kelola database soal kuis & try out UTBK, sunting pertanyaan, opsi jawaban, serta pembahasan.",
    href: "/app/questions",
    buttonText: "Pilih Bank Soal",
    icon: BookOpen,
  },
  {
    id: "event-terjadwal",
    title: "Event Terjadwal",
    description: "Simulasi ujian sebenarnya dengan batasan waktu yang ketat, penjadwalan try out, dan saingan serentak.",
    href: "/scheduled-ops/events",
    buttonText: "Pilih Event Terjadwal",
    icon: CalendarClock,
  },
  {
    id: "kelola-materi",
    title: "Kelola Materi",
    description: "Unggah dan kelola modul materi pembelajaran, PDF ringkasan, serta presentasi bahan ajar.",
    href: "/app/materi-ppt?mode=manage",
    buttonText: "Pilih Kelola Materi",
    icon: Presentation,
  },
  {
    id: "penyusun-soal",
    title: "Penyusun Soal",
    description: "Buat draf soal latihan secara otomatis dan efisien menggunakan bantuan AI berbasis referensi UTBK.",
    href: "/app/question-generator",
    buttonText: "Pilih Penyusun Soal",
    icon: Sparkles,
  },
  {
    id: "penyusun-flashcard",
    title: "Penyusun Flash Card",
    description: "Susun & buat deck kartu belajar instan untuk mempermudah metode hafalan cepat konsep-konsep penting UTBK.",
    href: "/app/flash-card-generator",
    buttonText: "Pilih Penyusun Flash Card",
    icon: Layers,
  },
  {
    id: "pengatur-tutor",
    title: "Pengatur TUTOR",
    description: "Kelola sumber materi tambahan agar AI Tutor dapat menjawab pertanyaan spesifik dengan akurat.",
    href: "/app/mentor/tutor",
    buttonText: "Pilih Pengatur TUTOR",
    icon: Settings2,
  },
];

export default function MentorAreaPage() {
  const currentHref = "/app/area-mentor";
  const studentShell = useStudentShell(currentHref);

  const aiStatus = useQuery({
    queryKey: ["global-ai-credential-status"],
    queryFn: () => getGlobalAiCredentialStatus(),
  });

  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <div className="flex flex-col gap-10 w-full py-8 max-w-4xl">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Panel Pengajaran
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Area Mentor
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Selesaikan pembuatan soal, kelola materi, serta operasional try out untuk membimbing siswa.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {MENTOR_FEATURES.map((item) => {
            const Icon = item.icon;
            const isAiFeature = item.id === "penyusun-soal" || item.id === "penyusun-flashcard" || item.id === "pengatur-tutor";
            const isLocked = isAiFeature && aiStatus.data && !aiStatus.data.hasCredential;

            return (
              <div
                key={item.id}
                className={`flex flex-col border border-border rounded-lg p-5 ${
                  isLocked ? "opacity-60" : "hover:border-foreground/20 transition-colors"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5 text-foreground/70" />
                  <h3 className="font-medium text-foreground">{item.title}</h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  {item.description}
                </p>

                {isLocked ? (
                  <div className="mt-auto">
                    <p className="text-sm text-destructive mb-3 flex items-center gap-1.5">
                      <Lock className="h-4 w-4" /> Butuh Pengaturan API Key
                    </p>
                    <Link
                      className="text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground transition-colors"
                      to="/app/ai-config"
                    >
                      Atur Kredensial &rarr;
                    </Link>
                  </div>
                ) : (
                  <div className="mt-auto">
                    <Link
                      className="text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground transition-colors"
                      to={item.href}
                    >
                      {item.buttonText} &rarr;
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </ProductShell>
  );
}
