import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import FlashCardMaterialForm from "../../components/flash-cards/flash-card-material-form";
import ProductShell from "../../components/layout/product-shell";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { ShieldAlert } from "lucide-react";
import {
  createFlashCardMaterialDraft,
  processFlashCardMaterial,
} from "../../lib/api/flash-card-api";
import { getGlobalAiCredentialStatus } from "../../lib/api/global-ai-credential-api";
import { useSession } from "../../lib/auth/use-session";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";

function FlashCardGeneratorCreatePage() {
  const studentShell = useStudentShell("/app/flash-card-generator/new");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ["global-ai-credential-status"],
    queryFn: () => getGlobalAiCredentialStatus(),
  });

  async function handleSubmit(input: {
    title: string;
    academicGroup: string;
    transcriptFile: File;
    slidePdfFile: File;
  }) {
    if (!user?.id) {
      throw new Error("Mentor harus login untuk membuat materi flash card.");
    }

    if (!hasCredential) {
      setSubmissionError("Simpan dan tes API key Gemini sebelum memproses materi.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    let createdDraft;
    try {
      createdDraft = await createFlashCardMaterialDraft({
        ownerId: user.id,
        title: input.title,
        academicGroup: input.academicGroup,
        transcriptFile: input.transcriptFile,
        slidePdfFile: input.slidePdfFile,
      });
    } catch (error) {
      setSubmissionError(error instanceof Error ? error.message : "Materi flash card belum bisa dibuat.");
      setIsSubmitting(false);
      return;
    }

    try {
      await processFlashCardMaterial({
        materialId: createdDraft.materialId,
      });
    } catch (error) {
      // Log error but continue to navigation to prevent duplicate drafts
      console.error("Processing failed or timed out:", error);
    } finally {
      setIsSubmitting(false);
    }
    
    navigate(`/app/flash-card-generator/${createdDraft.materialId}`);
  }

  const hasCredential = statusQuery.data?.hasCredential ?? false;
  const isSubmitDisabled = isSubmitting || statusQuery.isLoading || !hasCredential;

  return (
    <ProductShell
      brand={productShellMeta.brand}
      navItems={studentShell.navItems}
      tierLabel={studentShell.tierLabel}
    >
      <div className="flex flex-col gap-8 py-4">
        <section className="border-b border-border/40 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Status koneksi Gemini</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Penyusun flash card menggunakan Gemini. Simpan API key sebelum materi diproses.
              </p>
            </div>
            {statusQuery.isLoading ? (
              <span className="rounded bg-secondary/50 px-3 py-1 text-sm font-medium text-muted-foreground">
                Memeriksa koneksi...
              </span>
            ) : (
              <span className="rounded bg-secondary/50 px-3 py-1 text-sm font-medium text-foreground">
                {hasCredential ? "Koneksi Gemini aktif" : "Koneksi Gemini belum aktif"}
              </span>
            )}
          </div>

          {statusQuery.isError ? (
            <div className="mt-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Status koneksi belum tersedia</AlertTitle>
                <AlertDescription>Status koneksi Gemini belum bisa dimuat. Muat ulang lalu coba lagi.</AlertDescription>
              </Alert>
            </div>
          ) : null}

          {!statusQuery.isLoading && !hasCredential ? (
            <div className="mt-6 rounded border border-amber-200 bg-amber-50 px-5 py-4 dark:border-amber-900/30 dark:bg-amber-900/10">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold">
                <ShieldAlert className="h-4 w-4" />
                Kredensial AI Belum Diatur
              </div>
              <p className="mt-2 text-sm text-amber-800 dark:text-amber-300">
                Sistem menggunakan skema Bring Your Own Key (BYOK) secara global. Anda membutuhkan kunci API Gemini untuk dapat membuat Flash Card.
              </p>
              <button
                onClick={() => navigate("/app/settings/ai-config")}
                className="mt-4 inline-flex items-center justify-center rounded bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 transition-all duration-200 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:bg-amber-900/30 dark:text-amber-200 dark:hover:bg-amber-900/50"
              >
                Atur Kredensial AI
              </button>
            </div>
          ) : null}
        </section>

        <section className="space-y-6">
          <header>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Buat materi flash card</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Materi baru tampil ke siswa setelah ditinjau dan diterbitkan.
            </p>
          </header>
          {submissionError ? <p className="text-sm text-destructive">{submissionError}</p> : null}
          <FlashCardMaterialForm isSubmitDisabled={isSubmitDisabled} isSubmitting={isSubmitting} onSubmit={handleSubmit} />
        </section>
      </div>
    </ProductShell>
  );
}

export default FlashCardGeneratorCreatePage;
