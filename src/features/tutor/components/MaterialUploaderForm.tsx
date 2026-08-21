import { useState } from 'react';
import { getSupabaseBrowserClient } from '../../../lib/supabase/browser-client';
import { toast } from 'sonner';

export function MaterialUploaderForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('tutor_materials').insert({ title, content_text: content });
    
    if (error) {
      toast.error('Gagal mengunggah materi');
    } else {
      toast.success('Materi berhasil diunggah');
      setTitle('');
      setContent('');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 border rounded-xl bg-white space-y-4">
      <h3 className="font-bold text-lg">Upload Materi Knowledge Base</h3>
      <input 
        className="w-full p-2 border rounded" 
        placeholder="Judul Materi (Misal: Rumus Cepat Kuantitatif)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea 
        className="w-full p-2 border rounded h-32" 
        placeholder="Isi Materi / Teks Referensi"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button 
        onClick={handleUpload}
        disabled={isLoading || !title || !content}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isLoading ? 'Mengunggah...' : 'Unggah Materi'}
      </button>
    </div>
  );
}
