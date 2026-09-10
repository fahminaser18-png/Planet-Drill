import ProductShell from "../../components/layout/product-shell";
import QuestionGeneratorCreateFlow from "../../components/question-generator/question-generator-create-flow";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";

function QuestionGeneratorPage() {
  const studentShell = useStudentShell("/app/question-generator");

  return (
    <ProductShell
      brand={productShellMeta.brand}
      navItems={studentShell.navItems}
      tierLabel={studentShell.tierLabel}
    >
      <div className="flex flex-col gap-10 w-full py-8 max-w-4xl">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">
            Fitur Mentor AI
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Penyusun Soal
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Buat draf soal latihan dari topik acuan secara otomatis, lalu review hasilnya sebelum dikirim ke bank soal.
          </p>
        </div>

        <QuestionGeneratorCreateFlow basePath="/app/question-generator" />
      </div>
    </ProductShell>
  );
}

export default QuestionGeneratorPage;
