import { useState, useRef } from 'react';
import { SessionConfig } from '../schemas/sessionConfig';
import { useGeminiLive } from '../../../hooks/use-gemini-live';
import { Mic, MicOff, PhoneOff, Phone, Loader2, Volume2, AlertTriangle } from 'lucide-react';

export interface TranscriptEntry {
  role: "user" | "model";
  text: string;
}

interface Props {
  config: SessionConfig;
  onTranscriptUpdate?: (transcript: TranscriptEntry[]) => void;
}

export function LiveCallWidget({ config, onTranscriptUpdate }: Props) {
  if (!config) return null;

  const [callError, setCallError] = useState<string | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);

  // Tentukan gender berdasarkan pilihan eksplisit atau deteksi dari teks instruksi
  let isFemaleRole = false;
  if (config.actorGender === 'female') {
    isFemaleRole = true;
  } else if (config.actorGender === 'male') {
    isFemaleRole = false;
  } else {
    // Fallback otomatis
    const instructionText = (config.actorInstructions || '').toLowerCase();
    // Prioritaskan laki-laki terlebih dahulu jika kata 'bapak/pria' ada, namun regex ini tetap rentan. Lebih baik andalkan input manual.
    isFemaleRole = /wanita|istri|perempuan|ibu|nyonya|mba|kakak perempuan|adik perempuan/i.test(instructionText);
  }
  
  const selectedVoice = isFemaleRole ? "Aoede" : "Puck"; // Aoede = Female, Puck = Male

  const {
    isConnecting,
    isConnected,
    isSpeaking,
    startCall,
    endCall,
  } = useGeminiLive({
    voiceName: selectedVoice,
    onTranscript: (text, role) => {
      // Append to local ref
      transcriptRef.current = [...transcriptRef.current, { role, text }];
      if (onTranscriptUpdate) {
        onTranscriptUpdate(transcriptRef.current);
      }
    },
    systemInstruction: `Anda adalah AI Tutor UTBK interaktif di platform Planet Drill UTBK.
Skenario / Topik Pembelajaran: ${config.title}.

Panduan Karakter:
- Anda bertugas membantu siswa memahami konsep materi UTBK, membedah soal, atau menjelaskan rumus.
- MULAILAH percakapan segera setelah terhubung dengan menyapa peserta UTBK secara ramah dan suportif (misal: "Halo! Ada yang bisa saya bantu untuk materi ini?").
- Gunakan metode Socratic: Bimbing siswa untuk menemukan jawaban sendiri melalui pertanyaan-pertanyaan pancingan. JANGAN sekadar memberikan jawaban atau menyuapi.
- Bersikaplah sabar, interaktif, dan gunakan bahasa yang mudah dipahami oleh siswa SMA/sederajat.
- Jika siswa bertanya di luar konteks UTBK, arahkan kembali ke materi pelajaran dengan sopan.

Konteks Materi / Instruksi Khusus (Jadikan panduan utama dalam menjawab):
${config.actorInstructions || 'Tidak ada instruksi khusus. Jadilah tutor UTBK yang suportif.'}`,
    onError: (err) => {
      console.error("LiveCall Error:", err);
      setCallError(err.message);
    }
  });

  return (
    <div className="flex flex-col h-full bg-white rounded-xl m-4 shadow-sm border border-slate-200">
      <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex justify-between items-center">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          {isConnected ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          )}
          Tanya Tutor Langsung
        </h3>
        <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded font-medium border border-emerald-200">
          Voice Mode
        </span>
      </div>
      
      <div className="flex-grow p-4 flex flex-col items-center justify-center space-y-8">
        {!isConnected && !isConnecting && (
          <div className="text-center space-y-4 max-w-md">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
              <Phone className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-800">Mulai Sesi Tutor</h4>
            <p className="text-slate-500 text-sm">
              Pastikan mikrofon Anda siap. Anda akan terhubung secara *real-time* dengan AI Tutor untuk topik <strong>{config.title}</strong>.
            </p>
            
            {callError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-left flex gap-2 items-start shadow-sm mt-4">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>{callError}</span>
              </div>
            )}
            
            <button
              onClick={() => {
                setCallError(null);
                startCall();
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 mx-auto transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 mt-4"
            >
              <Phone className="w-5 h-5" /> Hubungi Tutor
            </button>
          </div>
        )}

        {isConnecting && (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
            <p className="text-slate-500 animate-pulse">Menghubungkan ke AI Tutor...</p>
          </div>
        )}

        {isConnected && (
          <div className="text-center space-y-8 w-full max-w-md">
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              {/* Outer pulsing ring when speaking */}
              {isSpeaking && (
                <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              )}
              {/* Main Avatar / Icon */}
              <div className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-inner transition-colors duration-500 ${isSpeaking ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                {isSpeaking ? <Volume2 className="w-12 h-12 animate-pulse" /> : <Mic className="w-10 h-10" />}
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-2xl font-bold text-slate-800">AI Tutor</h4>
              <p className={`text-sm font-medium transition-colors ${isSpeaking ? 'text-blue-600' : 'text-slate-500'}`}>
                {isSpeaking ? "Tutor sedang berbicara..." : "Tutor sedang mendengarkan..."}
              </p>
            </div>

            <div className="pt-8 border-t border-slate-100">
              <button
                onClick={endCall}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center gap-2 mx-auto transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <PhoneOff className="w-5 h-5" /> Akhiri Sesi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
