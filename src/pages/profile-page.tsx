import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import AdminShell from "../components/layout/admin-shell";
import ProductShell from "../components/layout/product-shell";
import { Button } from "../components/ui/button";
import SectionHeading from "../components/ui/section-heading";

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Loader2, User, Trophy, Lock, LogOut, Upload, ShieldCheck, AlertCircle, CheckCircle2, Sparkles, Mail, UserCheck } from "lucide-react";
import { logout } from "../lib/api/auth-api";
import {
  getCurrentProfile,
  getProfileAvatarSignedUrl,
  
  updateCurrentProfileName,
  updateCurrentUserPassword,
  updateCurrentUserAvatarUrl,
} from "../lib/api/profile-api";
import { useSession } from "../lib/auth/use-session";
import { adminShellMeta, createAdminNavItems } from "../mocks/admin-content";
import {
  createProductNavItems,
  productShellMeta,
  resolveStudentTierLabel,
} from "../mocks/student-dashboard";
import { useWindowFocusRefresh } from "../lib/use-window-focus-refresh";

const maxAvatarBytes = 2 * 1024 * 1024;

function resolveRoleLabel(role: string | null | undefined) {
  if (role === "admin") {
    return "Admin";
  }

  if (role === "mentor") {
    return "Mentor";
  }

  if (role === "pro") {
    return "Pro";
  }

  return "Pendaftar baru";
}

function ProfileSurface({
  children,
  role,
}: {
  children: ReactNode;
  role: string | null | undefined;
}) {
  if (role === "admin") {
    return (
      <AdminShell
        title="Profil akun"
        navItems={createAdminNavItems("/profile")}
      >
        <div className="flex flex-col gap-8 w-full py-4">
          {children}
        </div>
      </AdminShell>
    );
  }

  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={resolveStudentTierLabel(role as any)}
      navItems={createProductNavItems("/profile", role as any)}
    >
      <div className="flex flex-col gap-8 w-full py-4">
        <div className="pb-4 border-b border-border/40">
          <SectionHeading
            eyebrow="Profil Pengguna"
            title="Profil akun"
          />
        </div>
        {children}
      </div>
    </ProductShell>
  );
}

