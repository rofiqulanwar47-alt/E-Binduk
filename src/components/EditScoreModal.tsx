import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Award, Calculator, BookOpen, AlertCircle, CheckCircle2, User } from 'lucide-react';
import { Student, SubjectScore, SemesterReport } from '../types';

interface EditScoreModalProps {
  isOpen: boolean;
  student: Student | null;
  selectedSemester: number;
  onClose: () => void;
  onSaveScore: (studentId: string, updatedReport: SemesterReport) => void;
}

export const EditScoreModal: React.FC<EditScoreModalProps> = ({
  isOpen,
  student,
  selectedSemester,
  onClose,
  onSaveScore,
}) => {
  const [scores, setScores] = useState<SubjectScore>({
    pai: 80,
    pancasila: 82,
    bahasaIndonesia: 85,
    matematika: 78,
    ipa: 80,
    ips: 83,
    bahasaInggris: 81,
    seniBudaya: 86,
    pjok: 84,
    informatika: 85,
    bahasaJawa: 84,
    catatan: '',
  });

  const [kehadiran, setKehadiran] = useState({
    sakit: 0,
    izin: 0,
    tanpaKeterangan: 0,
  });

  const [sikapSpiritual, setSikapSpiritual] = useState<'Sangat Baik' | 'Baik' | 'Cukup'>('Sangat Baik');
  const [sikapSosial, setSikapSosial] = useState<'Sangat Baik' | 'Baik' | 'Cukup'>('Sangat Baik');

  useEffect(() => {
    if (student) {
      const existing = student.semesterReports?.find((r) => r.semester === selectedSemester);
      if (existing) {
        setScores({
          pai: existing.scores.pai ?? 80,
          pancasila: existing.scores.pancasila ?? 82,
          bahasaIndonesia: existing.scores.bahasaIndonesia ?? 85,
          matematika: existing.scores.matematika ?? 78,
          ipa: existing.scores.ipa ?? 80,
          ips: existing.scores.ips ?? 83,
          bahasaInggris: existing.scores.bahasaInggris ?? 81,
          seniBudaya: existing.scores.seniBudaya ?? 86,
          pjok: existing.scores.pjok ?? 84,
          informatika: existing.scores.informatika ?? 85,
          bahasaJawa: existing.scores.bahasaJawa ?? 84,
          catatan: existing.scores.catatan || '',
        });
        setKehadiran({
          sakit: existing.kehadiran?.sakit ?? 0,
          izin: existing.kehadiran?.izin ?? 0,
          tanpaKeterangan: existing.kehadiran?.tanpaKeterangan ?? 0,
        });
        setSikapSpiritual(existing.sikapSpiritual || 'Sangat Baik');
        setSikapSosial(existing.sikapSosial || 'Sangat Baik');
      } else {
        // Default values
        setScores({
          pai: 80,
          pancasila: 82,
          bahasaIndonesia: 85,
          matematika: 78,
          ipa: 80,
          ips: 83,
          bahasaInggris: 81,
          seniBudaya: 86,
          pjok: 84,
          informatika: 85,
          bahasaJawa: 84,
          catatan: 'Menunjukkan pemahaman yang baik pada seluruh materi pembelajaran.',
        });
        setKehadiran({ sakit: 0, izin: 0, tanpaKeterangan: 0 });
        setSikapSpiritual('Sangat Baik');
        setSikapSosial('Sangat Baik');
      }
    }
  }, [student, selectedSemester]);

  // Real-time calculation
  const { totalScore, averageScore, predikat } = useMemo(() => {
    const list = [
      scores.pai,
      scores.pancasila,
      scores.bahasaIndonesia,
      scores.matematika,
      scores.ipa,
      scores.ips,
      scores.bahasaInggris,
      scores.seniBudaya,
      scores.pjok,
      scores.informatika,
      scores.bahasaJawa,
    ].filter((n): n is number => typeof n === 'number' && !isNaN(n));

    const total = list.reduce((a, b) => a + b, 0);
    const avg = list.length > 0 ? Number((total / list.length).toFixed(1)) : 0;

    let pred = 'Cukup';
    if (avg >= 88) pred = 'Sangat Baik (A)';
    else if (avg >= 78) pred = 'Baik (B)';
    else if (avg >= 70) pred = 'Cukup (C)';
    else pred = 'Perlu Pendampingan (D)';

    return { totalScore: total, averageScore: avg, predikat: pred };
  }, [scores]);

  if (!isOpen || !student) return null;

  const handleScoreChange = (field: keyof SubjectScore, val: string) => {
    if (field === 'catatan') {
      setScores((prev) => ({ ...prev, catatan: val }));
      return;
    }
    const num = val === '' ? 0 : Number(val);
    if (!isNaN(num)) {
      const clamped = Math.max(0, Math.min(100, num));
      setScores((prev) => ({ ...prev, [field]: clamped }));
    }
  };

  const handleAttendanceChange = (field: 'sakit' | 'izin' | 'tanpaKeterangan', val: string) => {
    const num = val === '' ? 0 : Number(val);
    if (!isNaN(num)) {
      setKehadiran((prev) => ({ ...prev, [field]: Math.max(0, Math.floor(num)) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedReport: SemesterReport = {
      semester: (selectedSemester as 1 | 2 | 3 | 4 | 5 | 6),
      kelas: student.kelasSekarang || '7A',
      tahunAjaran: '2024/2025',
      scores: {
        ...scores,
        rataRata: averageScore,
        catatan: scores.catatan?.trim() || 'Perkembangan belajar aktif dan tuntas memenuhi KKTP.',
      },
      kehadiran,
      sikapSpiritual,
      sikapSosial,
    };

    onSaveScore(student.id, updatedReport);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={student.fotoUrl}
              alt={student.namaLengkap}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-400 shrink-0"
            />
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span>Edit Nilai Rapor: {student.namaLengkap}</span>
              </h3>
              <p className="text-[11px] text-emerald-200">
                NISN: <strong className="text-white font-mono">{student.nisn}</strong> • Kelas: <strong className="text-white">{student.kelasSekarang}</strong> • Semester: <strong className="text-white">{selectedSemester}</strong>
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

        {/* Live Summary Strip */}
        <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500 font-semibold">Total Nilai:</span>{' '}
              <strong className="text-emerald-950 font-mono text-sm">{totalScore}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Rata-rata:</span>{' '}
              <strong className="text-emerald-700 font-mono text-sm font-black">{averageScore}</strong>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">Predikat:</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
              {predikat}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Grid 11 Subjects */}
          <div>
            <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5 uppercase tracking-wide">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Nilai 11 Mata Pelajaran (Kurikulum Merdeka)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {/* PAI */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">1. PAI & Budi Pekerti</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.pai}
                  onChange={(e) => handleScoreChange('pai', e.target.value)}
                  className="w-16 p-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Pendidikan Pancasila */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">2. Pendidikan Pancasila (PPKn)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.pancasila}
                  onChange={(e) => handleScoreChange('pancasila', e.target.value)}
                  className="w-16 p-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Bahasa Indonesia */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">3. Bahasa Indonesia</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.bahasaIndonesia}
                  onChange={(e) => handleScoreChange('bahasaIndonesia', e.target.value)}
                  className="w-16 p-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Matematika */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">4. Matematika</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.matematika}
                  onChange={(e) => handleScoreChange('matematika', e.target.value)}
                  className="w-16 p-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* IPA */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">5. Ilmu Pengetahuan Alam (IPA)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.ipa}
                  onChange={(e) => handleScoreChange('ipa', e.target.value)}
                  className="w-16 p-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* IPS */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">6. Ilmu Pengetahuan Sosial (IPS)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.ips}
                  onChange={(e) => handleScoreChange('ips', e.target.value)}
                  className="w-16 p-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Bahasa Inggris */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">7. Bahasa Inggris</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.bahasaInggris}
                  onChange={(e) => handleScoreChange('bahasaInggris', e.target.value)}
                  className="w-16 p-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Seni Budaya */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">8. Seni Budaya (Musik/Rupa/Tari)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.seniBudaya}
                  onChange={(e) => handleScoreChange('seniBudaya', e.target.value)}
                  className="w-16 p-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* PJOK */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">9. PJOK</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.pjok}
                  onChange={(e) => handleScoreChange('pjok', e.target.value)}
                  className="w-16 p-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Informatika */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">10. Informatika</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.informatika}
                  onChange={(e) => handleScoreChange('informatika', e.target.value)}
                  className="w-16 p-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              {/* Bahasa Jawa */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 sm:col-span-2">
                <label className="font-semibold text-slate-700">11. Mulok Bahasa Jawa (DIY)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.bahasaJawa}
                  onChange={(e) => handleScoreChange('bahasaJawa', e.target.value)}
                  className="w-16 p-1.5 text-center font-mono font-bold text-slate-900 border border-slate-300 rounded focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Presensi & Sikap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Presensi */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <h5 className="font-bold text-slate-800 text-xs">Presensi Kehadiran (Hari)</h5>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Sakit (S)</label>
                  <input
                    type="number"
                    min="0"
                    value={kehadiran.sakit}
                    onChange={(e) => handleAttendanceChange('sakit', e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Izin (I)</label>
                  <input
                    type="number"
                    min="0"
                    value={kehadiran.izin}
                    onChange={(e) => handleAttendanceChange('izin', e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Alpa (A)</label>
                  <input
                    type="number"
                    min="0"
                    value={kehadiran.tanpaKeterangan}
                    onChange={(e) => handleAttendanceChange('tanpaKeterangan', e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono text-center"
                  />
                </div>
              </div>
            </div>

            {/* Sikap */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <h5 className="font-bold text-slate-800 text-xs">Predikat Sikap</h5>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Sikap Spiritual</label>
                  <select
                    value={sikapSpiritual}
                    onChange={(e) => setSikapSpiritual(e.target.value as any)}
                    className="w-full p-1.5 border border-slate-300 rounded font-semibold text-slate-800 bg-white"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Cukup">Cukup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Sikap Sosial</label>
                  <select
                    value={sikapSosial}
                    onChange={(e) => setSikapSosial(e.target.value as any)}
                    className="w-full p-1.5 border border-slate-300 rounded font-semibold text-slate-800 bg-white"
                  >
                    <option value="Sangat Baik">Sangat Baik</option>
                    <option value="Baik">Baik</option>
                    <option value="Cukup">Cukup</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Catatan Akademik */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Catatan Wali Kelas / Deskripsi Capaian Kompetensi
            </label>
            <textarea
              rows={2}
              value={scores.catatan || ''}
              onChange={(e) => handleScoreChange('catatan', e.target.value)}
              placeholder="Catatan kemajuan akademik siswa pada semester ini..."
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Nilai Siswa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
