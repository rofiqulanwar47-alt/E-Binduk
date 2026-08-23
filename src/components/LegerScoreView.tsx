import React, { useState, useMemo } from 'react';
import { FileSpreadsheet, Download, Printer, Filter, Award, TrendingUp, Edit } from 'lucide-react';
import { Student, SchoolProfile } from '../types';
import { PrintGuideBanner } from './PrintGuideBanner';
import { OfficialKopSurat } from './OfficialKopSurat';

interface LegerScoreViewProps {
  students: Student[];
  schoolProfile: SchoolProfile;
  onSelectStudent: (student: Student) => void;
  onEditScores?: (student: Student, semester: number) => void;
}

export const LegerScoreView: React.FC<LegerScoreViewProps> = ({
  students,
  schoolProfile,
  onSelectStudent,
  onEditScores,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('7A');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);

  // Available classes sorted naturally (7A-9H)
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

  // Filter students for the class and compile scores
  const classStudents = useMemo(() => {
    return students
      .filter((s) => s.kelasSekarang === selectedClass && s.status === 'Aktif')
      .map((s) => {
        const report = s.semesterReports?.find((r) => r.semester === selectedSemester);
        const scores = report?.scores || {
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
        };

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
        ].filter((v): v is number => typeof v === 'number');

        const totalScore = scoreValues.reduce((a, b) => a + b, 0);
        const average = scoreValues.length > 0 ? Number((totalScore / scoreValues.length).toFixed(1)) : 0;

        return {
          ...s,
          currentReport: report,
          scores,
          totalScore,
          average,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore); // Sort by total descending
  }, [students, selectedClass, selectedSemester]);

  // Export Leger to CSV
  const handleExportLeger = () => {
    const headers = [
      'Peringkat',
      'No Induk',
      'NISN',
      'Nama Siswa',
      'L/P',
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
      idx + 1,
      `"${s.noUrutInduk}"`,
      `"${s.nisn}"`,
      `"${s.namaLengkap}"`,
      s.jenisKelamin,
      s.scores.pai || 0,
      s.scores.pancasila || 0,
      s.scores.bahasaIndonesia || 0,
      s.scores.matematika || 0,
      s.scores.ipa || 0,
      s.scores.ips || 0,
      s.scores.bahasaInggris || 0,
      s.scores.seniBudaya || 0,
      s.scores.pjok || 0,
      s.scores.informatika || 0,
      s.scores.bahasaJawa || 0,
      s.totalScore,
      s.average,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LEGER_NILAI_KELAS_${selectedClass}_SEM_${selectedSemester}_SMPN2KASIHAN.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header Card */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              <span>Rekapitulasi Leger Nilai & Peringkat Kelas</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar nilai rapor per mata pelajaran standar Kurikulum Merdeka • SMP Negeri 2 Kasihan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Kelas */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-600">Kelas:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-bold text-emerald-800"
              >
                {classesList.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Semester */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-600">Semester:</span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white font-semibold"
              >
                <option value={1}>Semester 1 (Ganjil)</option>
                <option value={2}>Semester 2 (Genap)</option>
                <option value={3}>Semester 3</option>
                <option value={4}>Semester 4</option>
                <option value={5}>Semester 5</option>
                <option value={6}>Semester 6</option>
              </select>
            </div>

            <button
              onClick={handleExportLeger}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Leger CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF Leger</span>
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
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="text-xs">
            <span className="font-bold text-slate-800 text-sm">
              LEGER KELAS {selectedClass} — SEMESTER {selectedSemester}
            </span>
            <span className="text-slate-500 ml-2 font-medium">
              (Tahun Ajaran {schoolProfile.tahunAjaranAktif}) • Total Siswa: <strong>{classStudents.length}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
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
                const rank = index + 1;
                const isTop3 = rank <= 3;

                return (
                  <tr
                    key={st.id}
                    onClick={() => onSelectStudent(st)}
                    className={`hover:bg-slate-50 cursor-pointer transition ${
                      isTop3 ? 'bg-amber-50/30' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-2 px-2 font-bold">
                      {rank === 1 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 inline-flex items-center justify-center text-[10px] font-bold">
                          1
                        </span>
                      ) : rank === 2 ? (
                        <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-900 inline-flex items-center justify-center text-[10px] font-bold">
                          2
                        </span>
                      ) : rank === 3 ? (
                        <span className="w-5 h-5 rounded-full bg-amber-600 text-white inline-flex items-center justify-center text-[10px] font-bold">
                          3
                        </span>
                      ) : (
                        <span className="text-slate-500">{rank}</span>
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
                      <span className="hover:text-emerald-600 truncate max-w-[180px]">{st.namaLengkap}</span>
                    </td>

                    {/* Gender */}
                    <td className="py-2 px-1.5 font-bold">
                      <span className={st.jenisKelamin === 'L' ? 'text-blue-600' : 'text-pink-600'}>
                        {st.jenisKelamin}
                      </span>
                    </td>

                    {/* Scores */}
                    <td className="py-2 px-1.5">{st.scores.pai || '-'}</td>
                    <td className="py-2 px-1.5">{st.scores.pancasila || '-'}</td>
                    <td className="py-2 px-1.5">{st.scores.bahasaIndonesia || '-'}</td>
                    <td className="py-2 px-1.5">{st.scores.matematika || '-'}</td>
                    <td className="py-2 px-1.5">{st.scores.ipa || '-'}</td>
                    <td className="py-2 px-1.5">{st.scores.ips || '-'}</td>
                    <td className="py-2 px-1.5">{st.scores.bahasaInggris || '-'}</td>
                    <td className="py-2 px-1.5">{st.scores.seniBudaya || '-'}</td>
                    <td className="py-2 px-1.5">{st.scores.pjok || '-'}</td>
                    <td className="py-2 px-1.5">{st.scores.informatika || '-'}</td>
                    <td className="py-2 px-1.5">{st.scores.bahasaJawa || '-'}</td>

                    {/* Total & Average */}
                    <td className="py-2 px-2 font-mono font-bold bg-slate-100/70 text-slate-900">
                      {st.totalScore}
                    </td>
                    <td className="py-2 px-2 font-mono font-extrabold bg-emerald-50 text-emerald-800">
                      {st.average}
                    </td>

                    {/* Action Column */}
                    <td className="py-2 px-2 text-center print:hidden" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => (onEditScores ? onEditScores(st, selectedSemester) : onSelectStudent(st))}
                        className="px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded border border-blue-200 text-[11px] font-bold transition flex items-center justify-center gap-1 mx-auto"
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
            <p className="font-bold underline uppercase">{schoolProfile.kepalaSekolah || (schoolProfile as any).namaKepalaSekolah || 'Drs. Tri Giyanto, M.Pd.'}</p>
            <p className="text-[11px] font-mono">NIP. {schoolProfile.nipKepalaSekolah || '-'}</p>
          </div>
        </div>

        <div className="text-center space-y-12">
          <div>
            <p>Bantul, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">Wali Kelas {selectedClass}</p>
          </div>
          <div>
            <p className="font-bold underline">( Wali Kelas {selectedClass} )</p>
            <p className="text-[11px]">NIP / NUPTK. -</p>
          </div>
        </div>
      </div>
    </div>
  );
};
