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
      <div className="flex flex-col gap-6 w-full h-full p-4 md:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/40">
          <div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/app/mentor/tutor")}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft size={14} /> Kembali ke Daftar Sumber
              </button>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                  Knowledge Base AI Tutor
                </h1>
                <p className="text-sm text-muted-foreground">
                  Unggah materi dan dokumen referensi untuk memperkaya pengetahuan AI Tutor (RAG).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="w-full">
          <MaterialUploaderForm />
        </div>
      </div>
    </ProductShell>
  );
}
