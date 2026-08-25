import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  Filter,
  Award,
  TrendingUp,
  Edit,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Student, SchoolProfile, UserAccount } from '../types';
import { PrintGuideBanner } from './PrintGuideBanner';
import { OfficialKopSurat } from './OfficialKopSurat';
import { ImportScoreExcelModal } from './ImportScoreExcelModal';
import { generateScoreReportExcelTemplate } from '../utils/excelImporter';

interface LegerScoreViewProps {
  students: Student[];
  schoolProfile: SchoolProfile;
  currentUser?: UserAccount | null;
  onSelectStudent: (student: Student) => void;
  onEditScores?: (student: Student, semester: number) => void;
  onImportScores?: (updatedStudents: Student[], count: number) => void;
}

export const LegerScoreView: React.FC<LegerScoreViewProps> = ({
  students,
  schoolProfile,
  currentUser,
  onSelectStudent,
  onEditScores,
  onImportScores,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('7A');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Check permissions: Petugas TU and Admin can import/edit scores
  const canEditOrImport =
    !currentUser ||
    currentUser.role === 'admin' ||
    currentUser.role === 'petugas_tu' ||
    currentUser.role === 'guru_wali' ||
    currentUser.permissions?.canEditScores ||
    currentUser.permissions?.canImportExcel;

  // Available classes sorted naturally (7A-9D)
  const classesList = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.kelasSekarang) set.add(s.kelasSekarang);
    });
    return Array.from(set).sort((a, b) => {
      const matchA = a.match(/^(\d+)([A-Za-z]*)/);
      const matchB = b.match(/^(\d+)([A-Za-z]*)/);
      if (matchA && matchB) {
        const numA = parseInt(matchA[1], 10);
        const numB = parseInt(matchB[1], 10);
        if (numA !== numB) return numA - numB;
        return (matchA[2] || '').localeCompare(matchB[2] || '');
      }
      return a.localeCompare(b);
    });
  }, [students]);

  // Filter students for the class and compile scores strictly without fake default scores
  const classStudents = useMemo(() => {
    return students
      .filter((s) => s.kelasSekarang === selectedClass && s.status === 'Aktif')
      .map((s) => {
        const report = s.semesterReports?.find((r) => r.semester === selectedSemester);
        const scores = report?.scores || {};

        const scoreValues = [
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
        ].filter((v): v is number => typeof v === 'number' && !isNaN(v));

        const filledCount = scoreValues.length;
        const hasAnyScore = filledCount > 0;
        const totalScore = hasAnyScore ? scoreValues.reduce((a, b) => a + b, 0) : 0;
        const average = hasAnyScore ? Number((totalScore / filledCount).toFixed(1)) : 0;

        return {
          ...s,
          currentReport: report,
          scores,
          filledCount,
          hasAnyScore,
          totalScore,
          average,
        };
      })
      .sort((a, b) => {
        // Students with scores come first, sorted by totalScore descending
        if (a.hasAnyScore && !b.hasAnyScore) return -1;
        if (!a.hasAnyScore && b.hasAnyScore) return 1;
        if (a.totalScore !== b.totalScore) return b.totalScore - a.totalScore;
        return a.namaLengkap.localeCompare(b.namaLengkap);
      });
  }, [students, selectedClass, selectedSemester]);

  // Class stats
  const { totalStudentsInClass, studentsWithScores, classAverage } = useMemo(() => {
    const total = classStudents.length;
    const withScores = classStudents.filter((s) => s.hasAnyScore);
    const avgSum = withScores.reduce((acc, curr) => acc + curr.average, 0);
    const classAvg = withScores.length > 0 ? Number((avgSum / withScores.length).toFixed(1)) : 0;

    return {
      totalStudentsInClass: total,
      studentsWithScores: withScores.length,
      classAverage: classAvg,
    };
  }, [classStudents]);

  // Download Excel template populated from database
  const handleDownloadExcelTemplate = () => {
    generateScoreReportExcelTemplate(students, selectedClass, selectedSemester);
  };

  // Export Leger to CSV
  const handleExportLeger = () => {
    const headers = [
      'Peringkat',
      'No Induk',
      'NISN',
      'Nama Siswa',
      'L/P',
      'Status Pengisian',
      'PAI',
      'PPKn',
      'B.Indo',
      'Matematika',
      'IPA',
      'IPS',
      'B.Inggris',
      'Seni Budaya',
      'PJOK',
      'Informatika',
      'B.Jawa',
      'Total Nilai',
      'Rata-rata',
    ];

    const rows = classStudents.map((s, idx) => [
      s.hasAnyScore ? idx + 1 : '-',
      `"${s.noUrutInduk}"`,
      `"${s.nisn}"`,
      `"${s.namaLengkap}"`,
      s.jenisKelamin,
      s.filledCount === 11 ? 'Lengkap' : s.filledCount > 0 ? `${s.filledCount}/11 Mapel` : 'Kosong',
      s.scores.pai ?? '',
      s.scores.pancasila ?? '',
      s.scores.bahasaIndonesia ?? '',
      s.scores.matematika ?? '',
      s.scores.ipa ?? '',
      s.scores.ips ?? '',
      s.scores.bahasaInggris ?? '',
      s.scores.seniBudaya ?? '',
      s.scores.pjok ?? '',
      s.scores.informatika ?? '',
      s.scores.bahasaJawa ?? '',
      s.hasAnyScore ? s.totalScore : '',
      s.hasAnyScore ? s.average : '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `LEGER_NILAI_KELAS_${selectedClass}_SEM_${selectedSemester}_SMPN2KASIHAN.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Rekapitulasi Leger Nilai & Peringkat Kelas</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {studentsWithScores}/{totalStudentsInClass} Siswa Terisi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekapitulasi nilai rapor 11 mata pelajaran Kurikulum Merdeka • SMP Negeri 2 Kasihan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kelas */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Kelas:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2 py-1 rounded border border-slate-300 text-xs bg-white font-bold text-emerald-800 cursor-pointer outline-none"
              >
                {classesList.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Semester */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <span className="text-xs font-semibold text-slate-600">Semester:</span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="px-2 py-1 rounded border border-slate-300 text-xs bg-white font-bold text-slate-800 cursor-pointer outline-none"
              >
                <option value={1}>Semester 1 (VII Ganjil)</option>
                <option value={2}>Semester 2 (VII Genap)</option>
                <option value={3}>Semester 3 (VIII Ganjil)</option>
                <option value={4}>Semester 4 (VIII Genap)</option>
                <option value={5}>Semester 5 (IX Ganjil)</option>
                <option value={6}>Semester 6 (IX Genap)</option>
              </select>
            </div>

            {/* Import & Template Actions for TU and Admin */}
            {canEditOrImport && (
              <>
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition shadow-2xs cursor-pointer"
                  title="Unduh format template Excel nilai kelas ini berdasarkan data siswa di database"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Format Excel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition cursor-pointer"
                  title="Impor nilai rapor kelas ini dari file Excel"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Impor Nilai Excel</span>
                </button>
              </>
            )}

            <button
              onClick={handleExportLeger}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Leger</span>
            </button>
          </div>
        </div>
      </div>

      {/* Print Instructions Banner */}
      <PrintGuideBanner />

      {/* Printable Kop Surat for Leger */}
      <div className="hidden print:block mb-4">
        <OfficialKopSurat
          schoolProfile={schoolProfile}
          subTitle={`LEGER NILAI HASIL BELAJAR PESERTA DIDIK • KELAS ${selectedClass} • SEMESTER ${selectedSemester} • TP ${schoolProfile.tahunAjaranAktif}`}
        />
      </div>

      {/* Leger Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="text-xs flex items-center gap-3">
            <span className="font-bold text-slate-800 text-sm">
              LEGER KELAS {selectedClass} — SEMESTER {selectedSemester}
            </span>
            <span className="text-slate-500 font-medium">
              (Tahun Ajaran {schoolProfile.tahunAjaranAktif}) • Total Siswa: <strong>{classStudents.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1 text-slate-600">
              <span>Rata-rata Kelas:</span>
              <strong className="text-emerald-700 font-mono font-bold">
                {classAverage > 0 ? classAverage : '-'}
              </strong>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
              KKTP Standar: 75.0
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-center">
                <th className="py-2.5 px-2 w-10">Pkt</th>
                <th className="py-2.5 px-2 text-left w-24">No Induk</th>
                <th className="py-2.5 px-2 text-left">Nama Siswa</th>
                <th className="py-2.5 px-1.5 w-8">L/P</th>
                <th className="py-2.5 px-2 w-20 text-center">Status</th>
                <th className="py-2.5 px-1.5 bg-emerald-50/50">PAI</th>
                <th className="py-2.5 px-1.5 bg-emerald-50/50">PPKn</th>
                <th className="py-2.5 px-1.5 bg-emerald-50/50">B.Ind</th>
                <th className="py-2.5 px-1.5 bg-emerald-50/50">Mat</th>
                <th className="py-2.5 px-1.5 bg-emerald-50/50">IPA</th>
                <th className="py-2.5 px-1.5 bg-emerald-50/50">IPS</th>
                <th className="py-2.5 px-1.5 bg-emerald-50/50">B.Ing</th>
                <th className="py-2.5 px-1.5 bg-emerald-50/50">Seni</th>
                <th className="py-2.5 px-1.5 bg-emerald-50/50">PJOK</th>
                <th className="py-2.5 px-1.5 bg-emerald-50/50">Infor</th>
                <th className="py-2.5 px-1.5 bg-emerald-50/50">B.Jw</th>
                <th className="py-2.5 px-2 bg-slate-200 font-bold">Total</th>
                <th className="py-2.5 px-2 bg-emerald-200 text-emerald-950 font-bold">Rata2</th>
                <th className="py-2.5 px-2 text-center w-20 print:hidden">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-center">
              {classStudents.map((st, index) => {
                const rank = st.hasAnyScore ? index + 1 : null;
                const isTop3 = rank !== null && rank <= 3;

                return (
                  <tr
                    key={st.id}
                    onClick={() => onSelectStudent(st)}
                    className={`hover:bg-slate-50 cursor-pointer transition ${
                      isTop3 ? 'bg-amber-50/30' : !st.hasAnyScore ? 'bg-slate-50/40 text-slate-400' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-2 px-2 font-bold">
                      {rank === 1 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 inline-flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          1
                        </span>
                      ) : rank === 2 ? (
                        <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-900 inline-flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          2
                        </span>
                      ) : rank === 3 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-600 text-white inline-flex items-center justify-center text-[10px] font-bold shadow-2xs">
                          3
                        </span>
                      ) : rank !== null ? (
                        <span className="text-slate-600">{rank}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>

                    {/* No Induk */}
                    <td className="py-2 px-2 text-left font-mono font-medium text-slate-700">
                      {st.noUrutInduk}
                    </td>

                    {/* Nama */}
                    <td className="py-2 px-2 text-left font-semibold text-slate-900 flex items-center gap-2">
                      <img
                        src={st.fotoUrl}
                        alt={st.namaLengkap}
                        className="w-5 h-5 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <span className="hover:text-emerald-600 truncate max-w-[180px]">
                        {st.namaLengkap}
                      </span>
                    </td>

                    {/* Gender */}
                    <td className="py-2 px-1.5 font-bold">
                      <span className={st.jenisKelamin === 'L' ? 'text-blue-600' : 'text-pink-600'}>
                        {st.jenisKelamin}
                      </span>
                    </td>

                    {/* Status Pengisian */}
                    <td className="py-2 px-1.5 text-center">
                      {st.filledCount === 11 ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Lengkap
                        </span>
                      ) : st.filledCount > 0 ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          {st.filledCount}/11
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                          Kosong
                        </span>
                      )}
                    </td>

                    {/* Scores */}
                    <td className="py-2 px-1.5 font-mono">{st.scores.pai ?? '-'}</td>
                    <td className="py-2 px-1.5 font-mono">{st.scores.pancasila ?? '-'}</td>
                    <td className="py-2 px-1.5 font-mono">{st.scores.bahasaIndonesia ?? '-'}</td>
                    <td className="py-2 px-1.5 font-mono">{st.scores.matematika ?? '-'}</td>
                    <td className="py-2 px-1.5 font-mono">{st.scores.ipa ?? '-'}</td>
                    <td className="py-2 px-1.5 font-mono">{st.scores.ips ?? '-'}</td>
                    <td className="py-2 px-1.5 font-mono">{st.scores.bahasaInggris ?? '-'}</td>
                    <td className="py-2 px-1.5 font-mono">{st.scores.seniBudaya ?? '-'}</td>
                    <td className="py-2 px-1.5 font-mono">{st.scores.pjok ?? '-'}</td>
                    <td className="py-2 px-1.5 font-mono">{st.scores.informatika ?? '-'}</td>
                    <td className="py-2 px-1.5 font-mono">{st.scores.bahasaJawa ?? '-'}</td>

                    {/* Total & Average */}
                    <td className="py-2 px-2 font-mono font-bold bg-slate-100/70 text-slate-900">
                      {st.hasAnyScore ? st.totalScore : '-'}
                    </td>
                    <td className="py-2 px-2 font-mono font-extrabold bg-emerald-50 text-emerald-800">
                      {st.hasAnyScore ? st.average : '-'}
                    </td>

                    {/* Action Column */}
                    <td className="py-2 px-2 text-center print:hidden" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => (onEditScores ? onEditScores(st, selectedSemester) : onSelectStudent(st))}
                        className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded border border-blue-200 text-[11px] font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                        title="Edit nilai siswa ini"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Official Signatures Block */}
      <div className="hidden print:grid grid-cols-2 gap-8 pt-8 text-xs text-slate-800">
        <div className="text-center space-y-12">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala {schoolProfile.namaSekolah}</p>
          </div>
          <div>
            <p className="font-bold underline uppercase">
              {schoolProfile.kepalaSekolah || '-'}
            </p>
            <p className="text-[11px] font-mono">NIP. {schoolProfile.nipKepalaSekolah || '-'}</p>
          </div>
        </div>

        <div className="text-center space-y-12">
          <div>
            <p>
              {schoolProfile.kabupaten || 'Bantul'},{' '}
              {new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="font-bold">Wali Kelas {selectedClass}</p>
          </div>
          <div>
            <p className="font-bold underline">( Wali Kelas {selectedClass} )</p>
            <p className="text-[11px]">NIP / NUPTK. -</p>
          </div>
        </div>
      </div>

      {/* Import Score Excel Modal */}
      {isImportModalOpen && (
        <ImportScoreExcelModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          students={students}
          selectedClass={selectedClass}
          selectedSemester={selectedSemester}
          onApplyImport={(updated, count) => {
            if (onImportScores) {
              onImportScores(updated, count);
            }
            setIsImportModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
