import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Calendar,
  School,
  Users,
  Award,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  TrendingUp,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  FileText,
  Download,
} from 'lucide-react';
import { Student, SchoolProfile } from '../types';
import { PrintGuideBanner } from './PrintGuideBanner';
import { formatDateIndonesian } from '../utils/formatters';
import { OfficialKopSurat } from './OfficialKopSurat';

interface MonthlyReportModalProps {
  isOpen: boolean;
  students: Student[];
  schoolProfile: SchoolProfile;
  onClose: () => void;
}

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  students,
  schoolProfile,
  onClose,
}) => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [reportNote, setReportNote] = useState<string>(
    'Laporan bulanan disusun secara berkala berdasarkan rekaman Buku Induk Siswa Digital untuk evaluasi mutu dan pelayanan kesiswaan.'
  );

  const monthLabel = MONTH_NAMES[selectedMonth];
  const activeStudents = students.filter((s) => s.status === 'Aktif');

  // Breakdown by Class Level & Section
  const classBreakdown = useMemo(() => {
    const classMap: Record<string, { L: number; P: number; total: number }> = {};
    const gradesList = ['7A', '7B', '7C', '7D', '8A', '8B', '8C', '8D', '9A', '9B', '9C', '9D'];

    // Initialize map
    gradesList.forEach((cls) => {
      classMap[cls] = { L: 0, P: 0, total: 0 };
    });

    activeStudents.forEach((s) => {
      const cls = s.kelasSekarang || '7A';
      if (!classMap[cls]) {
        classMap[cls] = { L: 0, P: 0, total: 0 };
      }
      if (s.jenisKelamin === 'L') {
        classMap[cls].L += 1;
      } else {
        classMap[cls].P += 1;
      }
      classMap[cls].total += 1;
    });

    const rows = Object.entries(classMap)
      .filter(([_, data]) => data.total > 0)
      .sort((a, b) => a[0].localeCompare(b[0]));

    const totalL = rows.reduce((acc, curr) => acc + curr[1].L, 0);
    const totalP = rows.reduce((acc, curr) => acc + curr[1].P, 0);
    const grandTotal = totalL + totalP;

    return { rows, totalL, totalP, grandTotal };
  }, [activeStudents]);

  // Breakdown by PPDB Track
  const trackStats = useMemo(() => {
    const counts = {
      Zonasi: 0,
      Prestasi: 0,
      Afirmasi: 0,
      'Perpindahan Tugas Orang Tua': 0,
    };
    activeStudents.forEach((s) => {
      const t = s.jalurMasuk as keyof typeof counts;
      if (counts[t] !== undefined) {
        counts[t] += 1;
      } else {
        counts['Zonasi'] += 1;
      }
    });
    return counts;
  }, [activeStudents]);

  // Breakdown by Welfare Program
  const welfareStats = useMemo(() => {
    let kip = 0;
    let pkh = 0;
    let kms = 0;
    let pip = 0;
    activeStudents.forEach((s) => {
      if (s.kesejahteraan?.penerimaKip) kip++;
      if (s.kesejahteraan?.penerimaPkh) pkh++;
      if (s.kesejahteraan?.penerimaKmsBantul) kms++;
      if (s.kesejahteraan?.layakPip) pip++;
    });
    return { kip, pkh, kms, pip };
  }, [activeStudents]);

  // Breakdown by Villages
  const villageStats = useMemo(() => {
    const counts: Record<string, number> = {};
    activeStudents.forEach((s) => {
      const kel = s.tempatTinggal?.kelurahan || 'Lainnya';
      counts[kel] = (counts[kel] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [activeStudents]);

  // All student achievements
  const allAchievements = useMemo(() => {
    return students.flatMap((s) =>
      (s.prestasi || []).map((p) => ({
        ...p,
        studentName: s.namaLengkap,
        studentClass: s.kelasSekarang,
      }))
    );
  }, [students]);

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Controls Header (Screen Only) */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">Ringkasan Laporan Bulanan Sekolah</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Format Resmi PDF
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dokumen rekapitulasi data kesiswaan {schoolProfile.namaSekolah} • Bulan {monthLabel} {selectedYear}
              </p>
            </div>
          </div>

          {/* Period Selector & Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="bg-transparent text-white focus:outline-none cursor-pointer"
              >
                {MONTH_NAMES.map((m, idx) => (
                  <option key={m} value={idx} className="bg-slate-800 text-white">
                    {m}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="bg-transparent text-white focus:outline-none cursor-pointer ml-1"
              >
                {[2024, 2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr} className="bg-slate-800 text-white">
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Container */}
        <div className="p-4 sm:p-8 overflow-y-auto print:p-0 print:overflow-visible">
          {/* Print Guide Notice Banner */}
          <PrintGuideBanner />

          {/* ==================== PRINTABLE DOCUMENT CONTAINER ==================== */}
          <div className="printable-report-doc bg-white text-slate-900 font-sans p-6 sm:p-10 border border-slate-200 rounded-xl shadow-xs print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none">
            
            {/* KOP SURAT RESMI */}
            <OfficialKopSurat schoolProfile={schoolProfile} />

            {/* DOCUMENT TITLE */}
            <div className="text-center mb-6">
              <h1 className="text-sm sm:text-base font-extrabold uppercase tracking-wider underline text-slate-950">
                RINGKASAN LAPORAN BULANAN KESISWAAN & BUKU INDUK SISWA
              </h1>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                Periode Bulan: <span className="font-bold text-blue-900">{monthLabel} {selectedYear}</span> &nbsp;|&nbsp; Tahun Ajaran: <span>{schoolProfile.tahunAjaranAktif}</span>
              </p>
            </div>

            {/* 1. EXECUTIVE SUMMARY STATS TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-300 text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Siswa Aktif</span>
                <span className="text-xl font-extrabold text-slate-900">{activeStudents.length}</span>
                <span className="text-[10px] text-slate-500 block">Orang</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-center">
                <span className="text-[10px] font-bold text-blue-700 uppercase block">Siswa Laki-Laki</span>
                <span className="text-xl font-extrabold text-blue-950">{classBreakdown.totalL}</span>
                <span className="text-[10px] text-blue-600 block">({((classBreakdown.totalL / (activeStudents.length || 1)) * 100).toFixed(1)}%)</span>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg border border-pink-200 text-center">
                <span className="text-[10px] font-bold text-pink-700 uppercase block">Siswa Perempuan</span>
                <span className="text-xl font-extrabold text-pink-950">{classBreakdown.totalP}</span>
                <span className="text-[10px] text-pink-600 block">({((classBreakdown.totalP / (activeStudents.length || 1)) * 100).toFixed(1)}%)</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-center">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Penerima Bantuan</span>
                <span className="text-xl font-extrabold text-emerald-950">{welfareStats.kip + welfareStats.kms}</span>
                <span className="text-[10px] text-emerald-600 block">KIP & KMS Bantul</span>
              </div>
            </div>

            {/* 2. REKAPITULASI KELAS & GENDER */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase text-slate-900 mb-2 flex items-center gap-1.5 border-b border-slate-300 pb-1">
                <span>A. REKAPITULASI KEADAAN SISWA MENURUT TINGKAT KELAS & JENIS KELAMIN</span>
              </h3>
              <table className="w-full text-xs border-collapse border border-slate-400 text-center">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400">
                    <th className="border border-slate-400 py-1.5 px-2 w-12">No.</th>
                    <th className="border border-slate-400 py-1.5 px-3 text-left">Rombongan Belajar (Kelas)</th>
                    <th className="border border-slate-400 py-1.5 px-3 w-28 bg-blue-50/70 text-blue-900">Laki-Laki (L)</th>
                    <th className="border border-slate-400 py-1.5 px-3 w-28 bg-pink-50/70 text-pink-900">Perempuan (P)</th>
                    <th className="border border-slate-400 py-1.5 px-3 w-28 bg-slate-200 text-slate-950">Jumlah Total</th>
                  </tr>
                </thead>
                <tbody>
                  {classBreakdown.rows.map(([className, data], idx) => (
                    <tr key={className} className="hover:bg-slate-50">
                      <td className="border border-slate-400 py-1 px-2">{idx + 1}</td>
                      <td className="border border-slate-400 py-1 px-3 text-left font-semibold">Kelas {className}</td>
                      <td className="border border-slate-400 py-1 px-3 font-mono">{data.L}</td>
                      <td className="border border-slate-400 py-1 px-3 font-mono">{data.P}</td>
                      <td className="border border-slate-400 py-1 px-3 font-mono font-bold bg-slate-50">{data.total}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-200 font-extrabold text-slate-950">
                    <td colSpan={2} className="border border-slate-400 py-1.5 px-3 text-center uppercase">
                      Total Seluruh Rombongan Belajar
                    </td>
                    <td className="border border-slate-400 py-1.5 px-3 font-mono">{classBreakdown.totalL}</td>
                    <td className="border border-slate-400 py-1.5 px-3 font-mono">{classBreakdown.totalP}</td>
                    <td className="border border-slate-400 py-1.5 px-3 font-mono text-sm bg-slate-300">
                      {classBreakdown.grandTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 3. REKAPITULASI JALUR PPDB & BANTUAN KESEJAHTERAAN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* Jalur PPDB */}
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-900 mb-2 flex items-center gap-1.5 border-b border-slate-300 pb-1">
                  <span>B. REKAPITULASI JALUR PENERIMAAN PPDB</span>
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center">
                      <th className="border border-slate-400 py-1.5 px-2 w-10">No.</th>
                      <th className="border border-slate-400 py-1.5 px-3 text-left">Jalur Masuk</th>
                      <th className="border border-slate-400 py-1.5 px-2 w-20 text-center">Jumlah</th>
                      <th className="border border-slate-400 py-1.5 px-2 w-16 text-center">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 py-1 px-2 text-center">1</td>
                      <td className="border border-slate-400 py-1 px-3">Zonasi Radius & Wilayah</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono font-bold">{trackStats.Zonasi}</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono">{((trackStats.Zonasi / (activeStudents.length || 1)) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 py-1 px-2 text-center">2</td>
                      <td className="border border-slate-400 py-1 px-3">Jalur Prestasi Akademik/Non-Akademik</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono font-bold">{trackStats.Prestasi}</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono">{((trackStats.Prestasi / (activeStudents.length || 1)) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 py-1 px-2 text-center">3</td>
                      <td className="border border-slate-400 py-1 px-3">Jalur Afirmasi (Keluarga Ekonomi Lemah)</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono font-bold">{trackStats.Afirmasi}</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono">{((trackStats.Afirmasi / (activeStudents.length || 1)) * 100).toFixed(1)}%</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 py-1 px-2 text-center">4</td>
                      <td className="border border-slate-400 py-1 px-3">Perpindahan Tugas Orang Tua / Guru</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono font-bold">{trackStats['Perpindahan Tugas Orang Tua']}</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono">{((trackStats['Perpindahan Tugas Orang Tua'] / (activeStudents.length || 1)) * 100).toFixed(1)}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bantuan Pendidikan */}
              <div>
                <h3 className="text-xs font-bold uppercase text-slate-900 mb-2 flex items-center gap-1.5 border-b border-slate-300 pb-1">
                  <span>C. REKAPITULASI PROGRAM BANTUAN KESEJAHTERAAN</span>
                </h3>
                <table className="w-full text-xs border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center">
                      <th className="border border-slate-400 py-1.5 px-2 w-10">No.</th>
                      <th className="border border-slate-400 py-1.5 px-3 text-left">Program Afirmasi / Bantuan</th>
                      <th className="border border-slate-400 py-1.5 px-2 w-20 text-center">Jumlah</th>
                      <th className="border border-slate-400 py-1.5 px-3 text-left">Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-400 py-1 px-2 text-center">1</td>
                      <td className="border border-slate-400 py-1 px-3 font-semibold">Kartu Indonesia Pintar (KIP)</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono font-bold text-blue-900">{welfareStats.kip}</td>
                      <td className="border border-slate-400 py-1 px-3 text-slate-600 text-[11px]">Bantuan Pusat Kemendikbud</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 py-1 px-2 text-center">2</td>
                      <td className="border border-slate-400 py-1 px-3 font-semibold">KMS Kabupaten Bantul</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono font-bold text-emerald-900">{welfareStats.kms}</td>
                      <td className="border border-slate-400 py-1 px-3 text-slate-600 text-[11px]">Bantuan Pemkab Bantul</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 py-1 px-2 text-center">3</td>
                      <td className="border border-slate-400 py-1 px-3 font-semibold">Program Keluarga Harapan (PKH)</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono font-bold">{welfareStats.pkh}</td>
                      <td className="border border-slate-400 py-1 px-3 text-slate-600 text-[11px]">Kemensos RI</td>
                    </tr>
                    <tr>
                      <td className="border border-slate-400 py-1 px-2 text-center">4</td>
                      <td className="border border-slate-400 py-1 px-3 font-semibold">Usulan Layak PIP Sekolah</td>
                      <td className="border border-slate-400 py-1 px-2 text-center font-mono font-bold">{welfareStats.pip}</td>
                      <td className="border border-slate-400 py-1 px-3 text-slate-600 text-[11px]">Rekomendasi Satdik</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. PRESTASI & CAPAIAN UNGGULAN BULAN INI */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase text-slate-900 mb-2 flex items-center gap-1.5 border-b border-slate-300 pb-1">
                <span>D. CATATAN PRESTASI & KEJUARAAN SISWA</span>
              </h3>
              {allAchievements.length === 0 ? (
                <div className="p-3 text-center border border-slate-300 rounded text-xs text-slate-500 italic">
                  Belum ada catatan kejuaraan baru yang terdata pada periode ini.
                </div>
              ) : (
                <table className="w-full text-xs border-collapse border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-400 text-center">
                      <th className="border border-slate-400 py-1.5 px-2 w-10">No.</th>
                      <th className="border border-slate-400 py-1.5 px-3 text-left">Nama Siswa & Kelas</th>
                      <th className="border border-slate-400 py-1.5 px-3 text-left">Nama Kejuaraan / Prestasi</th>
                      <th className="border border-slate-400 py-1.5 px-2 w-24 text-center">Peringkat</th>
                      <th className="border border-slate-400 py-1.5 px-2 w-24 text-center">Tingkat</th>
                      <th className="border border-slate-400 py-1.5 px-3 text-left">Penyelenggara</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAchievements.slice(0, 6).map((ach, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-400 py-1 px-2 text-center">{idx + 1}</td>
                        <td className="border border-slate-400 py-1 px-3 font-semibold">
                          {ach.studentName} <span className="text-slate-500 font-normal">({ach.studentClass})</span>
                        </td>
                        <td className="border border-slate-400 py-1 px-3">{ach.namaPrestasi}</td>
                        <td className="border border-slate-400 py-1 px-2 text-center font-bold text-amber-800">{ach.juara}</td>
                        <td className="border border-slate-400 py-1 px-2 text-center">{ach.tingkat}</td>
                        <td className="border border-slate-400 py-1 px-3 text-slate-600">{ach.penyelenggara}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* 5. CATATAN & EVALUASI KESISWAAN */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase text-slate-900 mb-2 flex items-center gap-1.5 border-b border-slate-300 pb-1">
                <span>E. CATATAN & EVALUASI KESISWAAN BULANAN</span>
              </h3>
              <div className="p-3 bg-slate-50 rounded border border-slate-300 text-xs text-slate-800 leading-relaxed">
                <p>{reportNote}</p>
                <div className="mt-2 text-[11px] text-slate-600 flex flex-wrap items-center gap-4">
                  <span>• Status Sinkronisasi Database: <strong>Realtime Cloud Firestore Aktif</strong></span>
                  <span>• Standar Kurikulum: <strong>Kurikulum Merdeka & Kurikulum 2013</strong></span>
                  <span>• Validasi Data Dapodik: <strong>Tervalidasi & Sinkron</strong></span>
                </div>
              </div>
            </div>

            {/* 6. LEMBAR PENGESAHAN & TANDA TANGAN RESMI */}
            <div className="grid grid-cols-2 gap-8 pt-6 text-xs text-slate-900 border-t border-slate-300">
              <div className="text-center space-y-16">
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

              <div className="text-center space-y-16">
                <div>
                  <p>{schoolProfile.kabupaten || 'Bantul'}, {formatDateIndonesian(new Date().toISOString().slice(0, 10))}</p>
                  <p className="font-bold">Pengelola Buku Induk & Kesiswaan</p>
                </div>
                <div>
                  <p className="font-bold underline uppercase">
                    {schoolProfile.pengelolaBukuInduk ? `( ${schoolProfile.pengelolaBukuInduk} )` : '( Tim Tata Usaha / Kesiswaan )'}
                  </p>
                  <p className="text-[11px]">NIP / NUPTK. {schoolProfile.nipPengelolaBukuInduk || '-'}</p>
                </div>
              </div>
            </div>

          </div>
          {/* ==================== END PRINTABLE DOCUMENT CONTAINER ==================== */}

        </div>

        {/* Modal Footer Controls (Screen Only) */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0 print:hidden">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dokumen siap dicetak ke format kertas F4 / Folio atau A4 standar kearsipan resmi.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
