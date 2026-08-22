import { useEffect, useState } from "react";
import ProductShell from "../../components/layout/product-shell";
import { productShellMeta } from "../../mocks/student-dashboard";
import { useStudentShell } from "./use-student-shell";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser-client";
import { LiveCallWidget } from "../../features/tutor/components/LiveCallWidget";

export default function TutorDemoPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const studentShell = useStudentShell("/app/tutor-demo");

  useEffect(() => {
    async function loadData() {
      const supabase = getSupabaseBrowserClient();
      
      // Fetch Materials
      const { data: materialsData, error: materialsError } = await supabase
        .from('tutor_materials')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!materialsError && materialsData) {
        setMaterials(materialsData);
      }

      // Fetch Exam Results
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        // Get the latest 3 diagnostic snapshots
        const { data: snapshots } = await supabase
          .from('attempt_diagnostic_snapshots')
          .select(`
            id,
            overall_accuracy,
            submitted_at,
            attempt_diagnostic_topic_snapshots (
              topic_name,
              accuracy
            )
          `)
          .eq('user_id', userData.user.id)
          .order('submitted_at', { ascending: false })
          .limit(3);

        if (snapshots && snapshots.length > 0) {
          let resultsText = "DATA KEMAMPUAN SISWA (Berdasarkan ujian sebelumnya):\n";
          snapshots.forEach((snap: any, index: number) => {
            resultsText += `\nUjian ${index + 1} (${new Date(snap.submitted_at).toLocaleDateString()}):\n`;
            resultsText += `- Akurasi Total: ${snap.overall_accuracy}%\n`;
            if (snap.attempt_diagnostic_topic_snapshots) {
              snap.attempt_diagnostic_topic_snapshots.forEach((topic: any) => {
                resultsText += `  * ${topic.topic_name}: ${topic.accuracy}%\n`;
              });
            }
          });
          setExamResults(resultsText);
        } else {
          setExamResults("DATA KEMAMPUAN SISWA: Belum ada data ujian.");
        }
      }

      setIsLoading(false);
    }
    loadData();
  }, []);

  const combinedMaterialsText = materials.map(m => `Judul: ${m.title}\nIsi:\n${m.content_text}`).join("\n\n---\n\n");

  const mockConfig = {
    id: "tutor-session-1",
    title: "Sesi Tanya Jawab Bebas (RAG AI)",
    actorInstructions: `Gunakan referensi materi berikut untuk menjawab pertanyaan siswa. Jika tidak ada di materi, gunakan fitur Google Search Grounding untuk mencari di internet. SESUAIKAN GAYA BAHASA PENJELASAN DENGAN KEMAMPUAN SISWA (berdasarkan data ujian).\n\n${examResults}\n\nMATERI REFERENSI:\n${combinedMaterialsText}`
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
            <p>Memuat materi & data siswa...</p>
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
