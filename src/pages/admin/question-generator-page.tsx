import AdminShell from "../../components/layout/admin-shell";
import QuestionGeneratorCreateFlow from "../../components/question-generator/question-generator-create-flow";
import { createAdminNavItems } from "../../mocks/admin-content";

function QuestionGeneratorPage() {
  return (
    <AdminShell
      description="Gunakan 1-3 soal acuan, lalu cek hasilnya sebelum disimpan ke bank soal atau sesi."
      navItems={createAdminNavItems("/admin/question-generator")}
      title="Penyusun Soal"
    >
      <div className="-mx-4 sm:-mx-8 -mt-4 [&_button]:focus-visible:outline-none [&_button]:focus-visible:ring-2 [&_button]:focus-visible:ring-ring [&_button]:focus-visible:ring-offset-2 [&_input]:focus-visible:outline-none [&_input]:focus-visible:ring-2 [&_input]:focus-visible:ring-ring [&_textarea]:focus-visible:outline-none [&_textarea]:focus-visible:ring-2 [&_textarea]:focus-visible:ring-ring">
        <QuestionGeneratorCreateFlow basePath="/admin/question-generator" />
      </div>
    </AdminShell>
  );
}

export default QuestionGeneratorPage;
