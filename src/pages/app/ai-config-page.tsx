import { useContext, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "../../components/ui/button";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import {
  deleteGlobalAiCredential,
  getGlobalAiCredentialStatus,
  saveGlobalAiCredential,
  testGlobalAiCredential,
} from "../../lib/api/global-ai-credential-api";
import { SessionContext } from "../../lib/auth/session-provider";
import ProductShell from "../../components/layout/product-shell";
import SectionHeading from "../../components/ui/section-heading";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";

export default function AiConfigPage() {
  const queryClient = useQueryClient();
  const sessionState = useContext(SessionContext);
  const storageUserId = sessionState?.user?.id?.trim() ?? "";
  
  const studentShell = useStudentShell("/app/settings/ai-config");

  const [apiKey, setApiKey] = useState("");
  const [credentialFeedback, setCredentialFeedback] = useState<string | null>(null);
  
  const statusQuery = useQuery({
    queryKey: ["global-ai-credential-status"],
    queryFn: () => getGlobalAiCredentialStatus(),
  });

  const saveCredentialMutation = useMutation({
    mutationFn: (input: { apiKey: string; model: string }) => saveGlobalAiCredential(input),
    onSuccess: (status, variables) => {
      queryClient.setQueryData(["global-ai-credential-status"], status);
      const trimmedApiKey = variables.apiKey.trim();
      setCredentialFeedback("API key berhasil disimpan ke Vault secara aman.");
      setApiKey(trimmedApiKey);
    },
    onError: (error) => {
      setCredentialFeedback(error instanceof Error ? error.message : "API key belum berhasil disimpan.");
    },
  });

  const testCredentialMutation = useMutation({
    mutationFn: () => testGlobalAiCredential(),
    onSuccess: ({ status, testResult }) => {
      queryClient.setQueryData(["global-ai-credential-status"], status);
      setCredentialFeedback(testResult.message);
    },
    onError: (error) => {
      setCredentialFeedback(error instanceof Error ? error.message : "Koneksi belum berhasil dicek.");
    },
  });

  const deleteCredentialMutation = useMutation({
    mutationFn: () => deleteGlobalAiCredential(),
    onSuccess: (status) => {
      queryClient.setQueryData(["global-ai-credential-status"], status);
      setApiKey("");
      setCredentialFeedback("API key berhasil dihapus dari sistem.");
    },
    onError: (error) => {
      setCredentialFeedback(error instanceof Error ? error.message : "API key belum berhasil dihapus.");
    },
  });

  const hasCredential = statusQuery.data?.hasCredential ?? false;
  const credentialMutationPending = saveCredentialMutation.isPending
    || testCredentialMutation.isPending
    || deleteCredentialMutation.isPending;

  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
    >
      <div className="flex flex-col gap-8 w-full py-4">
        <div className="pb-4 border-b border-border/40">
          <SectionHeading
            eyebrow="Integrasi"
            title="Pengaturan AI"
          />
        </div>

        <div className="w-full flex flex-col divide-y divide-border/40">
          <section className="py-8 grid sm:grid-cols-[1fr_2fr] gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Koneksi Supabase Vault</h3>
              <p className="text-sm text-muted-foreground">
                Kredensial disimpan secara terenkripsi.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {statusQuery.isLoading ? (
                  <div className="h-5 w-24 bg-muted animate-pulse rounded"></div>
                ) : statusQuery.data?.hasCredential ? (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Koneksi Aktif
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground font-medium">Belum Aktif</span>
                )}
              </div>

              {statusQuery.isError ? (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20 max-w-md">
                  Status koneksi belum bisa dimuat. Muat ulang lalu coba lagi.
                </div>
              ) : null}

              {!statusQuery.isLoading && statusQuery.data?.hasCredential === false ? (
                <div className="text-sm text-amber-600 dark:text-amber-400 flex items-start gap-2 bg-amber-500/10 p-3 rounded-md border border-amber-500/20 shadow-sm max-w-md transition-all duration-300">
                  <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Simpan dan tes API key sebelum menggunakan fitur AI.</span>
                </div>
              ) : null}
            </div>
          </section>

          <section className="py-8 grid sm:grid-cols-[1fr_2fr] gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">API Key Gemini</h3>
              <p className="text-sm text-muted-foreground">
                Model bawaan ditetapkan ke gemini-3.7-flash.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2 max-w-md">
                <input
                  id="gemini-api-key-input"
                  autoComplete="off"
                  className="w-full h-10 rounded border border-input bg-background px-3 text-sm text-foreground transition-all duration-200 hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  onChange={(event) => setApiKey(event.target.value)}
                  placeholder={hasCredential ? "•••••••••••••••••••••••••••• (Tersimpan)" : "Masukkan API key Gemini"}
                  type="password"
                  value={apiKey}
                />
              </div>

            {statusQuery.data?.lastValidatedAt ? (
              <p className="text-xs text-muted-foreground">
                Tervalidasi terakhir: {new Date(statusQuery.data.lastValidatedAt).toLocaleString("id-ID")}
              </p>
            ) : null}

            {statusQuery.data?.lastError ? (
              <div className="text-sm text-destructive">
                {statusQuery.data.lastError}
              </div>
            ) : null}

            {credentialFeedback ? (
              <div className="text-sm font-medium text-foreground">
                {credentialFeedback}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                disabled={!apiKey.trim() || credentialMutationPending}
                loading={saveCredentialMutation.isPending}
                loadingLabel="Menyimpan..."
                className="transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                onClick={() =>
                  saveCredentialMutation.mutate({
                    apiKey: apiKey.trim(),
                    model: "gemini-3.7-flash",
                  })}
              >
                Simpan
              </Button>
              <Button
                disabled={!hasCredential || credentialMutationPending}
                loading={testCredentialMutation.isPending}
                loadingLabel="Mengetes..."
                className="transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                onClick={() => testCredentialMutation.mutate()}
                variant="outline"
              >
                Tes Koneksi
              </Button>
              <Button
                disabled={!hasCredential || credentialMutationPending}
                loading={deleteCredentialMutation.isPending}
                loadingLabel="Menghapus..."
                onClick={() => deleteCredentialMutation.mutate()}
                variant="outline"
                className="text-destructive hover:text-destructive border-transparent hover:bg-destructive/10 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-destructive focus-visible:outline-none"
              >
                Hapus
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </ProductShell>
  );
}
