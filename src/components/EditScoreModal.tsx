import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Award,
  Calculator,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  User,
  Calendar,
  Layers,
  Copy,
  ChevronRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Student, SubjectScore, SemesterReport } from '../types';

interface EditScoreModalProps {
  isOpen: boolean;
  student: Student | null;
  selectedSemester: number;
  onClose: () => void;
  onSaveScore: (studentId: string, updatedReport: SemesterReport) => void;
}

type ScoreInputVal = number | '';

interface FormScores {
  pai: ScoreInputVal;
  pancasila: ScoreInputVal;
  bahasaIndonesia: ScoreInputVal;
  matematika: ScoreInputVal;
  ipa: ScoreInputVal;
  ips: ScoreInputVal;
  bahasaInggris: ScoreInputVal;
  seniBudaya: ScoreInputVal;
  pjok: ScoreInputVal;
  informatika: ScoreInputVal;
  bahasaJawa: ScoreInputVal;
  catatan: string;
}

export const EditScoreModal: React.FC<EditScoreModalProps> = ({
  isOpen,
  student,
  selectedSemester: initialSemester,
  onClose,
  onSaveScore,
}) => {
  const [activeSemester, setActiveSemester] = useState<number>(initialSemester || 1);

  const [scores, setScores] = useState<FormScores>({
    pai: '',
    pancasila: '',
    bahasaIndonesia: '',
    matematika: '',
    ipa: '',
    ips: '',
    bahasaInggris: '',
    seniBudaya: '',
    pjok: '',
    informatika: '',
    bahasaJawa: '',
    catatan: '',
  });

  const [kelas, setKelas] = useState<string>('7A');
  const [tahunAjaran, setTahunAjaran] = useState<string>('2026/2027');

  const [kehadiran, setKehadiran] = useState({
    sakit: 0,
    izin: 0,
    tanpaKeterangan: 0,
  });

  const [sikapSpiritual, setSikapSpiritual] = useState<'Sangat Baik' | 'Baik' | 'Cukup'>('Sangat Baik');
  const [sikapSosial, setSikapSosial] = useState<'Sangat Baik' | 'Baik' | 'Cukup'>('Sangat Baik');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Sync activeSemester when initialSemester changes
  useEffect(() => {
    if (initialSemester) {
      setActiveSemester(initialSemester);
    }
  }, [initialSemester, isOpen]);

  // Load semester report whenever student or activeSemester changes
  useEffect(() => {
    if (student) {
      const existing = student.semesterReports?.find((r) => r.semester === activeSemester);
      if (existing && existing.scores) {
        setScores({
          pai: existing.scores.pai !== undefined && existing.scores.pai !== null ? existing.scores.pai : '',
          pancasila: existing.scores.pancasila !== undefined && existing.scores.pancasila !== null ? existing.scores.pancasila : '',
          bahasaIndonesia: existing.scores.bahasaIndonesia !== undefined && existing.scores.bahasaIndonesia !== null ? existing.scores.bahasaIndonesia : '',
          matematika: existing.scores.matematika !== undefined && existing.scores.matematika !== null ? existing.scores.matematika : '',
          ipa: existing.scores.ipa !== undefined && existing.scores.ipa !== null ? existing.scores.ipa : '',
          ips: existing.scores.ips !== undefined && existing.scores.ips !== null ? existing.scores.ips : '',
          bahasaInggris: existing.scores.bahasaInggris !== undefined && existing.scores.bahasaInggris !== null ? existing.scores.bahasaInggris : '',
          seniBudaya: existing.scores.seniBudaya !== undefined && existing.scores.seniBudaya !== null ? existing.scores.seniBudaya : '',
          pjok: existing.scores.pjok !== undefined && existing.scores.pjok !== null ? existing.scores.pjok : '',
          informatika: existing.scores.informatika !== undefined && existing.scores.informatika !== null ? existing.scores.informatika : '',
          bahasaJawa: existing.scores.bahasaJawa !== undefined && existing.scores.bahasaJawa !== null ? existing.scores.bahasaJawa : '',
          catatan: existing.scores.catatan || '',
        });
        setKelas(existing.kelas || student.kelasSekarang || '7A');
        setTahunAjaran(existing.tahunAjaran || '2026/2027');
        setKehadiran({
          sakit: existing.kehadiran?.sakit ?? 0,
          izin: existing.kehadiran?.izin ?? 0,
          tanpaKeterangan: existing.kehadiran?.tanpaKeterangan ?? 0,
        });
        setSikapSpiritual(existing.sikapSpiritual || 'Sangat Baik');
        setSikapSosial(existing.sikapSosial || 'Sangat Baik');
      } else {
        // Derive appropriate default grade level for the semester
        let defaultGrade = '7A';
        if (student.kelasSekarang) {
          const section = student.kelasSekarang.replace(/^\d+/, '') || 'A';
          if (activeSemester === 1 || activeSemester === 2) defaultGrade = `7${section}`;
          else if (activeSemester === 3 || activeSemester === 4) defaultGrade = `8${section}`;
          else defaultGrade = `9${section}`;
        }
        setKelas(defaultGrade);
        setTahunAjaran('2026/2027');

        // Nilai default tetap KOSONG saat belum ada nilai
        setScores({
          pai: '',
          pancasila: '',
          bahasaIndonesia: '',
          matematika: '',
          ipa: '',
          ips: '',
          bahasaInggris: '',
          seniBudaya: '',
          pjok: '',
          informatika: '',
          bahasaJawa: '',
          catatan: '',
        });
        setKehadiran({ sakit: 0, izin: 0, tanpaKeterangan: 0 });
        setSikapSpiritual('Sangat Baik');
        setSikapSosial('Sangat Baik');
      }
    }
  }, [student, activeSemester]);

  // Real-time calculations: ONLY counting filled numeric scores
  const { totalScore, averageScore, predikat, filledCount, totalSubjects } = useMemo(() => {
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

    let pred = 'Belum Ada Nilai';
    if (list.length > 0) {
      if (avg >= 88) pred = 'Sangat Baik (A)';
      else if (avg >= 78) pred = 'Baik (B)';
      else if (avg >= 70) pred = 'Cukup (C)';
      else pred = 'Perlu Pendampingan (D)';
    }

    return {
      totalScore: total,
      averageScore: avg,
      predikat: pred,
      filledCount: list.length,
      totalSubjects: 11,
    };
  }, [scores]);

  if (!isOpen || !student) return null;

  const handleScoreChange = (field: keyof FormScores, val: string) => {
    if (field === 'catatan') {
      setScores((prev) => ({ ...prev, catatan: val }));
      return;
    }
    if (val === '' || val === null || val === undefined) {
      setScores((prev) => ({ ...prev, [field]: '' }));
      return;
    }
    const num = Number(val);
    if (!isNaN(num)) {
      const clamped = Math.max(0, Math.min(100, num));
      setScores((prev) => ({ ...prev, [field]: clamped }));
    }
  };

  const handleClearAllScores = () => {
    setScores({
      pai: '',
      pancasila: '',
      bahasaIndonesia: '',
      matematika: '',
      ipa: '',
      ips: '',
      bahasaInggris: '',
      seniBudaya: '',
      pjok: '',
      informatika: '',
      bahasaJawa: '',
      catatan: '',
    });
    setSaveToast('Semua nilai mapel telah dikosongkan.');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleFillStandardKKTP = () => {
    setScores({
      pai: 80,
      pancasila: 80,
      bahasaIndonesia: 82,
      matematika: 75,
      ipa: 78,
      ips: 78,
      bahasaInggris: 78,
      seniBudaya: 82,
      pjok: 82,
      informatika: 80,
      bahasaJawa: 80,
      catatan: 'Mencapai ketuntasan seluruh tujuan pembelajaran dengan baik.',
    });
    setSaveToast('Nilai standar tuntas KKTP berhasil dimuat.');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleAttendanceChange = (field: 'sakit' | 'izin' | 'tanpaKeterangan', val: string) => {
    const num = val === '' ? 0 : Number(val);
    if (!isNaN(num)) {
      setKehadiran((prev) => ({ ...prev, [field]: Math.max(0, Math.floor(num)) }));
    }
  };

  const handleCopyFromSemester = (fromSemester: number) => {
    const sourceReport = student.semesterReports?.find((r) => r.semester === fromSemester);
    if (sourceReport && sourceReport.scores) {
      setScores({
        pai: sourceReport.scores.pai !== undefined ? sourceReport.scores.pai : '',
        pancasila: sourceReport.scores.pancasila !== undefined ? sourceReport.scores.pancasila : '',
        bahasaIndonesia: sourceReport.scores.bahasaIndonesia !== undefined ? sourceReport.scores.bahasaIndonesia : '',
        matematika: sourceReport.scores.matematika !== undefined ? sourceReport.scores.matematika : '',
        ipa: sourceReport.scores.ipa !== undefined ? sourceReport.scores.ipa : '',
        ips: sourceReport.scores.ips !== undefined ? sourceReport.scores.ips : '',
        bahasaInggris: sourceReport.scores.bahasaInggris !== undefined ? sourceReport.scores.bahasaInggris : '',
        seniBudaya: sourceReport.scores.seniBudaya !== undefined ? sourceReport.scores.seniBudaya : '',
        pjok: sourceReport.scores.pjok !== undefined ? sourceReport.scores.pjok : '',
        informatika: sourceReport.scores.informatika !== undefined ? sourceReport.scores.informatika : '',
        bahasaJawa: sourceReport.scores.bahasaJawa !== undefined ? sourceReport.scores.bahasaJawa : '',
        catatan: sourceReport.scores.catatan || '',
      });
      setKehadiran({
        sakit: sourceReport.kehadiran?.sakit ?? 0,
        izin: sourceReport.kehadiran?.izin ?? 0,
        tanpaKeterangan: sourceReport.kehadiran?.tanpaKeterangan ?? 0,
      });
      setSikapSpiritual(sourceReport.sikapSpiritual || 'Sangat Baik');
      setSikapSosial(sourceReport.sikapSosial || 'Sangat Baik');
      setSaveToast(`Data nilai berhasil disalin dari Semester ${fromSemester}`);
      setTimeout(() => setSaveToast(null), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent, nextSemester: boolean = false) => {
    e.preventDefault();

    const finalSubjectScores: SubjectScore = {
      pai: scores.pai !== '' ? Number(scores.pai) : undefined,
      pancasila: scores.pancasila !== '' ? Number(scores.pancasila) : undefined,
      bahasaIndonesia: scores.bahasaIndonesia !== '' ? Number(scores.bahasaIndonesia) : undefined,
      matematika: scores.matematika !== '' ? Number(scores.matematika) : undefined,
      ipa: scores.ipa !== '' ? Number(scores.ipa) : undefined,
      ips: scores.ips !== '' ? Number(scores.ips) : undefined,
      bahasaInggris: scores.bahasaInggris !== '' ? Number(scores.bahasaInggris) : undefined,
      seniBudaya: scores.seniBudaya !== '' ? Number(scores.seniBudaya) : undefined,
      pjok: scores.pjok !== '' ? Number(scores.pjok) : undefined,
      informatika: scores.informatika !== '' ? Number(scores.informatika) : undefined,
      bahasaJawa: scores.bahasaJawa !== '' ? Number(scores.bahasaJawa) : undefined,
      rataRata: filledCount > 0 ? averageScore : undefined,
      catatan: scores.catatan?.trim() || '',
    };

    const updatedReport: SemesterReport = {
      semester: activeSemester as 1 | 2 | 3 | 4 | 5 | 6,
      kelas: kelas.trim() || student.kelasSekarang || '7A',
      tahunAjaran: tahunAjaran.trim() || '2026/2027',
      scores: finalSubjectScores,
      kehadiran,
      sikapSpiritual,
      sikapSosial,
    };

    onSaveScore(student.id, updatedReport);

    if (nextSemester && activeSemester < 6) {
      setActiveSemester(activeSemester + 1);
      setSaveToast(`Nilai Semester ${activeSemester} tersimpan! Beralih ke Semester ${activeSemester + 1}`);
      setTimeout(() => setSaveToast(null), 3000);
    } else {
      onClose();
    }
  };

  const semestersList = [
    { num: 1, label: 'Semester 1 (VII Ganjil)' },
    { num: 2, label: 'Semester 2 (VII Genap)' },
    { num: 3, label: 'Semester 3 (VIII Ganjil)' },
    { num: 4, label: 'Semester 4 (VIII Genap)' },
    { num: 5, label: 'Semester 5 (IX Ganjil)' },
    { num: 6, label: 'Semester 6 (IX Genap)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <img
              src={student.fotoUrl}
              alt={student.namaLengkap}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-emerald-400 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  Input & Edit Nilai Rapor Siswa
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  Semester 1 - 6
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                <strong className="text-white">{student.namaLengkap}</strong> • NISN:{' '}
                <strong className="text-white font-mono">{student.nisn}</strong> • Kelas:{' '}
                <strong className="text-white">{student.kelasSekarang}</strong>
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

        {/* Semester Tab Switcher (Semester 1 to 6) */}
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pilih Semester:</span>
            </span>
            <div className="flex items-center gap-2">
              {student.semesterReports && student.semesterReports.length > 0 && (
                <div className="text-[11px] text-slate-600 flex items-center gap-1">
                  <span>Salin nilai:</span>
                  {student.semesterReports.map((r) => (
                    <button
                      key={r.semester}
                      type="button"
                      onClick={() => handleCopyFromSemester(r.semester)}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-slate-300 rounded text-[10px] font-bold transition flex items-center gap-0.5 cursor-pointer shadow-2xs"
                      title={`Salin nilai dari Semester ${r.semester}`}
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>Smt {r.semester}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {semestersList.map((item) => {
              const rep = student.semesterReports?.find((r) => r.semester === item.num);
              const repScores = rep?.scores;
              const filledInRep = repScores
                ? [
                    repScores.pai,
                    repScores.pancasila,
                    repScores.bahasaIndonesia,
                    repScores.matematika,
                    repScores.ipa,
                    repScores.ips,
                    repScores.bahasaInggris,
                    repScores.seniBudaya,
                    repScores.pjok,
                    repScores.informatika,
                    repScores.bahasaJawa,
                  ].filter((v): v is number => typeof v === 'number' && !isNaN(v)).length
                : 0;

              const isComplete = filledInRep === 11;
              const isPartial = filledInRep > 0 && filledInRep < 11;
              const isActive = activeSemester === item.num;

              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => setActiveSemester(item.num)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 cursor-pointer relative ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-500'
                      : isComplete
                      ? 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-900 border border-emerald-300'
                      : isPartial
                      ? 'bg-amber-50 hover:bg-amber-100/80 text-amber-900 border border-amber-300'
                      : 'bg-white hover:bg-slate-50 text-slate-500 border border-slate-200'
                  }`}
                >
                  <span className="text-xs">Semester {item.num}</span>
                  <span
                    className={`text-[9px] font-semibold ${
                      isActive
                        ? 'text-emerald-200'
                        : isComplete
                        ? 'text-emerald-700'
                        : isPartial
                        ? 'text-amber-700'
                        : 'text-slate-400'
                    }`}
                  >
                    {isComplete ? '● Lengkap' : isPartial ? `◐ ${filledInRep}/11` : '○ Kosong'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Status & Summary Bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Status Pengisian:</span>
              {filledCount === 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                  ○ Belum Ada Nilai (0/11)
                </span>
              ) : filledCount < 11 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  ◐ Sebagian ({filledCount}/11 Mapel)
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  ● Lengkap (11/11 Mapel)
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-500 font-semibold">Total Nilai:</span>{' '}
              <strong className="text-slate-900 font-mono text-sm">
                {filledCount > 0 ? totalScore : '-'}
              </strong>
            </div>

            <div>
              <span className="text-slate-500 font-semibold">Rata-rata:</span>{' '}
              <strong className={`font-mono text-sm font-black ${filledCount > 0 ? 'text-emerald-700' : 'text-slate-400'}`}>
                {filledCount > 0 ? averageScore : '-'}
              </strong>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Predikat:</span>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                filledCount > 0 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {predikat}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClearAllScores}
              className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Kosongkan seluruh nilai pada semester ini"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Kosongkan Nilai</span>
            </button>
            <button
              type="button"
              onClick={handleFillStandardKKTP}
              className="px-2.5 py-1 text-[11px] font-semibold bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg transition flex items-center gap-1 cursor-pointer"
              title="Isi contoh nilai standar tuntas KKTP (75-82)"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>Isi Nilai Standar</span>
            </button>
          </div>
        </div>

        {/* Toast Alert Inside Modal */}
        {saveToast && (
          <div className="mx-6 mt-3 p-2.5 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveToast}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Class & Academic Year Metadata for this Semester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tingkat & Rombel Kelas pada Semester {activeSemester}
              </label>
              <input
                type="text"
                required
                value={kelas}
                onChange={(e) => setKelas(e.target.value)}
                placeholder="Contoh: 7A / 8B / 9C"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Tahun Ajaran pada Semester {activeSemester}
              </label>
              <input
                type="text"
                required
                value={tahunAjaran}
                onChange={(e) => setTahunAjaran(e.target.value)}
                placeholder="Contoh: 2026/2027"
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {/* Grid 11 Subjects */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 uppercase tracking-wide">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Nilai 11 Mata Pelajaran Kurikulum Merdeka (0 - 100)</span>
              </h4>
              <span className="text-[11px] text-slate-500 italic">
                *Biarkan kosong jika nilai belum diinput
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              {/* 1. PAI */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">1. PAI & Budi Pekerti</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.pai}
                  placeholder="Kosong"
                  onChange={(e) => handleScoreChange('pai', e.target.value)}
                  className={`w-20 p-1.5 text-center font-mono font-bold rounded border outline-none ${
                    scores.pai !== ''
                      ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* 2. PPKn */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">2. Pendidikan Pancasila (PPKn)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.pancasila}
                  placeholder="Kosong"
                  onChange={(e) => handleScoreChange('pancasila', e.target.value)}
                  className={`w-20 p-1.5 text-center font-mono font-bold rounded border outline-none ${
                    scores.pancasila !== ''
                      ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* 3. Bahasa Indonesia */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">3. Bahasa Indonesia</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.bahasaIndonesia}
                  placeholder="Kosong"
                  onChange={(e) => handleScoreChange('bahasaIndonesia', e.target.value)}
                  className={`w-20 p-1.5 text-center font-mono font-bold rounded border outline-none ${
                    scores.bahasaIndonesia !== ''
                      ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* 4. Matematika */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">4. Matematika</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.matematika}
                  placeholder="Kosong"
                  onChange={(e) => handleScoreChange('matematika', e.target.value)}
                  className={`w-20 p-1.5 text-center font-mono font-bold rounded border outline-none ${
                    scores.matematika !== ''
                      ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* 5. IPA */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">5. Ilmu Pengetahuan Alam (IPA)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.ipa}
                  placeholder="Kosong"
                  onChange={(e) => handleScoreChange('ipa', e.target.value)}
                  className={`w-20 p-1.5 text-center font-mono font-bold rounded border outline-none ${
                    scores.ipa !== ''
                      ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* 6. IPS */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">6. Ilmu Pengetahuan Sosial (IPS)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.ips}
                  placeholder="Kosong"
                  onChange={(e) => handleScoreChange('ips', e.target.value)}
                  className={`w-20 p-1.5 text-center font-mono font-bold rounded border outline-none ${
                    scores.ips !== ''
                      ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* 7. Bahasa Inggris */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">7. Bahasa Inggris</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.bahasaInggris}
                  placeholder="Kosong"
                  onChange={(e) => handleScoreChange('bahasaInggris', e.target.value)}
                  className={`w-20 p-1.5 text-center font-mono font-bold rounded border outline-none ${
                    scores.bahasaInggris !== ''
                      ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* 8. Seni Budaya */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">8. Seni Budaya (Rupa/Musik/Tari)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.seniBudaya}
                  placeholder="Kosong"
                  onChange={(e) => handleScoreChange('seniBudaya', e.target.value)}
                  className={`w-20 p-1.5 text-center font-mono font-bold rounded border outline-none ${
                    scores.seniBudaya !== ''
                      ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* 9. PJOK */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">9. PJOK</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.pjok}
                  placeholder="Kosong"
                  onChange={(e) => handleScoreChange('pjok', e.target.value)}
                  className={`w-20 p-1.5 text-center font-mono font-bold rounded border outline-none ${
                    scores.pjok !== ''
                      ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* 10. Informatika */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <label className="font-semibold text-slate-700">10. Informatika</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.informatika}
                  placeholder="Kosong"
                  onChange={(e) => handleScoreChange('informatika', e.target.value)}
                  className={`w-20 p-1.5 text-center font-mono font-bold rounded border outline-none ${
                    scores.informatika !== ''
                      ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } focus:ring-2 focus:ring-emerald-500`}
                />
              </div>

              {/* 11. Mulok Bahasa Jawa */}
              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 sm:col-span-2">
                <label className="font-semibold text-slate-700">11. Mulok Bahasa Jawa (DIY)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scores.bahasaJawa}
                  placeholder="Kosong"
                  onChange={(e) => handleScoreChange('bahasaJawa', e.target.value)}
                  className={`w-20 p-1.5 text-center font-mono font-bold rounded border outline-none ${
                    scores.bahasaJawa !== ''
                      ? 'bg-emerald-50/60 border-emerald-400 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  } focus:ring-2 focus:ring-emerald-500`}
                />
              </div>
            </div>
          </div>

          {/* Presensi & Sikap */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Presensi */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <h5 className="font-bold text-slate-800 text-xs">Presensi Kehadiran Semester {activeSemester} (Hari)</h5>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Sakit (S)</label>
                  <input
                    type="number"
                    min="0"
                    value={kehadiran.sakit}
                    onChange={(e) => handleAttendanceChange('sakit', e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono text-center font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Izin (I)</label>
                  <input
                    type="number"
                    min="0"
                    value={kehadiran.izin}
                    onChange={(e) => handleAttendanceChange('izin', e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono text-center font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-600 mb-1">Alpa (A)</label>
                  <input
                    type="number"
                    min="0"
                    value={kehadiran.tanpaKeterangan}
                    onChange={(e) => handleAttendanceChange('tanpaKeterangan', e.target.value)}
                    className="w-full p-1.5 border border-slate-300 rounded font-mono text-center font-bold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Sikap */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <h5 className="font-bold text-slate-800 text-xs">Predikat Sikap Semester {activeSemester}</h5>
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
              Catatan Wali Kelas / Capaian Kompetensi Semester {activeSemester}
            </label>
            <textarea
              rows={2}
              value={scores.catatan || ''}
              onChange={(e) => handleScoreChange('catatan', e.target.value)}
              placeholder="Catatan kemajuan capaian kompetensi belajar siswa..."
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 outline-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Batal & Tutup
            </button>

            <div className="flex items-center gap-2">
              {activeSemester < 6 && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, true)}
                  className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan & Lanjut Smt {activeSemester + 1}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Nilai Semester {activeSemester}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
