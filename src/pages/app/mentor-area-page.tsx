import React from "react";
import { Link } from "react-router";
import {
  BookOpen,
  Sparkles,
  Layers,
  CalendarClock,
  Presentation,
  ArrowRight,
  Settings2,
  Lock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductShell from "../../components/layout/product-shell";
import SectionHeading from "../../components/ui/section-heading";
import { getButtonStyleProps } from "../../components/ui/button";
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
      <div className="flex flex-col gap-10 w-full py-4 max-w-4xl">
        <div className="pb-4 border-b border-border/40">
          <SectionHeading
            eyebrow="Panel Pengajaran"
            title="Area Mentor"
          />
        </div>

        <div className="flex flex-col border-t border-border/40 mt-4 w-full">
          {MENTOR_FEATURES.map((item) => {
            const Icon = item.icon;
            const isAiFeature = item.id === "penyusun-soal" || item.id === "penyusun-flashcard" || item.id === "pengatur-tutor";
            const isLocked = isAiFeature && aiStatus.data && !aiStatus.data.hasCredential;

            return (
              <div
                key={item.id}
                className={`group flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/40 py-8 px-4 -mx-4 rounded-xl transition-all duration-300 ease-out ${
                  isLocked ? "opacity-70 grayscale-[0.3]" : "hover:bg-muted/30 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-5">
                  <div className={`mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    isLocked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground tracking-tight transition-colors">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground max-w-xl">
                      {item.description}
                    </p>
                    
                    {isLocked && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded">
                        <Lock className="h-3.5 w-3.5" />
                        Butuh Pengaturan API Key (BYOK)
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="shrink-0 pt-2 md:pt-0 pl-16 md:pl-0">
                  {isLocked ? (
                    <Link
                      {...getButtonStyleProps({
                        variant: "outline",
                        className: "w-full md:w-auto font-medium text-destructive hover:text-destructive hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2",
                      })}
                      to="/app/settings/ai-config"
                    >
                      Atur Kredensial <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <Link
                      {...getButtonStyleProps({
                        variant: "outline",
                        className:
                          "w-full md:w-auto font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:-translate-y-0.5",
                      })}
                      to={item.href}
                    >
                      {item.buttonText} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ProductShell>
  );
}
