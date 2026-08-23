import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Award,
  ShieldCheck,
  HeartHandshake,
  MapPin,
  TrendingUp,
  UserCheck,
  FileText,
  CreditCard,
  Sparkles,
  ArrowRight,
  BookOpen,
  School,
  CheckCircle2,
  Printer,
  FileSpreadsheet,
  Building2,
  ChevronRight,
  BadgeCheck,
} from 'lucide-react';
import { Student, SchoolProfile, ActiveTab } from '../types';
import { MonthlyReportModal } from './MonthlyReportModal';
import { DashboardCharts } from './DashboardCharts';

interface DashboardViewProps {
  students: Student[];
  schoolProfile: SchoolProfile;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectStudent: (student: Student) => void;
  onOpenNewStudent?: () => void;
  onOpenAiChat: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  schoolProfile,
  setActiveTab,
  onSelectStudent,
  onOpenNewStudent,
  onOpenAiChat,
}) => {
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);

  // Top achievements
  const allAchievements = students.flatMap((s) =>
    (s.prestasi || []).map((p) => ({
      ...p,
      studentName: s.namaLengkap,
      studentClass: s.kelasSekarang,
      studentId: s.id,
      studentPhoto: s.fotoUrl,
    }))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Executive Institutional Header */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Buku Induk Resmi Kemendikbudristek RI</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
              <span>NPSN:</span> <strong className="font-mono">{schoolProfile.npsn}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-xs font-semibold border border-blue-200">
              <span>Akreditasi:</span> <strong>{schoolProfile.akreditasi}</strong>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
              <span>Tahun Ajaran:</span> <strong>{schoolProfile.tahunAjaranAktif}</strong>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Buku Induk Siswa — {schoolProfile.namaSekolah}
          </h1>

          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            {schoolProfile.alamat}, Kelurahan {schoolProfile.kelurahan}, Kec. {schoolProfile.kecamatan}, Kab. {schoolProfile.kabupaten}, {schoolProfile.provinsi}.
            {schoolProfile.motto && <span className="italic ml-1">&ldquo;{schoolProfile.motto}&rdquo;</span>}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsMonthlyReportOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Laporan Bulanan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('buku-induk')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-300" />
            <span>Master Data Siswa</span>
          </button>
        </div>
      </div>

      {/* Interactive Pie Charts & Visual Analytics Section */}
      <DashboardCharts students={students} schoolProfile={schoolProfile} />

      {/* Detailed Operational Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Student Master Records */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Student Master Records */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
              <div>
                <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Daftar Siswa Terdaftar Terbaru</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Entri Buku Induk terakhir yang tersimpan dan terverifikasi
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('buku-induk')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Lihat Seluruh Siswa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="px-4 py-3">NISN</th>
                    <th className="px-4 py-3">Nama Lengkap Siswa</th>
                    <th className="px-4 py-3">L/P</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Jalur PPDB</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {students.slice(0, 8).map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onSelectStudent(student)}
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-slate-600">
                        {student.nisn || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={student.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={student.namaLengkap}
                            className="w-7 h-7 rounded-md object-cover border border-slate-200 shrink-0"
                          />
                          <span className="font-bold text-slate-900">{student.namaLengkap}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${student.jenisKelamin === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                          {student.jenisKelamin === 'L' ? 'L' : 'P'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {student.kelasSekarang || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {student.jalurMasuk || 'Zonasi'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                            student.status === 'Aktif'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : student.status === 'Mutasi'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : student.status === 'Lulus'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStudent(student);
                          }}
                          className="px-2 py-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition cursor-pointer"
                        >
                          Buka Lembar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Prestasi Siswa & Informasi Verifikator Buku Induk */}
        <div className="space-y-6">
          {/* Spotlight Prestasi Siswa */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Prestasi Siswa Terpilih
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Catatan rekam jejak kejuaraan resmi yang terdaftar di Buku Induk
            </p>

            <div className="space-y-2.5">
              {allAchievements.slice(0, 4).map((pres) => (
                <div
                  key={pres.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 hover:border-blue-300 transition cursor-pointer"
                  onClick={() => {
                    const st = students.find((s) => s.id === pres.studentId);
                    if (st) onSelectStudent(st);
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                      {pres.juara}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{pres.tahun}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-1.5 line-clamp-2">
                    {pres.namaPrestasi}
                  </h4>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">{pres.studentName} ({pres.studentClass})</span>
                    <span className="text-slate-500 font-medium">{pres.tingkat}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pengelola & Verifikasi Buku Induk */}
          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl shadow-xs border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-emerald-400">
              <BadgeCheck className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Pejabat Pengesah Buku Induk
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-800/90 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Kepala Sekolah
                </span>
                <div className="font-bold text-white text-sm mt-0.5">
                  {schoolProfile.kepalaSekolah}
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  NIP. {schoolProfile.nipKepalaSekolah}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-800/90 border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Pengelola Buku Induk (Kepala TU)
                </span>
                <div className="font-bold text-white text-sm mt-0.5">
                  {schoolProfile.pengelolaBukuInduk}
                </div>
                <div className="text-slate-400 font-mono text-[11px]">
                  NIP. {schoolProfile.nipPengelolaBukuInduk}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Status: <strong className="text-emerald-400 font-semibold">Terverifikasi</strong></span>
              <span>Dokumen: <strong className="text-slate-200 font-semibold">Resmi RI</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Report Modal */}
      {isMonthlyReportOpen && (
        <MonthlyReportModal
          isOpen={isMonthlyReportOpen}
          students={students}
          schoolProfile={schoolProfile}
          onClose={() => setIsMonthlyReportOpen(false)}
        />
      )}
    </div>
  );
};
