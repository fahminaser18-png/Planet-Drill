import ProductShell from "../../components/layout/product-shell";
import QuestionGeneratorReviewFlow from "../../components/question-generator/question-generator-review-flow";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";

function QuestionGeneratorReviewPage() {
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
            Tinjau hasil
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Penyusun Soal
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl">
            Periksa hasil soal sebelum dikirim ke bank soal atau sesi.
          </p>
        </div>

        <QuestionGeneratorReviewFlow />
      </div>
    </ProductShell>
  );
}

export default QuestionGeneratorReviewPage;
