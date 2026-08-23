import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Setup worker using Vite URL resolution
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export async function extractTextFromPDF(file: File, onProgress?: (msg: string) => void): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore - pdfjs-dist types mismatch
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullMarkdown = `# ` + file.name + `\n\n`;

    for (let i = 1; i <= pdf.numPages; i++) {
      if (onProgress) onProgress(`Menganalisis halaman ${i} dari ${pdf.numPages}...`);
      
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const strings = textContent.items.map((item: any) => item.str);
      const pageText = strings.join(' ').trim();
      
      // Jika teks hasil PDF kurang dari 50 karakter namun halaman ada kontennya, 
      // kemungkinan besar ini adalah PDF hasil scan (gambar).
      if (pageText.length < 50) {
        if (onProgress) onProgress(`Melakukan OCR pada halaman ${i} (PDF Scan)...`);
        
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          // @ts-ignore - pdfjs-dist types mismatch
          await page.render({ canvasContext: ctx, viewport }).promise;
          
          const { data: { text } } = await Tesseract.recognize(canvas, 'ind+eng');
          fullMarkdown += `## Halaman ${i}\n${text}\n\n`;
        }
      } else {
        fullMarkdown += `## Halaman ${i}\n${pageText}\n\n`;
      }
    }

    return fullMarkdown;
  } catch (error) {
    console.error("PDF Extraction error:", error);
    throw new Error("Gagal mengekstrak PDF. Pastikan file valid.");
  }
}