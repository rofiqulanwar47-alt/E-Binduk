import React, { useState, useMemo } from 'react';
import {
  X,
  GraduationCap,
  Sparkles,
  CheckSquare,
  Square,
  Users,
  AlertCircle,
  Calendar,
  Building2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Student } from '../types';

interface GraduationModalProps {
  students: Student[];
  initialSelectedStudents?: Student[];
  currentClassFilter?: string; // e.g. "9A", "9", etc.
  onClose: () => void;
  onConfirmGraduation: (
    graduations: {
      studentId: string;
      tanggalLulus: string;
      melanjutkanKe: string;
      noIjazahSmp?: string;
    }[]
  ) => Promise<void> | void;
}

export const GraduationModal: React.FC<GraduationModalProps> = ({
  students,
  initialSelectedStudents,
  currentClassFilter,
  onClose,
  onConfirmGraduation,
}) => {
  // Eligible Grade 9 students (not yet Lulus)
  const eligibleStudents = useMemo(() => {
    if (initialSelectedStudents && initialSelectedStudents.length > 0) {
      return initialSelectedStudents.filter(
        (s) => s.kelasSekarang.startsWith('9') || s.status === 'Aktif'
      );
    }

    return students.filter((s) => {
      if (s.status === 'Lulus') return false;
      if (currentClassFilter && currentClassFilter !== 'all') {
        if (currentClassFilter === '9') return s.kelasSekarang.startsWith('9');
        return s.kelasSekarang === currentClassFilter;
      }
      return s.kelasSekarang.startsWith('9');
    });
  }, [students, initialSelectedStudents, currentClassFilter]);

  // Selected student IDs (all checked by default)
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    eligibleStudents.map((s) => s.id)
  );

  const defaultGraduationDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  const [tanggalLulus, setTanggalLulus] = useState<string>(defaultGraduationDate);
  const [defaultMelanjutkanKe, setDefaultMelanjutkanKe] = useState<string>('SMA / SMK / MA');
  const [individualSchool, setIndividualSchool] = useState<Record<string, string>>({});
  const [individualIjazah, setIndividualIjazah] = useState<Record<string, string>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const displayStudents = useMemo(() => {
    if (!searchQuery.trim()) return eligibleStudents;
    const q = searchQuery.toLowerCase();
    return eligibleStudents.filter(
      (s) =>
        s.namaLengkap.toLowerCase().includes(q) ||
        s.nisn.toLowerCase().includes(q) ||
        s.kelasSekarang.toLowerCase().includes(q)
    );
  }, [eligibleStudents, searchQuery]);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === eligibleStudents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleStudents.map((s) => s.id));
    }
  };

  const handleExecuteGraduation = async () => {
    if (selectedIds.length === 0) {
      alert('Pilih minimal 1 siswa kelas 9 yang akan diluluskan.');
      return;
    }

    const payload = eligibleStudents
      .filter((s) => selectedIds.includes(s.id))
      .map((student) => ({
        studentId: student.id,
        tanggalLulus: tanggalLulus || defaultGraduationDate,
        melanjutkanKe: individualSchool[student.id] || defaultMelanjutkanKe,
        noIjazahSmp: individualIjazah[student.id] || student.noIjazahSmp || '',
      }));

    setIsProcessing(true);
    try {
      await onConfirmGraduation(payload);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat memproses kelulusan.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-purple-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <GraduationCap className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Proses Kelulusan Siswa Kelas 9 (Arsip Alumni)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/30">
                  Status ➔ Lulus / Alumni
                </span>
              </h2>
              <p className="text-xs text-purple-200">
                Memindahkan siswa kelas 9 ke daftar Alumni resmi SMP Negeri 2 Kasihan Bantul.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Info Banner */}
          <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl flex items-start gap-3 text-slate-700 text-xs leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-purple-950">
                Penetapan Kelulusan & Pengarsipan Alumni
              </p>
              <p className="text-slate-600 mt-0.5">
                Siswa yang diproses akan diubah statusnya menjadi <code className="font-bold text-purple-800">Lulus</code> dan rombel menjadi <code className="font-bold text-purple-800">Alumni</code>. Seluruh data 6 semester rapor dan biodata Buku Induk tetap tersimpan permanen untuk keperluan legalisir atau penerbitan salinan buku induk di masa depan.
              </p>
            </div>
          </div>

          {/* Form Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* Tanggal Kelulusan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-purple-600" />
                <span>Tanggal Resmi Kelulusan *</span>
              </label>
              <input
                type="date"
                value={tanggalLulus}
                onChange={(e) => setTanggalLulus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Sesuai tanggal SK Kelulusan / Ijazah SMP N 2 Kasihan.
              </p>
            </div>

            {/* Melanjutkan Ke Default */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Default Melanjutkan Pendidikan</span>
              </label>
              <input
                type="text"
                value={defaultMelanjutkanKe}
                onChange={(e) => setDefaultMelanjutkanKe(e.target.value)}
                placeholder="e.g. SMA/SMK di Kab. Bantul"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Dapat disesuaikan secara individu pada tabel di bawah.
              </p>
            </div>
          </div>

          {/* Table List of Grade 9 Students */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {selectedIds.length === eligibleStudents.length && eligibleStudents.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-purple-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>
                    {selectedIds.length === eligibleStudents.length ? 'Batalkan Semua' : 'Pilih Semua'} ({selectedIds.length}/{eligibleStudents.length})
                  </span>
                </button>
                <span className="text-xs text-slate-500">
                  {selectedIds.length} siswa kelas 9 siap diluluskan
                </span>
              </div>

              {/* Search in Modal */}
              <input
                type="text"
                placeholder="Cari nama atau NISN siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 w-full sm:w-60"
              />
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              {displayStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Tidak ada siswa kelas 9 yang belum lulus yang cocok dengan filter saat ini.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">Pilih</th>
                      <th className="py-2.5 px-3">No. Induk / NISN</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3 text-center">Kelas</th>
                      <th className="py-2.5 px-3">Melanjutkan Ke (Tujuan)</th>
                      <th className="py-2.5 px-3">No. Ijazah (Opsional)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayStudents.map((student) => {
                      const isSelected = selectedIds.includes(student.id);

                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-purple-50/40 transition-colors ${
                            isSelected ? 'bg-purple-50/20' : 'opacity-60 bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSelect(student.id)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-purple-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                            <div>{student.noUrutInduk}</div>
                            <div className="text-slate-400">{student.nisn}</div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-bold text-slate-800">{student.namaLengkap}</div>
                            <div className="text-[10px] text-slate-400">
                              {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded font-bold bg-purple-100 text-purple-900 border border-purple-200">
                              {student.kelasSekarang}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              disabled={!isSelected}
                              placeholder={defaultMelanjutkanKe}
                              value={individualSchool[student.id] ?? student.melanjutkanKe ?? ''}
                              onChange={(e) =>
                                setIndividualSchool({
                                  ...individualSchool,
                                  [student.id]: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 rounded border border-slate-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              disabled={!isSelected}
                              placeholder="DN-04/..."
                              value={individualIjazah[student.id] ?? student.noIjazahSmp ?? ''}
                              onChange={(e) =>
                                setIndividualIjazah({
                                  ...individualIjazah,
                                  [student.id]: e.target.value,
                                })
                              }
                              className="w-28 px-2 py-1 rounded border border-slate-300 text-xs font-mono bg-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            Total <strong className="text-purple-700 font-bold">{selectedIds.length}</strong> siswa kelas 9 akan diluluskan ke Buku Alumni resmi.
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0 || isProcessing}
              onClick={handleExecuteGraduation}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{isProcessing ? 'Memproses...' : `Luluskan (${selectedIds.length} Siswa)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
