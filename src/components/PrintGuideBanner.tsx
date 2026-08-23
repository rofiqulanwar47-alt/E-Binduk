import React, { useState } from 'react';
import { HelpCircle, FileText, ChevronDown, ChevronUp, CheckCircle2, Printer, Info } from 'lucide-react';

interface PrintGuideBannerProps {
  compact?: boolean;
}

export const PrintGuideBanner: React.FC<PrintGuideBannerProps> = ({ compact = false }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (compact) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-950 print:hidden mb-4 shadow-xs">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-bold text-blue-900 block mb-0.5">Petunjuk Cetak & Simpan ke PDF Resmi:</span>
            <span>
              Pilih tujuan <strong>“Save as PDF”</strong>, gunakan kertas <strong>F4 / Folio (21.5 x 33 cm)</strong> atau <strong>A4</strong>, dan pastikan centang <strong>“Background graphics (Grafis latar belakang)”</strong> agar kop surat & warna tabel tercetak sempurna.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-700/50 rounded-xl p-4 text-white print:hidden mb-6 shadow-md transition-all">
      <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300">
            <Printer className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <span>Petunjuk Cetak & Simpan ke PDF Resmi</span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 bg-blue-500/30 text-blue-200 rounded-full border border-blue-400/30">
                Standar Kemendikbud
              </span>
            </h4>
            <p className="text-[11px] text-blue-200/80">Panduan konfigurasi printer browser agar hasil dokumen rapi dan presisi</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="text-xs text-blue-300 hover:text-white p-1 rounded-md hover:bg-white/10 flex items-center gap-1 transition"
        >
          <span>{isOpen ? 'Sembunyikan' : 'Buka Petunjuk'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-blue-800/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-900/60 rounded-lg p-3 border border-blue-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-blue-300 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>1. Simpan ke PDF</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Klik tombol <strong>“Cetak / Simpan PDF”</strong>, lalu pada jendela cetak browser ubah kolom <em>Destination (Tujuan)</em> menjadi <strong>“Save as PDF (Simpan sebagai PDF)”</strong>.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-lg p-3 border border-blue-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-blue-300 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>2. Ukuran Kertas</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Gunakan kertas <strong>F4 / Folio (21.5 x 33 cm)</strong> atau <strong>A4 (21 x 29.7 cm)</strong> standar dokumen Buku Induk Siswa Nasional.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 rounded-lg p-3 border border-blue-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-blue-300 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>3. Margin & Grafis Latar</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Atur margin printer ke <strong>“Default”</strong> atau <strong>“Minimum”</strong> dan <strong>centang opsi “Background graphics (Grafis latar belakang)”</strong> agar kop surat & warna tabel tercetak sempurna.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
