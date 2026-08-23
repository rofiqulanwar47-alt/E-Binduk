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
  HelpCircle,
} from 'lucide-react';
import { Student } from '../types';
import {
  generateScoreReportExcelTemplate,
  parseExcelScoreReportFile,
} from '../utils/excelImporter';

interface ImportScoreExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  selectedClass: string;
  selectedSemester: number;
  onApplyImport: (updatedStudents: Student[], count: number) => void;
}

export const ImportScoreExcelModal: React.FC<ImportScoreExcelModalProps> = ({
  isOpen,
  onClose,
  students,
  selectedClass,
  selectedSemester,
  onApplyImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [importSemester, setImportSemester] = useState<number>(selectedSemester);
  const [targetClass, setTargetClass] = useState<string>(selectedClass);
  const [parseResult, setParseResult] = useState<{
    success: boolean;
    updatedCount: number;
    updatedStudents: Student[];
    errors: string[];
    warnings: string[];
    matchedDetails: Array<{ studentName: string; nisn: string; average: number }>;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    generateScoreReportExcelTemplate(students, targetClass, importSemester);
  };

  const handleProcessFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsParsing(true);
    setParseResult(null);

    try {
      const result = await parseExcelScoreReportFile(
        selectedFile,
        students,
        importSemester,
        targetClass
      );
      setParseResult(result);
    } catch (err: any) {
      setParseResult({
        success: false,
        updatedCount: 0,
        updatedStudents: students,
        errors: [`Terjadi kendala saat memproses file Excel: ${err?.message || err}`],
        warnings: [],
        matchedDetails: [],
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
    if (parseResult && parseResult.success && parseResult.updatedCount > 0) {
      onApplyImport(parseResult.updatedStudents, parseResult.updatedCount);
      onClose();
    }
  };

  const handleReset = () => {
    setFile(null);
    setParseResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Impor Nilai Rapor Siswa dari Excel</h3>
              <p className="text-[11px] text-emerald-200">
                Format Standar Kurikulum Merdeka • SMP Negeri 2 Kasihan
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Target Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Kelas Nilai:
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-emerald-900"
              >
                <option value={selectedClass}>Kelas {selectedClass} (Saat ini)</option>
                <option value="Semua">Semua Kelas</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Target Semester:
              </label>
              <select
                value={importSemester}
                onChange={(e) => setImportSemester(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold text-slate-800"
              >
                <option value={1}>Semester 1 (Ganjil)</option>
                <option value={2}>Semester 2 (Genap)</option>
                <option value={3}>Semester 3</option>
                <option value={4}>Semester 4</option>
                <option value={5}>Semester 5</option>
                <option value={6}>Semester 6</option>
              </select>
            </div>
          </div>

          {/* Download Template Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs">
                  Unduh Format Excel Nilai Rapor
                </h4>
                <p className="text-[11px] text-slate-500">
                  File sudah berisi daftar nama siswa Kelas {targetClass} & 11 kolom mata pelajaran.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-emerald-700 font-bold border border-emerald-300 rounded-lg text-xs transition shadow-2xs shrink-0 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh .XLSX</span>
            </button>
          </div>

          {/* Drag & Drop Area */}
          {!file && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragActive
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-300 hover:border-emerald-400 bg-slate-50/50'
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
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-800 text-xs">
                  Pilih atau Tarik File Excel Nilai ke Sini
                </div>
                <p className="text-[11px] text-slate-500">
                  Mendukung format <strong>.xlsx</strong>, <strong>.xls</strong>, dan <strong>.csv</strong>
                </p>
              </div>
            </div>
          )}

          {/* Parsing State */}
          {isParsing && (
            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-2">
              <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin mx-auto" />
              <div className="font-bold text-slate-800 text-xs">Memproses data nilai Excel...</div>
              <p className="text-[11px] text-slate-500">Mencocokkan NISN dan nama siswa dengan database Buku Induk.</p>
            </div>
          )}

          {/* Parse Results Preview */}
          {parseResult && !isParsing && (
            <div className="space-y-3">
              {/* Result Summary Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  parseResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {parseResult.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <div className="font-bold text-xs">
                      {parseResult.success
                        ? `Berhasil membaca ${parseResult.updatedCount} data nilai siswa!`
                        : 'Gagal mengimpor nilai rapor'}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Target: Semester {importSemester} • File: {file?.name}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 transition"
                >
                  Ganti File
                </button>
              </div>

              {/* Matched Details Table */}
              {parseResult.matchedDetails.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs max-h-48 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2 px-3">No</th>
                        <th className="py-2 px-3">NISN</th>
                        <th className="py-2 px-3">Nama Siswa</th>
                        <th className="py-2 px-3 text-right">Rata-rata Rapor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parseResult.matchedDetails.map((item, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/40">
                          <td className="py-1.5 px-3 text-slate-500 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-1.5 px-3 font-mono text-[11px] text-slate-700">{item.nisn}</td>
                          <td className="py-1.5 px-3 font-semibold text-slate-900">{item.studentName}</td>
                          <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700">
                            {item.average}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Errors or Warnings */}
              {parseResult.errors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Catatan Kendala:</span>
                  </div>
                  {parseResult.errors.map((err, i) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              {parseResult.warnings.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] space-y-1 max-h-28 overflow-y-auto">
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

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            Tutup
          </button>

          {parseResult && parseResult.success && parseResult.updatedCount > 0 ? (
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <FileCheck className="w-4 h-4" />
              <span>Terapkan {parseResult.updatedCount} Nilai ke Buku Induk</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400">
              Pilih file Excel untuk mulai memproses
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
