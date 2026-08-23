import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Award,
  HeartHandshake,
  BrainCircuit,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  School,
  FileText,
} from 'lucide-react';
import { Student, SchoolProfile, StudentAnalysisResult } from '../types';

interface AiAssistantViewProps {
  students: Student[];
  schoolProfile: SchoolProfile;
  preselectedStudent?: Student | null;
  onSelectStudent: (student: Student) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  students,
  schoolProfile,
  preselectedStudent,
  onSelectStudent,
}) => {
  const [activeMode, setActiveMode] = useState<'profil_siswa' | 'chat_admin'>('profil_siswa');
  // Available sorted students (Urut Kelas & Abjad Nama)
  const sortedStudents = useMemo(() => {
    const parseClass = (cls: string) => {
      if (!cls) return { grade: 999, section: 'Z' };
      const match = cls.trim().match(/^(\d+)\s*([A-Za-z]*)/);
      if (match) {
        return { grade: parseInt(match[1], 10), section: match[2].toUpperCase() };
      }
      return { grade: 800, section: cls.toUpperCase() };
    };

    return [...students].sort((a, b) => {
      const classA = parseClass(a.kelasSekarang);
      const classB = parseClass(b.kelasSekarang);
      if (classA.grade !== classB.grade) return classA.grade - classB.grade;
      if (classA.section !== classB.section) return classA.section.localeCompare(classB.section);
      return (a.namaLengkap || '').localeCompare(b.namaLengkap || '', 'id', { sensitivity: 'base' });
    });
  }, [students]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudent?.id || (sortedStudents.length > 0 ? sortedStudents[0].id : '')
  );

  const currentStudent = students.find((s) => s.id === selectedStudentId) || sortedStudents[0] || students[0];

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<StudentAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Halo Bapak/Ibu Guru dan Tenaga Administrasi SMP Negeri 2 Kasihan! Saya Asisten Cerdas E-BINDUK siap membantu analisis data buku induk, rekapitulasi siswa, konsultasi BK, kelayakan PIP/KMS Bantul, dan administrasi kependidikan lainnya. Ada yang bisa saya bantu?`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  // Trigger Student Analysis
  const handleRunAnalysis = async () => {
    if (!currentStudent) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/ai/analyze-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student: currentStudent }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalysisResult(json.data);
      } else {
        setAnalysisError(json.error || 'Gagal menjalankan analisis AI.');
      }
    } catch (err: any) {
      setAnalysisError(err?.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Trigger Chat
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || chatInput;
    if (!textToSend.trim() || isChatSending) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setChatInput('');
    setIsChatSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          contextData: {
            totalStudents: students.length,
            schoolProfile,
            activeCount: students.filter((s) => s.status === 'Aktif').length,
            kipCount: students.filter((s) => s.kesejahteraan?.penerimaKip || s.kesejahteraan?.penerimaKmsBantul).length,
            classes: ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C'],
          },
        }),
      });

      const json = await res.json();
      if (json.success && json.reply) {
        const assistantMsg: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          sender: 'assistant',
          text: json.reply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Maaf, terjadi kendala saat memproses jawaban AI. Pastikan server aktif.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatSending(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Navigation Switcher */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>AI Asisten & Analitik E-BINDUK</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ditenagai oleh Gemini AI untuk analisis komprehensif profil siswa dan konsultasi administrasi
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveMode('profil_siswa')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
              activeMode === 'profil_siswa'
                ? 'bg-white shadow text-emerald-800'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Analisis Profil & BK Siswa
          </button>
          <button
            onClick={() => setActiveMode('chat_admin')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition ${
              activeMode === 'chat_admin'
                ? 'bg-white shadow text-emerald-800'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tanya AI Data Buku Induk
          </button>
        </div>
      </div>

      {/* MODE 1: ANALISIS PROFIL SISWA */}
      {activeMode === 'profil_siswa' && (
        <div className="space-y-6">
          {/* Selector Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={currentStudent?.fotoUrl}
                  alt={currentStudent?.namaLengkap}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shadow-sm"
                />
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">
                    Pilih Siswa untuk Dianalisis:
                  </label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => {
                      setSelectedStudentId(e.target.value);
                      setAnalysisResult(null);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                  >
                    {sortedStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.namaLengkap} ({s.kelasSekarang} - NISN {s.nisn})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing || !currentStudent}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Menganalisis Data dengan AI...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    <span>Jalankan Analisis AI Profil Siswa</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Analysis Results Display */}
          {analysisError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {analysisError}
            </div>
          )}

          {isAnalyzing && (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
              <Sparkles className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="font-bold text-slate-900 text-sm">
                AI Gemini sedang menganalisis rekam jejak Buku Induk {currentStudent?.namaLengkap}...
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Memproses data historis SD, rapor semester, kejuaraan, status sosial ekonomi, dan catatan perkembangan siswa.
              </p>
            </div>
          )}

          {!isAnalyzing && !analysisResult && (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm space-y-2">
              <BrainCircuit className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">Belum Ada Hasil Analisis</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Klik tombol &ldquo;Jalankan Analisis AI Profil Siswa&rdquo; untuk memperoleh wawasan mendalam mengenai potensi bakat, rekomendasi BK, dan evaluasi bantuan sosial.
              </p>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4">
              {/* Ringkasan & Potensi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    <span>Ringkasan Profil Siswa</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {analysisResult.ringkasanProfil}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
                    <Award className="w-4 h-4" />
                    <span>Identifikasi Bakat & Potensi</span>
                  </div>
                  <div className="space-y-1.5">
                    {analysisResult.potensiBakat?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rekomendasi BK & Rencana Pengembangan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                    <Lightbulb className="w-4 h-4" />
                    <span>Rekomendasi Bimbingan Konseling (BK)</span>
                  </div>
                  <div className="space-y-1.5">
                    {analysisResult.rekomendasiBk?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider">
                    <BrainCircuit className="w-4 h-4" />
                    <span>Rencana Pengembangan & Ekstrakurikuler</span>
                  </div>
                  <div className="space-y-1.5">
                    {analysisResult.rencanaPengembangan?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Kelayakan Bantuan KIP & Catatan Khusus */}
              <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200/90 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <HeartHandshake className="w-4 h-4 text-amber-700" />
                  <span>Evaluasi Kesejahteraan & Kelayakan Bantuan (PIP/KMS Bantul)</span>
                </div>
                <p className="text-xs text-amber-900 font-medium leading-relaxed">
                  {analysisResult.kelayakanBantuan}
                </p>
                {analysisResult.catatanKhusus && (
                  <p className="text-xs text-amber-800 pt-2 border-t border-amber-200/80">
                    <strong>Catatan Khusus:</strong> {analysisResult.catatanKhusus}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: CHAT ASISTEN ADMINISTRASI */}
      {activeMode === 'chat_admin' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
          {/* Quick Questions Suggestions */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-500 self-center">Pertanyaan Cepat:</span>
            <button
              onClick={() => handleSendMessage('Berapa total siswa kelas 7 penerima KIP dan KMS Bantul?')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 transition text-[11px]"
            >
              📊 Total Siswa KIP/KMS Kelas 7
            </button>
            <button
              onClick={() => handleSendMessage('Tampilkan daftar siswa berprestasi yang tercatat di Buku Induk')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 transition text-[11px]"
            >
              🏆 Siswa Berprestasi
            </button>
            <button
              onClick={() => handleSendMessage('Bagaimana prosedur mutasi masuk dan mutasi keluar siswa SMP menurut standar Dapodik?')}
              className="px-2.5 py-1 rounded-full bg-white border border-slate-300 hover:border-emerald-500 hover:text-emerald-700 transition text-[11px]"
            >
              📋 Prosedur Mutasi Siswa
            </button>
          </div>

          {/* Chat Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs shadow-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-br-none'
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div
                    className={`text-[9px] mt-1.5 ${
                      msg.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isChatSending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 text-slate-500 p-3 rounded-2xl text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>AI Gemini sedang memproses jawaban...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder="Tulis pesan atau pertanyaan seputar data Buku Induk siswa..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isChatSending || !chatInput.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
