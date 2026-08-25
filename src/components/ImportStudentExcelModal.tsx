import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileCheck,
  RefreshCw,
  Users,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Student } from '../types';
import { getStudentPhoto } from '../utils/studentPhotos';
import {
  generateStudentExcelTemplate,
  parseExcelStudentFile,
  ExcelParseResult,
} from '../utils/excelImporter';

interface ImportStudentExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStudents: Student[];
  onApplyImport: (importedStudents: Student[], mode: 'append' | 'replace') => void;
}

export const ImportStudentExcelModal: React.FC<ImportStudentExcelModalProps> = ({
  isOpen,
  onClose,
  existingStudents,
  onApplyImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parseResult, setParseResult] = useState<ExcelParseResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    generateStudentExcelTemplate();
  };

  const handleProcessFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);
    setParseResult(null);

    try {
      const result = await parseExcelStudentFile(selectedFile, existingStudents.length);
      setParseResult(result);
    } catch (err: any) {
      setParseResult({
        success: false,
        students: [],
        errors: [`Kendala memproses file Excel: ${err?.message || err}`],
        warnings: [],
        totalRowsRead: 0,
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      handleProcessFile(f);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (parseResult && parseResult.success && parseResult.students.length > 0) {
      onApplyImport(parseResult.students, importMode);
      onClose();
    }
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Impor Data Siswa dari Format Excel
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Petugas TU & Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Standar Buku Induk SMP Negeri 2 Kasihan • Kompatibel .xlsx, .xls, .csv
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Download Official Database Template Card */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 mt-0.5 sm:mt-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-blue-950 text-xs sm:text-sm">
                  1. Unduh Format Template Excel Buku Induk Resmi
                </h4>
                <p className="text-[11px] text-blue-800 mt-0.5">
                  Format template mencakup seluruh atribut database lengkap: NISN, NIS, NIK, Nama Lengkap, Kelas, Alamat Dusun Bantul, Data Orang Tua, dan Asal SD.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-sm shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Template .XLSX</span>
            </button>
          </div>

          {/* Import Mode Selector */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="block font-bold text-slate-800 text-xs">
              2. Pilih Metode Penggabungan Data:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                onClick={() => setImportMode('append')}
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                  importMode === 'append'
                    ? 'bg-blue-50/90 border-blue-400 text-blue-950 font-semibold ring-1 ring-blue-400'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="mt-0.5 text-blue-600 focus:ring-blue-500"
                />
                <div className="text-[11px]">
                  <div className="font-bold">Gabungkan / Perbarui (Append)</div>
                  <div className="text-slate-500 font-normal mt-0.5">
                    Menambahkan data siswa baru & memperbarui siswa berdasarkan NISN tanpa menghapus data sebelumnya.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setImportMode('replace')}
                className={`p-2.5 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                  importMode === 'replace'
                    ? 'bg-rose-50/90 border-rose-400 text-rose-950 font-semibold ring-1 ring-rose-400'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100/70'
                }`}
              >
                <input
                  type="radio"
                  name="importMode"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="mt-0.5 text-rose-600 focus:ring-rose-500"
                />
                <div className="text-[11px]">
                  <div className="font-bold text-rose-900">Ganti Seluruh Data (Replace)</div>
                  <div className="text-slate-500 font-normal mt-0.5">
                    Menimpa seluruh daftar siswa dengan isi file Excel baru (Gunakan dengan hati-hati).
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Upload Area */}
          {!file && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-blue-500 bg-blue-50/60'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-800 text-xs sm:text-sm">
                  Pilih atau Tarik File Excel Siswa ke Sini
                </div>
                <p className="text-[11px] text-slate-500 max-w-md">
                  Mendukung file format <strong>.xlsx</strong>, <strong>.xls</strong>, dan <strong>.csv</strong>. Sistem akan otomatis memetakan kolom database secara cerdas.
                </p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isParsing && (
            <div className="p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
              <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto" />
              <div className="font-bold text-slate-800 text-xs sm:text-sm">
                Membaca dan memvalidasi file Excel siswa...
              </div>
              <p className="text-[11px] text-slate-500">
                Memproses baris data identitas, alamat, orang tua, dan riwayat sekolah.
              </p>
            </div>
          )}

          {/* Preview Parsed Data */}
          {parseResult && !isParsing && (
            <div className="space-y-3">
              {/* Summary Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                  parseResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  {parseResult.success ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-xs sm:text-sm">
                      {parseResult.success
                        ? `Berhasil membaca ${parseResult.students.length} baris data siswa!`
                        : 'Gagal mengimpor data siswa'}
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      File: <strong>{file?.name}</strong> • Total Baris Dibaca: {parseResult.totalRowsRead}
                    </div>
                    {parseResult.success && (
                      <div className="text-[10px] text-emerald-800 font-medium mt-1 flex items-center gap-1">
                        <span>✨ Pas foto otomatis disesuaikan secara cerdas dengan jenis kelamin (Laki-laki / Perempuan).</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 transition shadow-2xs cursor-pointer shrink-0"
                >
                  Ganti File
                </button>
              </div>

              {/* Table Preview */}
              {parseResult.students.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3 w-10">No</th>
                        <th className="py-2 px-3 w-28">NISN</th>
                        <th className="py-2 px-3">Nama Lengkap</th>
                        <th className="py-2 px-2 w-12 text-center">L/P</th>
                        <th className="py-2 px-2 w-14 text-center">Kelas</th>
                        <th className="py-2 px-3">Dusun / Alamat</th>
                        <th className="py-2 px-3">Nama Orang Tua</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parseResult.students.map((s, idx) => (
                        <tr key={s.id || idx} className="hover:bg-blue-50/40">
                          <td className="py-1.5 px-3 text-slate-500 font-mono text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-1.5 px-3 font-mono text-[11px] text-slate-800 font-semibold">
                            {s.nisn || '-'}
                          </td>
                          <td className="py-1.5 px-3">
                            <div className="flex items-center gap-2">
                              <img
                                src={getStudentPhoto(s)}
                                alt={s.namaLengkap}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = getStudentPhoto(s);
                                }}
                              />
                              <span className="font-bold text-slate-900">{s.namaLengkap}</span>
                            </div>
                          </td>
                          <td className="py-1.5 px-2 text-center font-bold">
                            <span className={s.jenisKelamin === 'L' ? 'text-blue-600' : 'text-pink-600'}>
                              {s.jenisKelamin}
                            </span>
                          </td>
                          <td className="py-1.5 px-2 text-center font-bold text-blue-700">
                            {s.kelasSekarang || '7A'}
                          </td>
                          <td className="py-1.5 px-3 text-slate-600 truncate max-w-[150px]">
                            {s.tempatTinggal?.dusun || s.tempatTinggal?.alamatLengkap || '-'}
                          </td>
                          <td className="py-1.5 px-3 text-slate-600 truncate max-w-[140px]">
                            {s.dataOrangTua?.namaAyah || s.dataOrangTua?.namaIbu || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Catatan Kesalahan:</span>
                  </div>
                  {parseResult.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] space-y-1 max-h-24 overflow-y-auto">
                  <div className="font-bold flex items-center gap-1 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Peringatan ({parseResult.warnings.length}):</span>
                  </div>
                  {parseResult.warnings.map((warn, i) => (
                    <div key={i}>• {warn}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition cursor-pointer"
          >
            Batal
          </button>

          {parseResult && parseResult.success && parseResult.students.length > 0 ? (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileCheck className="w-4 h-4" />
              <span>Terapkan {parseResult.students.length} Siswa ke Database</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400">
              Silakan pilih atau tarik file Excel untuk melanjutkan
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
