import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";
import { Loader2 } from "lucide-react";

import AdminShell from "../../components/layout/admin-shell";
import Button from "../../components/ui/button";




import { bootstrapProfile, logout } from "../../lib/api/auth-api";
import {
  getPaymentProofPreviewUrl,
  listPaymentSubmissionsForReview,
  reviewPaymentSubmission,
  type PaymentSubmission,
} from "../../lib/api/subscription-api";
import { useSession } from "../../lib/auth/use-session";
import { createAdminNavItems, adminShellMeta } from "../../mocks/admin-content";

function PaymentsPage() {
  const { status: sessionStatus, user } = useSession();
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [actionSubmissionId, setActionSubmissionId] = useState<string | null>(null);
  const [previewSubmissionId, setPreviewSubmissionId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  function normalizeReviewMessage(message: string) {
    return message.replace(/^Submission pembayaran ini/i, "Pembayaran ini");
  }

  useEffect(() => {
    let isCancelled = false;

    async function hydrateQueue() {
      if (sessionStatus === "loading") {
        setIsLoading(true);
        return;
      }

      if (sessionStatus === "anonymous" || !user) {
        setPayments([]);
        setLoadError(null);
        setActionError(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setLoadError(null);
      setActionError(null);

      try {
        const profile = await bootstrapProfile({
          user,
        });

        if (profile.role !== "admin") {
          throw new Error("Halaman ini hanya tersedia untuk admin.");
        }

        const nextPayments = await listPaymentSubmissionsForReview();

        if (!isCancelled) {
          setPayments(nextPayments);
        }
      } catch (error) {
        if (!isCancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Daftar pembayaran belum bisa dimuat.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void hydrateQueue();

    return () => {
      isCancelled = true;
    };
  }, [sessionStatus, user]);

  async function handleOpenProof(submission: PaymentSubmission) {
    setPreviewSubmissionId(submission.id);
    setActionError(null);

    try {
      const signedUrl = await getPaymentProofPreviewUrl({
        paymentProofPath: submission.paymentProofPath,
      });

      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Bukti transfer belum bisa dibuka.",
      );
    } finally {
      setPreviewSubmissionId(null);
    }
  }

  async function handleReview(submission: PaymentSubmission, decision: "approve" | "reject") {
    if (!user) {
      return;
    }

    if (submission.status !== "pending_review") {
      setActionError("Pembayaran ini sudah direview. Muat ulang antrean untuk melihat status terbaru.");
      return;
    }

    setActionSubmissionId(submission.id);
    setFeedbackMessage(null);
    setActionError(null);

    try {
      await reviewPaymentSubmission({
        actor: {
          id: user.id,
          role: "admin",
        },
        submissionId: submission.id,
        decision,
        notes: reviewNotes[submission.id],
      });

      const nextPayments = await listPaymentSubmissionsForReview();
      setPayments(nextPayments);
      setFeedbackMessage(
        decision === "approve"
          ? "Pembayaran disetujui."
          : "Pembayaran ditolak. Minta pengguna unggah ulang jika perlu.",
      );
    } catch (error) {
      let nextActionError =
        error instanceof Error
          ? normalizeReviewMessage(error.message)
          : "Aksi review belum berhasil.";

      if (error instanceof Error && /sudah.*review/i.test(error.message)) {
        try {
          const nextPayments = await listPaymentSubmissionsForReview();
          setPayments(nextPayments);
        } catch (recoveryError) {
          nextActionError = `${normalizeReviewMessage(error.message)} Antrean terbaru juga belum berhasil dimuat. Muat ulang antrean untuk melihat status terbaru.`;

          if (!(recoveryError instanceof Error)) {
            nextActionError = `${normalizeReviewMessage(error.message)} Antrean terbaru belum berhasil dimuat. Muat ulang antrean untuk melihat status terbaru.`;
          }
        }
      }

      setActionError(nextActionError);
    } finally {
      setActionSubmissionId(null);
    }
  }

  return (
    <AdminShell
      title="Verifikasi pembayaran"
      description="Tinjau bukti transfer dan putuskan dari satu halaman."
      navItems={createAdminNavItems("/admin/payments")}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Badge variant="secondary">Menunggu review</Badge>
          <Badge variant="default">Siap diproses</Badge>
        </div>
        {user ? (
          <div className="flex items-center gap-2">

            <Button
              onClick={() => void logout()}
              size="sm"
              variant="outline"
            >
              Keluar
            </Button>
          </div>
        ) : null}
      </div>

      {feedbackMessage ? (
        <p className="mt-6 rounded-[1.2rem] border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground">
          {feedbackMessage}
        </p>
      ) : null}

      {actionError ? (
        <p
          className="mt-6 rounded-[1.2rem] border border-border bg-muted px-4 py-3 text-sm font-medium text-foreground"
          role="alert"
        >
          {actionError}
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-6 divide-y divide-border/50 border-y border-border/50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-4 px-5 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2 w-full max-w-sm">
                  <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
              </div>
              <div className="mt-2 h-24 w-full animate-pulse rounded-lg bg-muted" />
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="h-9 w-24 animate-pulse rounded bg-muted" />
                <div className="h-9 w-32 animate-pulse rounded bg-muted" />
                <div className="h-9 w-32 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <Alert variant="destructive" className="mt-6">
  <AlertTitle>Daftar pembayaran belum bisa dimuat</AlertTitle>
  <AlertDescription>{loadError}</AlertDescription>
</Alert>
      ) : payments.length === 0 ? (
        <Alert className="mt-6">
  <AlertTitle>Belum ada pembayaran</AlertTitle>
  <AlertDescription>Belum ada pembayaran baru.</AlertDescription>
</Alert>
      ) : (
        <div className="mt-6 divide-y divide-border/50 border-y border-border/50">
          {payments.map((item) => {
            const isPendingReview = item.status === "pending_review";

            return (
              <div key={item.id} className="group flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-muted/50">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        Pengguna {item.userId}
                      </p>
                      <p className="mt-1 text-sm text-foreground">
                        {item.packageCode.replaceAll("_", " ")} - dikirim{" "}
                        {new Date(item.createdAt).toLocaleString("id-ID")}
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        File bukti: {item.proofFileName ?? "Tanpa nama file"}
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        Lokasi file: {item.paymentProofPath}
                      </p>
                    </div>
                    <Badge variant={item.status === "pending_review" ? "secondary" : "default"}>
                      {item.status.replaceAll("_", " ")}
                    </Badge>
                  </div>

                  <label className="block">
                    <span className="text-sm font-semibold text-foreground">
                      Catatan
                    </span>
                    <textarea
                      className="mt-2 min-h-24 w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                      placeholder="Tambahkan catatan bila perlu."
                      value={reviewNotes[item.id] ?? ""}
                      onChange={(event) =>
                        setReviewNotes((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))
                      }
                    />
                  </label>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      loading={previewSubmissionId === item.id}
                      loadingLabel="Menyiapkan bukti..."
                      onClick={() => void handleOpenProof(item)}
                      size="sm"
                      variant="outline"
                      className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-1"
                    >
                      Lihat bukti
                    </Button>
                    <Button
                      disabled={actionSubmissionId === item.id || !isPendingReview}
                      onClick={() => void handleReview(item, "approve")}
                      size="sm"
                      variant="primary"
                      className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-offset-1"
                    >
                      {actionSubmissionId === item.id ? "Memproses..." : "Setujui pembayaran"}
                    </Button>
                    <Button
                      disabled={actionSubmissionId === item.id || !isPendingReview}
                      onClick={() => void handleReview(item, "reject")}
                      size="sm"
                      variant="destructive"
                      className="focus-visible:ring-2 focus-visible:ring-destructive focus-visible:outline-none focus-visible:ring-offset-1"
                    >
                      {actionSubmissionId === item.id ? "Memproses..." : "Tolak & minta ulang"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}

export default PaymentsPage;
