import { useState, useRef } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabase/browser-client';
import { extractTextFromPDF } from '../../../lib/pdf-extractor';
import { toast } from 'sonner';
import { FileText, UploadCloud, Loader2 } from 'lucide-react';

export function MaterialUploaderForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Hanya mendukung file PDF saat ini.');
      return;
    }

    if (!title) {
      setTitle(file.name.replace('.pdf', ''));
    }

    setIsLoading(true);
    try {
      const extractedMarkdown = await extractTextFromPDF(file, (msg) => {
        setProgressMsg(msg);
      });
      setContent(extractedMarkdown);
      toast.success('PDF berhasil diekstrak! Silakan tinjau teks di bawah sebelum menyimpan.');
    } catch (error: any) {
      toast.error(error.message || 'Gagal memproses PDF');
    } finally {
      setIsLoading(false);
      setProgressMsg('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setProgressMsg('Menyimpan ke database...');
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('tutor_materials').insert({ title, content_text: content });
    
    if (error) {
      toast.error('Gagal menyimpan sumber materi');
    } else {
      toast.success('Sumber materi berhasil disimpan');
      setTitle('');
      setContent('');
    }
    setIsLoading(false);
    setProgressMsg('');
  };

  return (
    <div className="p-6 border border-border rounded-xl bg-card space-y-6">
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-lg text-foreground">Upload Sumber Referensi (PDF)</h3>
        <p className="text-sm text-muted-foreground">PDF akan otomatis diekstrak menjadi teks ringan (Markdown) agar AI dapat membacanya dengan cepat, termasuk mendeteksi PDF hasil scan (OCR).</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Pilih File PDF</label>
          <div 
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed border-muted-foreground' : 'hover:border-primary hover:bg-primary/5 border-border'}`}
          >
            {isLoading ? (
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
            ) : (
              <UploadCloud className="h-10 w-10 text-muted-foreground mb-3" />
            )}
            <p className="font-medium text-foreground">{isLoading ? progressMsg || 'Memproses...' : 'Klik untuk unggah PDF'}</p>
            <p className="text-xs text-muted-foreground mt-1">Otomatis ekstraksi teks & OCR</p>
          </div>
          <input 
            type="file" 
            accept=".pdf" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Judul Sumber</label>
          <input 
            className="w-full p-2 border border-input rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none" 
            placeholder="Misal: Rumus Cepat Kuantitatif"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Hasil Ekstraksi (Markdown)</label>
          <textarea 
            className="w-full p-3 border border-input rounded-md bg-background h-48 focus:ring-2 focus:ring-primary/20 outline-none text-sm font-mono" 
            placeholder="Teks referensi akan muncul di sini setelah PDF di-upload..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">Anda bisa mengedit teks hasil ekstraksi sebelum menyimpannya.</p>
        </div>

        <div className="pt-2">
          <button 
            onClick={handleSave}
            disabled={isLoading || !title || !content}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {isLoading && progressMsg.includes('Menyimpan') ? 'Menyimpan...' : 'Simpan ke Knowledge Base AI'}
          </button>
        </div>
      </div>
    </div>
  );
}