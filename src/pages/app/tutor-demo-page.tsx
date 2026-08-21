import { useEffect, useState } from "react";
import ProductShell from "../../components/layout/product-shell";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser-client";
import { LiveCallWidget } from "../../features/tutor/components/LiveCallWidget";

export default function TutorDemoPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const studentShell = useStudentShell("/app/tutor-demo");

  useEffect(() => {
    async function loadMaterials() {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('tutor_materials')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setMaterials(data);
      }
      setIsLoading(false);
    }
    loadMaterials();
  }, []);

  const combinedMaterialsText = materials.map(m => `Judul: ${m.title}\nIsi:\n${m.content_text}`).join("\n\n---\n\n");

  const mockConfig = {
    id: "tutor-session-1",
    title: "Sesi Tanya Jawab Bebas (RAG AI)",
    actorInstructions: `Gunakan referensi materi berikut untuk menjawab pertanyaan siswa. Jika tidak ada di materi, gunakan fitur Google Search Grounding untuk mencari di internet.\n\nMATERI REFERENSI:\n${combinedMaterialsText}`
  };

  return (
    <ProductShell
      brand={productShellMeta.brand}
      navItems={studentShell.navItems}
      tierLabel={studentShell.tierLabel}
    >
      <div className="flex flex-col h-[calc(100vh-4rem)] p-4 max-w-4xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Ruang AI Tutor (RAG)</h1>
          <p className="text-slate-500">Tanyakan apa saja seputar UTBK. AI akan merujuk pada {materials.length} materi yang telah diunggah atau mencari di internet.</p>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center flex-grow">
            <p>Memuat materi...</p>
          </div>
        ) : (
          <div className="flex-grow">
            {/* @ts-ignore */}
            <LiveCallWidget config={mockConfig} />
          </div>
        )}
      </div>
    </ProductShell>
  );
}