function ProfilePage() {
  const { user } = useSession();
  const refreshVersion = useWindowFocusRefresh({
    enabled: Boolean(user),
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof getCurrentProfile>> | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameSuccess, setNameSuccess] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [avatarSuccess, setAvatarSuccess] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [surfaceRole, setSurfaceRole] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function hydrateProfile() {
      if (!user) {
        setLoadError("Sesi akun tidak ditemukan.");
        setIsLoadingProfile(false);
        return;
      }

      setIsLoadingProfile(true);
      setLoadError(null);

      try {
        const nextProfile = await getCurrentProfile();

        if (isCancelled) {
          return;
        }

        setProfile(nextProfile);
        setDisplayName(nextProfile.fullName ?? "");

        if (nextProfile.avatarUrl) {
          try {
            const signedUrl = await getProfileAvatarSignedUrl({
              avatarPath: nextProfile.avatarUrl,
            });

            if (!isCancelled) {
              setAvatarPreviewUrl(signedUrl);
            }
          } catch {
            if (!isCancelled) {
              setAvatarPreviewUrl(null);
            }
          }
        } else {
          setAvatarPreviewUrl(null);
        }
      } catch (error) {
        if (!isCancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Profil akun belum bisa dimuat.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingProfile(false);
        }
      }
    }

    void hydrateProfile();

    return () => {
      isCancelled = true;
    };
  }, [refreshVersion, user]);

  useEffect(() => {
    if (profile?.role) {
      setSurfaceRole(profile.role);
    }
  }, [profile?.role]);

  async function handleDisplayNameSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameError(null);
    setNameSuccess(null);

    if (!user) {
      setNameError("Sesi akun tidak ditemukan.");
      return;
    }

    const trimmedName = displayName.trim();

    if (!trimmedName) {
      setNameError("Nama tampilan tidak boleh kosong.");
      return;
    }

    setIsSavingName(true);

    try {
      await updateCurrentProfileName({
        userId: user.id,
        fullName: trimmedName,
      });
      setDisplayName(trimmedName);
      setProfile((currentProfile) =>
        currentProfile
          ? {
            ...currentProfile,
            fullName: trimmedName,
          }
          : currentProfile,
      );
      setNameSuccess("Nama tampilan berhasil diperbarui.");
    } catch (error) {
      setNameError(
        error instanceof Error
          ? error.message
          : "Nama tampilan belum bisa diperbarui.",
      );
    } finally {
      setIsSavingName(false);
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !nextPassword || !confirmPassword) {
      setPasswordError("Lengkapi semua field password terlebih dahulu.");
      return;
    }

    if (nextPassword.length < 8) {
      setPasswordError("Password baru minimal 8 karakter.");
      return;
    }

    if (nextPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password belum cocok.");
      return;
    }

    setIsSavingPassword(true);

    try {
      await updateCurrentUserPassword({
        currentPassword,
        nextPassword,
      });
      setCurrentPassword("");
      setNextPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Kata sandi berhasil diubah.");
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Password belum bisa diganti.",
      );
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function handleAvatarSelect(avatarUrl: string) {
    setAvatarError(null);
    setAvatarSuccess(null);

    if (!user) {
      setAvatarError("Sesi akun tidak ditemukan.");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const result = await updateCurrentUserAvatarUrl({
        userId: user.id,
        avatarUrl,
      });
      setProfile((currentProfile) =>
        currentProfile
          ? {
            ...currentProfile,
            avatarUrl: result.avatarUrl,
          }
          : currentProfile,
      );
      setAvatarPreviewUrl(result.avatarUrl);
      setAvatarSuccess("Foto profil berhasil diperbarui.");
    } catch (error) {
      setAvatarError(
        error instanceof Error
          ? error.message
          : "Foto profil belum bisa diperbarui.",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  const role = profile?.role ?? surfaceRole;
  const roleLabel = resolveRoleLabel(role);
  const avatarInitials = (profile?.fullName ?? user?.email ?? "PA")
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <ProfileSurface role={role}>
      {isLoadingProfile ? (
        <div className="w-full flex flex-col divide-y divide-border/40 animate-pulse">
          <div className="py-8 space-y-6">
            <div className="flex items-center gap-5">
              <div className="h-20 w-20 rounded-full bg-muted"></div>
              <div className="space-y-3">
                <div className="h-5 w-40 bg-muted rounded"></div>
                <div className="h-4 w-32 bg-muted rounded"></div>
                <div className="h-5 w-16 bg-muted rounded mt-2"></div>
              </div>
            </div>
            <div className="space-y-3 pt-4">
              <div className="h-4 w-32 bg-muted rounded"></div>
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-12 w-12 rounded-full bg-muted"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="py-8 grid sm:grid-cols-[1fr_2fr] gap-6">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded"></div>
              <div className="h-4 w-48 bg-muted rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-10 max-w-md bg-muted rounded"></div>
              <div className="h-10 w-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      ) : loadError ? (
        <div className="w-full py-8">
          <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-4 flex gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm">Profil akun belum bisa dimuat</h3>
              <p className="text-sm mt-1 opacity-90">{loadError}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col divide-y divide-border/40">
          {/* Profile Identity & Avatar Section */}
          <section className="py-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative group shrink-0">
                  {avatarPreviewUrl ? (
                    <img
                      alt="Preview foto profil"
                      className="h-20 w-20 rounded-full object-cover ring-1 ring-border shadow-sm transition-all group-hover:ring-primary/40"
                      src={avatarPreviewUrl}
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted ring-1 ring-border text-2xl font-medium text-foreground shadow-sm">
                      {avatarInitials || "PA"}
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-semibold text-foreground tracking-tight">{profile?.fullName ?? "Nama belum diisi"}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {profile?.email ?? user?.email ?? "-"}
                    </p>
                    <Badge variant="secondary" className="w-fit text-[10px] font-semibold px-1.5 py-0 uppercase tracking-wider">
                      {roleLabel}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Label className="text-sm font-medium text-foreground block">
                Pilih foto profil
              </Label>
              <div className="flex flex-wrap gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const url = `/avatars/avatar-${num}.jpg`;
                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={isUploadingAvatar}
                      onClick={() => void handleAvatarSelect(url)}
                      className={`relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-background transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-primary ${
                        avatarPreviewUrl === url || profile?.avatarUrl === url
                          ? "ring-primary"
                          : "ring-transparent opacity-70 hover:ring-border/50"
                      }`}
                    >
                      <img
                        alt={`Avatar ${num}`}
                        src={url}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-sm text-muted-foreground">
                Pilih salah satu karakter di atas untuk dijadikan foto profilmu.
              </p>
              {avatarError && (
                <div className="text-sm text-destructive flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{avatarError}</span>
                </div>
              )}
              {avatarSuccess && (
                <div className="text-sm text-emerald-600 dark:text-emerald-500 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{avatarSuccess}</span>
                </div>
              )}
            </div>
          </section>

          {/* Display Name Section */}
          <section className="py-8 grid sm:grid-cols-[1fr_2fr] gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Nama Tampilan</h3>
              <p className="text-sm text-muted-foreground">
                Nama ini akan tampil di profil akunmu.
              </p>
            </div>
            <div className="space-y-4">
              <form className="space-y-4 max-w-md" onSubmit={handleDisplayNameSubmit}>
                <div className="space-y-2">
                  <Input
                    disabled={isSavingName}
                    id="profile-display-name"
                    name="displayName"
                    type="text"
                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    loading={isSavingName}
                    loadingLabel="Menyimpan..."
                    type="submit"
                    variant="default"
                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Simpan nama
                  </Button>
                  {nameSuccess && (
                    <span className="text-sm text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Disimpan
                    </span>
                  )}
                </div>
              </form>
              {nameError && (
                <div className="text-sm text-destructive flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{nameError}</span>
                </div>
              )}
            </div>
          </section>

          {/* Change Password Section */}
          <section className="py-8 grid sm:grid-cols-[1fr_2fr] gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Ganti Password</h3>
              <p className="text-sm text-muted-foreground">
                Pastikan menggunakan password yang kuat dan aman.
              </p>
            </div>
            <div className="space-y-4">
              <form className="space-y-4 max-w-md" onSubmit={handlePasswordSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="profile-current-password" className="text-sm font-medium">Password saat ini</Label>
                  <Input
                    disabled={isSavingPassword}
                    id="profile-current-password"
                    name="currentPassword"
                    type="password"
                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-next-password" className="text-sm font-medium">Password baru</Label>
                  <Input
                    disabled={isSavingPassword}
                    id="profile-next-password"
                    name="nextPassword"
                    type="password"
                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                    value={nextPassword}
                    onChange={(event) => setNextPassword(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-confirm-password" className="text-sm font-medium">Konfirmasi password baru</Label>
                  <Input
                    disabled={isSavingPassword}
                    id="profile-confirm-password"
                    name="confirmPassword"
                    type="password"
                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    loading={isSavingPassword}
                    loadingLabel="Menyimpan..."
                    type="submit"
                    variant="default"
                    className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    Perbarui password
                  </Button>
                  {passwordSuccess && (
                    <span className="text-sm text-emerald-600 dark:text-emerald-500 flex items-center gap-1.5 animate-in fade-in slide-in-from-left-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Diperbarui
                    </span>
                  )}
                </div>
              </form>
              {passwordError && (
                <div className="text-sm text-destructive flex items-center gap-2 animate-in fade-in slide-in-from-bottom-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{passwordError}</span>
                </div>
              )}
            </div>
          </section>

          {/* Danger Zone / Logout Section */}
          <section className="py-8 grid sm:grid-cols-[1fr_2fr] gap-6">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-destructive">Logout Akun</h3>
              <p className="text-sm text-muted-foreground">
                Keluar dari sesi saat ini jika perangkat ini bukan milikmu.
              </p>
            </div>
            <div>
              <Button
                loading={isLoggingOut}
                loadingLabel="Memproses..."
                type="button"
                variant="destructive"
                className="focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                onClick={() => void handleLogout()}
              >
                Logout sekarang
              </Button>
            </div>
          </section>
        </div>
      )}
    </ProfileSurface>
  );
}

export default ProfilePage;
