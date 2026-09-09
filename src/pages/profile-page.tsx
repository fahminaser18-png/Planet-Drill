import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import AdminShell from "../components/layout/admin-shell";
import ProductShell from "../components/layout/product-shell";
import { Button } from "../components/ui/button";

import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
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
        description="Kelola identitas akun, keamanan login, foto profil, dan logout di satu tempat."
        navItems={createAdminNavItems("/profile")}
      >
        <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
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
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Profil akun
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Kelola nama tampilan, password, foto profil, dan akses keluar akunmu.
          </p>
        </header>
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
        <div className="flex flex-col items-center justify-center space-y-4 py-16 text-center text-muted-foreground border rounded-2xl bg-card/60 shadow-xs backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <h3 className="text-lg font-bold text-foreground">Memuat profil akun</h3>
            <p className="text-sm">Profil akun sedang dimuat.</p>
          </div>
        </div>
      ) : loadError ? (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Profil akun belum bisa dimuat</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          {/* Identity Card */}
          <Card className="border-border/80 bg-card p-6 shadow-xs h-fit space-y-6">
            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row items-center gap-5 pt-2">
                <div className="relative group">
                  {avatarPreviewUrl ? (
                    <img
                      alt="Preview foto profil"
                      className="h-24 w-24 rounded-2xl object-cover border-2 border-primary/20 shadow-xs transition-all group-hover:border-primary/40"
                      src={avatarPreviewUrl}
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary/10 border-2 border-primary/20 text-3xl font-extrabold text-primary shadow-xs">
                      {avatarInitials || "PA"}
                    </div>
                  )}
                </div>

                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-extrabold tracking-tight text-foreground">Profil akun</h2>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    Kelola nama, password, foto profil, dan logout akunmu.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-border/80 bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary shrink-0" />
                <p className="text-sm font-bold text-foreground">{profile?.fullName ?? "Nama belum diisi"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-xs text-muted-foreground font-mono">
                  {profile?.email ?? user?.email ?? "-"}
                </p>
              </div>
              <div className="pt-1">
                <Badge variant="outline" className="text-amber-800 border-amber-700/30 bg-amber-500/20 dark:text-amber-400 dark:border-amber-400/30 dark:bg-amber-400/10 text-xs font-bold px-2.5 py-0.5">
                  {roleLabel}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-border/40">
              <Label className="text-xs font-bold text-foreground block">
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
                      className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 transition-all hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                        avatarPreviewUrl === url || profile?.avatarUrl === url
                          ? "border-primary shadow-sm"
                          : "border-transparent opacity-70"
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
              <p className="text-[11px] text-muted-foreground leading-normal">
                Pilih salah satu karakter di atas untuk dijadikan foto profilmu.
              </p>
              {avatarError ? (
                <Alert variant="destructive" className="border-destructive/50 bg-destructive/5 text-xs">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{avatarError}</AlertDescription>
                </Alert>
              ) : null}
              {avatarSuccess ? (
                <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-700 text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>{avatarSuccess}</AlertDescription>
                </Alert>
              ) : null}
            </div>
          </Card>

          {/* Form Cards Column */}
          <div className="grid gap-6">
            {/* Display Name Card */}
            <Card className="border-border/80 bg-card p-6 shadow-xs space-y-4">
              <CardHeader className="p-0 space-y-1">
                <CardTitle className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Nama
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Nama ini akan tampil di profil akunmu.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-2 space-y-4">
                <form className="space-y-4" onSubmit={handleDisplayNameSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="profile-display-name" className="text-xs font-bold text-foreground">
                      Nama
                    </Label>
                    <Input
                      disabled={isSavingName}
                      id="profile-display-name"
                      name="displayName"
                      type="text"
                      className="rounded-xl"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                    />
                  </div>
                  <Button
                    loading={isSavingName}
                    loadingLabel="Menyimpan nama..."
                    type="submit"
                    variant="primary"
                    className="h-9 px-4 text-xs font-bold cursor-pointer"
                  >
                    Simpan nama
                  </Button>
                </form>
                {nameError ? (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/5 text-xs">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{nameError}</AlertDescription>
                  </Alert>
                ) : null}
                {nameSuccess ? (
                  <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-700 text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{nameSuccess}</AlertDescription>
                  </Alert>
                ) : null}
              </CardContent>
            </Card>


            {/* Change Password Card */}
            <Card className="border-border/80 bg-card p-6 shadow-xs space-y-4">
              <CardHeader className="p-0 space-y-1">
                <CardTitle className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Ganti password
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Masukkan password saat ini dulu sebelum menyimpan password baru.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-2 space-y-4">
                <form className="space-y-4" onSubmit={handlePasswordSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="profile-current-password" className="text-xs font-bold text-foreground">
                      Password saat ini
                    </Label>
                    <Input
                      disabled={isSavingPassword}
                      id="profile-current-password"
                      name="currentPassword"
                      type="password"
                      className="rounded-xl"
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-next-password" className="text-xs font-bold text-foreground">
                      Password baru
                    </Label>
                    <Input
                      disabled={isSavingPassword}
                      id="profile-next-password"
                      name="nextPassword"
                      type="password"
                      className="rounded-xl"
                      value={nextPassword}
                      onChange={(event) => setNextPassword(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-confirm-password" className="text-xs font-bold text-foreground">
                      Konfirmasi password baru
                    </Label>
                    <Input
                      disabled={isSavingPassword}
                      id="profile-confirm-password"
                      name="confirmPassword"
                      type="password"
                      className="rounded-xl"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                    />
                  </div>
                  <Button
                    loading={isSavingPassword}
                    loadingLabel="Menyimpan password..."
                    type="submit"
                    variant="primary"
                    className="h-9 px-4 text-xs font-bold cursor-pointer"
                  >
                    Ganti password
                  </Button>
                </form>
                {passwordError ? (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/5 text-xs">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{passwordError}</AlertDescription>
                  </Alert>
                ) : null}
                {passwordSuccess ? (
                  <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-700 text-xs">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>{passwordSuccess}</AlertDescription>
                  </Alert>
                ) : null}
              </CardContent>
            </Card>

            {/* Danger Zone / Logout Card */}
            <Card className="border-destructive/30 bg-destructive/5 p-6 shadow-xs space-y-4">
              <CardHeader className="p-0 space-y-1">
                <CardTitle className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-destructive" />
                  Logout
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Keluar dari sesi saat ini jika perangkat ini bukan milikmu atau sesi sudah selesai.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 pt-2 flex items-center gap-3">

                <Button
                  loading={isLoggingOut}
                  loadingLabel="Memproses logout..."
                  type="button"
                  variant="destructive"
                  className="h-9 px-4 text-xs font-bold cursor-pointer"
                  onClick={() => void handleLogout()}
                >
                  Logout sekarang
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      )}
    </ProfileSurface>
  );
}

export default ProfilePage;
