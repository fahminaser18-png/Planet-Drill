import { useNavigate } from "react-router";
import ProductShell from "../../components/layout/product-shell";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { MaterialUploaderForm } from "../../features/tutor/components/MaterialUploaderForm";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function TutorBuilderPage() {
  const navigate = useNavigate();
  const studentShell = useStudentShell("/app/area-mentor");

  return (
    <ProductShell
      brand={productShellMeta.brand}
      tierLabel={studentShell.tierLabel}
      navItems={studentShell.navItems}
      disablePadding
    >
      <div className="flex flex-col gap-10 w-full py-8 max-w-4xl">
        <div className="flex flex-col gap-2">
          <div className="flex items-center mb-2">
            <button
              type="button"
              onClick={() => navigate("/app/mentor/tutor")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
            >
              <ArrowLeft size={16} /> Kembali ke Daftar Sumber
            </button>
          </div>
          
          <h1 className="text-3xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <BookOpen className="h-7 w-7 text-foreground/70" />
            Knowledge Base AI Tutor
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Unggah materi dan dokumen referensi untuk memperkaya pengetahuan AI Tutor.
          </p>
        </div>

        <div className="w-full">
          <MaterialUploaderForm />
        </div>
      </div>
    </ProductShell>
  );
}
