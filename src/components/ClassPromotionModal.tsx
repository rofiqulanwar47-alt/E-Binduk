import React, { useState, useMemo } from 'react';
import {
  X,
  ArrowRight,
  Sparkles,
  CheckSquare,
  Square,
  Users,
  AlertCircle,
  TrendingUp,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Student } from '../types';

interface ClassPromotionModalProps {
  students: Student[];
  initialSelectedStudents?: Student[];
  currentClassFilter?: string; // e.g. "7A", "7", "8A", "8", etc.
  currentAcademicYear?: string;
  onClose: () => void;
  onConfirmPromotion: (
    promotions: { studentId: string; targetClass: string; newAcademicYear: string }[]
  ) => Promise<void> | void;
}

export const ClassPromotionModal: React.FC<ClassPromotionModalProps> = ({
  students,
  initialSelectedStudents,
  currentClassFilter,
  currentAcademicYear = '2024/2025',
  onClose,
  onConfirmPromotion,
}) => {
  // Determine eligible students (Grade 7 and Grade 8 with status 'Aktif' or 'Mutasi Masuk')
  const eligibleStudents = useMemo(() => {
    if (initialSelectedStudents && initialSelectedStudents.length > 0) {
      return initialSelectedStudents.filter(
        (s) => (s.kelasSekarang.startsWith('7') || s.kelasSekarang.startsWith('8')) && s.status !== 'Lulus'
      );
    }

    return students.filter((s) => {
      if (s.status !== 'Aktif' && s.status !== 'Mutasi Masuk') return false;
      if (currentClassFilter && currentClassFilter !== 'all') {
        if (currentClassFilter === '7' || currentClassFilter === '8') {
          return s.kelasSekarang.startsWith(currentClassFilter);
        }
        return s.kelasSekarang === currentClassFilter;
      }
      return s.kelasSekarang.startsWith('7') || s.kelasSekarang.startsWith('8');
    });
  }, [students, initialSelectedStudents, currentClassFilter]);

  // Selected student IDs (all checked by default)
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    eligibleStudents.map((s) => s.id)
  );

  // Compute next academic year e.g. "2024/2025" -> "2025/2026"
  const defaultNextYear = useMemo(() => {
    const parts = currentAcademicYear.split('/');
    if (parts.length === 2 && !isNaN(Number(parts[0])) && !isNaN(Number(parts[1]))) {
      return `${Number(parts[0]) + 1}/${Number(parts[1]) + 1}`;
    }
    return '2025/2026';
  }, [currentAcademicYear]);

  const [newAcademicYear, setNewAcademicYear] = useState<string>(defaultNextYear);

  // Helper to suggest destination class
  const getNextClassSuggestion = (currentClass: string): string => {
    const match = currentClass.match(/^(\d+)([A-Za-z]*)$/);
    if (!match) return currentClass;
    const grade = parseInt(match[1], 10);
    const section = match[2] || 'A';
    if (grade === 7) return `8${section}`;
    if (grade === 8) return `9${section}`;
    return currentClass;
  };

  // Class mapping configuration per origin class
  const originClasses = useMemo(() => {
    const classes = new Set<string>();
    eligibleStudents.forEach((s) => classes.add(s.kelasSekarang));
    return Array.from(classes).sort();
  }, [eligibleStudents]);

  const [classMapping, setClassMapping] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    originClasses.forEach((cls) => {
      map[cls] = getNextClassSuggestion(cls);
    });
    return map;
  });

  // Individual overrides if needed
  const [individualOverrides, setIndividualOverrides] = useState<Record<string, string>>({});

  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtered list for display
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

  const handleClassMappingChange = (originClass: string, targetClass: string) => {
    setClassMapping((prev) => ({ ...prev, [originClass]: targetClass }));
  };

  const handleIndividualClassChange = (studentId: string, targetClass: string) => {
    setIndividualOverrides((prev) => ({ ...prev, [studentId]: targetClass }));
  };

  const getFinalTargetClass = (student: Student): string => {
    if (individualOverrides[student.id]) {
      return individualOverrides[student.id];
    }
    if (classMapping[student.kelasSekarang]) {
      return classMapping[student.kelasSekarang];
    }
    return getNextClassSuggestion(student.kelasSekarang);
  };

  const handleExecutePromotion = async () => {
    if (selectedIds.length === 0) {
      alert('Pilih minimal 1 siswa yang akan dinaikkan kelas.');
      return;
    }

    const payload = eligibleStudents
      .filter((s) => selectedIds.includes(s.id))
      .map((student) => ({
        studentId: student.id,
        targetClass: getFinalTargetClass(student),
        newAcademicYear: newAcademicYear.trim() || defaultNextYear,
      }));

    setIsProcessing(true);
    try {
      await onConfirmPromotion(payload);
      onClose();
    } catch (e) {
      console.error(e);
      alert('Terjadi kesalahan saat memproses kenaikan kelas.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-blue-600 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <TrendingUp className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Kenaikan Kelas & Pergantian Tahun Pelajaran</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Kelas 7 & 8 ➔ Kelas Berikutnya
                </span>
              </h2>
              <p className="text-xs text-blue-100">
                Memudahkan pemindahan tingkat kelas siswa tanpa menghapus riwayat nilai dan biodata yang sudah ada.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Explanation Info Banner */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3 text-slate-700 text-xs leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950">
                Data Rapor & Riwayat Buku Induk Tetap Utuh dan Aman
              </p>
              <p className="text-slate-600 mt-0.5">
                Proses ini akan memperbarui rombel (<code className="font-bold text-blue-800">kelasSekarang</code>) dan <code className="font-bold text-blue-800">tahunAjaran</code> siswa. Riwayat nilai rapor semester 1-2 (Kelas VII) atau semester 3-4 (Kelas VIII) tetap tersimpan di database Buku Induk dan langsung siap untuk pengisian semester berikutnya.
              </p>
            </div>
          </div>

          {/* Academic Year & Class Mapping Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {/* New Academic Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Tahun Pelajaran Baru *</span>
              </label>
              <input
                type="text"
                value={newAcademicYear}
                onChange={(e) => setNewAcademicYear(e.target.value)}
                placeholder="Contoh: 2025/2026"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tahun pelajaran aktif yang akan disematkan ke siswa yang naik kelas.
              </p>
            </div>

            {/* Origin to Destination Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                <span>Aturan Pemetaan Kenaikan Rombel</span>
              </label>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {originClasses.map((origin) => (
                  <div key={origin} className="flex items-center justify-between bg-white px-2.5 py-1 rounded border border-slate-200 text-xs">
                    <span className="font-bold text-slate-800">Kelas {origin}</span>
                    <span className="text-slate-400">➔</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500">Naik ke:</span>
                      <select
                        value={classMapping[origin] || getNextClassSuggestion(origin)}
                        onChange={(e) => handleClassMappingChange(origin, e.target.value)}
                        className="px-2 py-0.5 border border-blue-300 rounded bg-blue-50 text-blue-900 font-bold text-xs focus:outline-none"
                      >
                        <option value="8A">8A</option>
                        <option value="8B">8B</option>
                        <option value="8C">8C</option>
                        <option value="8D">8D</option>
                        <option value="9A">9A</option>
                        <option value="9B">9B</option>
                        <option value="9C">9C</option>
                        <option value="9D">9D</option>
                        <option value={origin}>Tetap di {origin} (Tinggal)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Student List Section */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  {selectedIds.length === eligibleStudents.length && eligibleStudents.length > 0 ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <span>
                    {selectedIds.length === eligibleStudents.length ? 'Batalkan Semua' : 'Pilih Semua'} ({selectedIds.length}/{eligibleStudents.length})
                  </span>
                </button>
                <span className="text-xs text-slate-500">
                  {selectedIds.length} siswa siap dinaikkan tingkat
                </span>
              </div>

              {/* Search in Modal */}
              <input
                type="text"
                placeholder="Cari nama atau NISN siswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-60"
              />
            </div>

            {/* Table of Students */}
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              {displayStudents.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  Tidak ada siswa kelas 7 atau 8 yang cocok dengan filter saat ini.
                </div>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-8 text-center">Pilih</th>
                      <th className="py-2.5 px-3">No. Induk / NISN</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3 text-center">Kelas Asal</th>
                      <th className="py-2.5 px-3 text-center">➔</th>
                      <th className="py-2.5 px-3">Rombel Tujuan Baru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayStudents.map((student) => {
                      const isSelected = selectedIds.includes(student.id);
                      const finalTarget = getFinalTargetClass(student);

                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-blue-50/40 transition-colors ${
                            isSelected ? 'bg-blue-50/20' : 'opacity-60 bg-slate-50'
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSelect(student.id)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
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
                              {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • TA: {student.tahunAjaran}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className="px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-800">
                              {student.kelasSekarang}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center text-slate-400">➔</td>
                          <td className="py-2 px-3">
                            <select
                              disabled={!isSelected}
                              value={finalTarget}
                              onChange={(e) => handleIndividualClassChange(student.id, e.target.value)}
                              className={`px-2.5 py-1 rounded border text-xs font-bold ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                                  : 'bg-slate-100 border-slate-300 text-slate-400'
                              }`}
                            >
                              <option value="8A">Naik ke 8A</option>
                              <option value="8B">Naik ke 8B</option>
                              <option value="8C">Naik ke 8C</option>
                              <option value="8D">Naik ke 8D</option>
                              <option value="9A">Naik ke 9A</option>
                              <option value="9B">Naik ke 9B</option>
                              <option value="9C">Naik ke 9C</option>
                              <option value="9D">Naik ke 9D</option>
                              <option value={student.kelasSekarang}>
                                Tinggal di {student.kelasSekarang}
                              </option>
                            </select>
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
            Total <strong className="text-blue-700 font-bold">{selectedIds.length}</strong> siswa akan dialihkan ke Tahun Pelajaran <strong className="text-slate-800">{newAcademicYear}</strong>.
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
              onClick={handleExecutePromotion}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Memproses...' : `Proses Naik Kelas (${selectedIds.length})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
