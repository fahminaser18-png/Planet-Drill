import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import Button from "../ui/button";
import { checkOnboardingStatus, submitOnboardingData } from "../../lib/api/onboarding-api";
import { useSession } from "../../lib/auth/use-session";
import { Rocket } from "lucide-react";

const REFERRAL_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "facebook", label: "Facebook" },
  { value: "teman", label: "Teman" },
  { value: "guru", label: "Guru" },
  { value: "google", label: "Pencarian Google" },
  { value: "lainnya", label: "Lainnya" },
] as const;

export function OnboardingModal() {
  const { user } = useSession();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [referralOther, setReferralOther] = useState("");
  const [error, setError] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: () => checkOnboardingStatus(),
    enabled: !!user,
    staleTime: Infinity,
  });

  const submitMutation = useMutation({
    mutationFn: (data: {
      userId: string;
      fullName: string;
      schoolName: string;
      phoneNumber: string;
      referralSource: string;
    }) => submitOnboardingData(data),
    onSuccess: () => {
      queryClient.setQueryData(["onboarding-status"], true);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Coba lagi.");
    },
  });

  const isOpen = statusQuery.isSuccess && statusQuery.data === false;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Nama lengkap harus diisi.");
      return;
    }
    if (!schoolName.trim()) {
      setError("Asal sekolah harus diisi.");
      return;
    }
    if (!phoneNumber.trim()) {
      setError("Nomor HP harus diisi.");
      return;
    }
    if (!referralSource) {
      setError("Pilih salah satu sumber informasi.");
      return;
    }
    if (referralSource === "lainnya" && !referralOther.trim()) {
      setError("Tulis sumber informasi kamu.");
      return;
    }

    const finalReferral = referralSource === "lainnya"
      ? `Lainnya: ${referralOther.trim()}`
      : REFERRAL_OPTIONS.find(o => o.value === referralSource)?.label ?? referralSource;

    submitMutation.mutate({
      userId: user!.id,
      fullName: fullName.trim(),
      schoolName: schoolName.trim(),
      phoneNumber: phoneNumber.trim(),
      referralSource: finalReferral,
    });
  }

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open modal>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Lengkapi Profilmu
              </DialogTitle>
              <DialogDescription>
                Satu langkah lagi sebelum memulai perjalanan UTBK.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="onboarding-name" className="text-sm font-medium">
              Nama Lengkap
            </Label>
            <Input
              id="onboarding-name"
              placeholder="Masukkan nama lengkapmu"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-11"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboarding-school" className="text-sm font-medium">
              Asal Sekolah
            </Label>
            <Input
              id="onboarding-school"
              placeholder="Contoh: SMAN 1 Jakarta"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="onboarding-phone" className="text-sm font-medium">
              Nomor HP
            </Label>
            <Input
              id="onboarding-phone"
              placeholder="08xxxxxxxxxx"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Dari mana kamu menemukan Planet Drill?
            </Label>
            <div className="flex flex-wrap gap-2">
              {REFERRAL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setReferralSource(option.value);
                    if (option.value !== "lainnya") {
                      setReferralOther("");
                    }
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium border transition-all duration-200 ${
                    referralSource === option.value
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {referralSource === "lainnya" ? (
              <Input
                placeholder="Tulis dari mana kamu tahu..."
                value={referralOther}
                onChange={(e) => setReferralOther(e.target.value)}
                className="h-11 mt-2"
                autoFocus
              />
            ) : null}
          </div>

          {error ? (
            <p className="text-sm text-destructive font-medium">{error}</p>
          ) : null}

          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={submitMutation.isPending}
            loadingLabel="Menyimpan..."
            className="h-12 font-semibold"
          >
            Mulai Belajar
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
