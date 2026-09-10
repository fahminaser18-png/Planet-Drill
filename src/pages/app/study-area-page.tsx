import React, { useState } from "react";
import { Link } from "react-router";
import { PaywallModal } from "../../components/layout/paywall-gate";
import {
  Video,
  Presentation,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Lock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import ProductShell from "../../components/layout/product-shell";
import SectionHeading from "../../components/ui/section-heading";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { getButtonStyleProps } from "../../components/ui/button";
import { getGlobalAiCredentialStatus } from "../../lib/api/global-ai-credential-api";

interface StudyFeatureCard {
  id: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STUDY_FEATURES: StudyFeatureCard[] = [
  {
    id: "materi",
    title: "Materi",
    description: "Pelajari modul materi pembelajaran, PDF ringkasan, dan presentasi pembahasan.",
    href: "/app/materi-ppt?mode=student",
    buttonText: "Pilih Materi",
    icon: Presentation,
  },
  {
    id: "flash-card",
    title: "Flash Card",
    description: "Ulang dan kuasai poin-poin penting materi dan konsep-konsep krusial UTBK dengan kartu belajar singkat.",
    href: "/app/flash-cards",
    buttonText: "Pilih Flash Card",
    icon: Sparkles,
  },
  {
    id: "tutor-simulator",
    title: "Simulasi TUTOR",
    description: "Latih kemampuan pemahaman konsep dan strategi menyelesaikan soal melalui simulasi interaktif bersama AI Tutor.",
    href: "/app/tutor-demo",
    buttonText: "Mulai Simulasi TUTOR",
    icon: Stethoscope,
  },
];

export default function StudyAreaPage() {
  const currentHref = "/app/area-belajar";
  const studentShell = useStudentShell(currentHref);
  const [showPaywall, setShowPaywall] = useState(false);

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
      <div className="flex flex-col gap-8 w-full py-4">
        {/* Header Section */}
        <div className="pb-4 border-b border-border/40">
          <SectionHeading
            eyebrow="Pusat Materi"
            title="Area Belajar"
            description="Selesaikan materi pembelajaran, pemahaman konsep, dan kartu belajar untuk memperkuat persiapan UTBK-mu."
          />
        </div>

        <div className="flex flex-col border-t border-border/40 mt-4 w-full">
          {STUDY_FEATURES.map((item) => {

            const Icon = item.icon;
            const isAiFeature = item.id === "flash-card" || item.id === "tutor-simulator";
            
            let lockReason: "premium" | "api_key" | null = null;
            if (studentShell.role === "pendaftar_baru") {
              lockReason = "premium";
            } else if (isAiFeature && aiStatus.data && !aiStatus.data.hasCredential) {
              lockReason = "api_key";
            }
            
            const isLocked = lockReason !== null;

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
                    <h2 className="text-xl font-semibold text-foreground tracking-tight group-hover:text-primary transition-colors">
                      {item.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground max-w-xl">
                      {item.description}
                    </p>
                    
                    {lockReason === "api_key" && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-destructive bg-destructive/10 px-2.5 py-1 rounded">
                        <Lock className="h-3.5 w-3.5" />
                        Butuh Pengaturan API Key (BYOK)
                      </div>
                    )}
                    {lockReason === "premium" && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded">
                        <Lock className="h-3.5 w-3.5" />
                        Fitur Premium
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="shrink-0 pt-2 md:pt-0 pl-16 md:pl-0">
                  {lockReason === "premium" ? (
                    <button
                      {...getButtonStyleProps({
                        variant: "secondary",
                        className: "font-medium hover:bg-muted hover:text-foreground text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      })}
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPaywall(true);
                      }}
                    >
                      {item.buttonText} <Lock className="ml-1.5 h-3.5 w-3.5" />
                    </button>
                  ) : lockReason === "api_key" ? (
                    <div
                      {...getButtonStyleProps({
                        variant: "secondary",
                        className: "font-medium opacity-50 cursor-not-allowed",
                      })}
                    >
                      {item.buttonText} <Lock className="ml-1.5 h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <Link
                      {...getButtonStyleProps({
                        variant: "secondary",
                        className:
                          "font-medium group-hover:bg-primary group-hover:text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
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
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </ProductShell>
  );
}
