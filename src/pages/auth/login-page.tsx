import { ArrowRight, Info, Lock, Send, UserCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Button from "../../components/ui/button";
import { loginWithPassword, requestPasswordReset } from "../../lib/api/auth-api";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Alert, AlertDescription } from "../../components/ui/alert";
import { Badge } from "../../components/ui/badge";

function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [isRegister, setIsRegister] = useState(searchParams.get("view") === "register");

  useEffect(() => {
    setIsRegister(searchParams.get("view") === "register");
  }, [searchParams]);

  const fieldClassName = "h-12 bg-background border-border focus-visible:ring-primary";

  async function handleForgotPassword() {
    if (!email) {
      setErrorMessage("Silakan masukkan email Anda terlebih dahulu.");
      return;
    }
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsResettingPassword(true);
    try {
      await requestPasswordReset({ email });
      setSuccessMessage("Email verifikasi/lupa password telah dikirim. Silakan cek inbox Anda.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gagal mengirim email verifikasi.");
    } finally {
      setIsResettingPassword(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        const { registerWithPassword } = await import("../../lib/api/auth-api");
        await registerWithPassword({ email, password });
        setSuccessMessage("Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi.");
        // We do not redirect here because email confirmation might be required
      } else {
        await loginWithPassword({ email, password });
        navigate("/app/tryout-selection", { replace: true });
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Proses belum berhasil. Coba lagi sebentar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex w-full bg-background font-sans">
      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Badge variant="secondary" className="w-fit flex items-center gap-1.5 bg-primary/10 text-primary hover:bg-primary/20">
              <UserCircle className="w-4 h-4" /> {isRegister ? "Daftar Akun Baru" : "Masuk akun"}
            </Badge>
            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-foreground font-display">
              {isRegister ? "Mulai Perjalananmu" : "Selamat Datang"}
            </h1>
            <p className="mt-3 text-base text-muted-foreground leading-relaxed">
              {isRegister ? "Silakan masukkan email dan kata sandi untuk mendaftar" : "Silakan masukkan email dan kata sandi Anda untuk lanjut"}
            </p>
          </div>


          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-foreground font-medium">
                Email
              </Label>
              <Input
                id="login-email"
                name="email"
                placeholder="pawang@gmail.com"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={fieldClassName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-foreground font-medium">
                Kata sandi
              </Label>
              <Input
                id="login-password"
                name="password"
                placeholder="Masukkan kata sandi"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={fieldClassName}
              />
              {!isRegister && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isResettingPassword}
                    className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-primary hover:text-primary/80 hover:underline transition-all py-1.5 px-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {isResettingPassword ? "Mengirim..." : "Lupa password"}
                  </button>
                </div>
              )}
            </div>

            <Button
              fullWidth
              leadingIcon={<Lock className="w-4 h-4" />}
              loading={isSubmitting}
              loadingLabel={isRegister ? "Mendaftar..." : "Memproses masuk..."}
              size="lg"
              trailingIcon={<ArrowRight className="w-4 h-4" />}
              type="submit"
              variant="primary"
              className="h-12 bg-primary hover:bg-primary/90 text-primary-foreground border-transparent font-semibold shadow-sm"
            >
              {isRegister ? "Daftar dengan email" : "Masuk dengan email"}
            </Button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">
                  Atau
                </span>
              </div>
            </div>

            <Button
              fullWidth
              variant="outline"
              size="lg"
              type="button"
              className="h-12 border-border shadow-sm text-foreground bg-background hover:bg-muted"
              onClick={async (e) => {
                e.preventDefault();
                try {
                  const { loginWithGoogle } = await import("../../lib/api/auth-api");
                  await loginWithGoogle();
                } catch (error) {
                  setErrorMessage(error instanceof Error ? error.message : "Gagal dengan Google.");
                }
              }}
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 mr-3" alt="Google" />
              Lanjutkan dengan Google
            </Button>
            {errorMessage ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            ) : null}
            {successMessage ? (
              <Alert className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            ) : null}

            <div className="mt-4 text-center text-sm text-muted-foreground">
              {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className="font-bold text-primary hover:underline hover:text-primary/80 transition-colors"
              >
                {isRegister ? "Masuk di sini" : "Daftar di sini"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side: Cyan Gradient */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center relative overflow-hidden">
        {/* Soft lighting effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.25),_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_rgba(0,0,0,0.15),_transparent_50%)]" />
        
        {/* Elegant Abstract Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        
        <div className="relative z-10 text-primary-foreground max-w-2xl p-12 text-center flex flex-col items-center">
          <div className="w-[336px] h-[336px] mb-8 rounded-full shadow-2xl shrink-0 overflow-hidden">
            <img
              src="/logo.jpg"
              alt="Logo Planet Drill UTBK"
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-5xl font-bold mb-6 font-display tracking-tight text-white shadow-sm">Planet Drill UTBK</h2>
          <p className="text-lg opacity-95 font-sans font-medium leading-relaxed text-white/90 whitespace-nowrap">
            Platform belajar terpadu untuk persiapan UTBK SNBT
          </p>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
