import React, { useState } from 'react';
import {
  X,
  Printer,
  CreditCard,
  Edit,
  Sparkles,
  User,
  MapPin,
  Activity,
  GraduationCap,
  Users,
  HeartHandshake,
  BookOpen,
  Award,
  Calendar,
  CheckCircle2,
  FileText,
  Calculator,
} from 'lucide-react';
import { Student, SchoolProfile, UserAccount } from '../types';
import { calculateAge, formatDateIndonesian } from '../utils/formatters';

interface StudentDetailModalProps {
  student: Student | null;
  schoolProfile: SchoolProfile;
  currentUser?: UserAccount;
  onClose: () => void;
  onEdit: (student: Student) => void;
  onEditScores?: (student: Student, semester?: number) => void;
  onPrintMasterSheet: (student: Student) => void;
  onPrintCard: (student: Student) => void;
  onAnalyzeAi: (student: Student) => void;
}

type DetailTab = 'identitas' | 'alamat_jasmani' | 'pendidikan_ortu' | 'akademik_rapor' | 'prestasi_bk';

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  schoolProfile,
  currentUser,
  onClose,
  onEdit,
  onEditScores,
  onPrintMasterSheet,
  onPrintCard,
  onAnalyzeAi,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('identitas');

  if (!student) return null;

  const isKip = student.kesejahteraan?.penerimaKip || student.kesejahteraan?.penerimaKmsBantul;

  // Permission flags (default to true if currentUser not supplied)
  const canEditStudent = currentUser ? currentUser.permissions.canEditStudent : true;
  const canEditScores = currentUser ? currentUser.permissions.canEditScores : true;
  const canPrintBukuInduk = currentUser ? currentUser.permissions.canPrintBukuInduk : true;
  const canPrintStudentCard = currentUser ? currentUser.permissions.canPrintStudentCard : true;
  const canAccessAi = currentUser ? currentUser.permissions.canAccessAiAssistant : true;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={student.fotoUrl}
              alt={student.namaLengkap}
              className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{student.namaLengkap}</h2>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                  Kelas {student.kelasSekarang}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    student.status === 'Aktif'
                      ? 'bg-emerald-600/30 text-emerald-300'
                      : 'bg-blue-600/30 text-blue-300'
                  }`}
                >
                  {student.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                No Induk: <strong className="text-white">{student.noUrutInduk}</strong> • NISN: <strong className="text-white">{student.nisn}</strong> • NIS: {student.nis}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canAccessAi && (
              <button
                onClick={() => onAnalyzeAi(student)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Analisis</span>
              </button>
            )}
            {onEditScores && canEditScores && (
              <button
                onClick={() => onEditScores(student, 1)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-700 hover:bg-blue-600 text-white border border-blue-600 transition shadow-xs cursor-pointer"
                title="Edit / Input Nilai Rapor"
              >
                <Calculator className="w-3.5 h-3.5 text-blue-200" />
                <span>Edit Nilai</span>
              </button>
            )}
            {canPrintBukuInduk && (
              <button
                onClick={() => onPrintMasterSheet(student)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cetak Lembar</span>
              </button>
            )}
            {canPrintStudentCard && (
              <button
                onClick={() => onPrintCard(student)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-purple-400" />
                <span>Kartu</span>
              </button>
            )}
            {canEditStudent && (
              <button
                onClick={() => onEdit(student)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Biodata</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 border-b border-slate-200 flex space-x-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('identitas')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'identitas'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>A. Identitas Pokok</span>
          </button>

          <button
            onClick={() => setActiveTab('alamat_jasmani')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'alamat_jasmani'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>B & C. Alamat & Jasmani</span>
          </button>

          <button
            onClick={() => setActiveTab('pendidikan_ortu')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'pendidikan_ortu'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>D & E. SD & Orang Tua</span>
          </button>

          <button
            onClick={() => setActiveTab('akademik_rapor')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'akademik_rapor'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>F. Rapor Nilai Siswa</span>
          </button>

          <button
            onClick={() => setActiveTab('prestasi_bk')}
            className={`py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'prestasi_bk'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>G & H. Prestasi & BK</span>
          </button>
        </div>

        {/* Tab Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
          {/* TAB 1: IDENTITAS POKOK */}
          {activeTab === 'identitas' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>A. KETERANGAN TENTANG DIRI PESERTA DIDIK</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">1. Nama Lengkap:</span>
                      <strong className="text-slate-900">{student.namaLengkap}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">2. Nama Panggilan:</span>
                      <strong className="text-slate-900">{student.namaPanggilan || '-'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">3. Jenis Kelamin:</span>
                      <strong className="text-slate-900">
                        {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">4. Tempat, Tanggal Lahir:</span>
                      <strong className="text-slate-900">
                        {student.tempatLahir}, {formatDateIndonesian(student.tanggalLahir)} (Usia {calculateAge(student.tanggalLahir)} th)
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">5. Agama:</span>
                      <strong className="text-slate-900">{student.agama}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">6. Kewarganegaraan:</span>
                      <strong className="text-slate-900">{student.kewarganegaraan}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">7. Nomor Induk Siswa Nasional (NISN):</span>
                      <strong className="text-slate-900 font-mono">{student.nisn}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">8. Nomor Induk Sekolah (NIS):</span>
                      <strong className="text-slate-900 font-mono">{student.nis}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">9. Nomor Induk Kependudukan (NIK):</span>
                      <strong className="text-slate-900 font-mono">{student.nik}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">10. Nomor Kartu Keluarga (KK):</span>
                      <strong className="text-slate-900 font-mono">{student.noKk || '-'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">11. Anak Ke-:</span>
                      <strong className="text-slate-900">
                        {student.anakKe} dari {student.jumlahSaudaraKandung + 1} bersaudara
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">12. Bahasa Sehari-hari di Rumah:</span>
                      <strong className="text-slate-900">{student.bahasaSehariHari || 'Bahasa Indonesia, Jawa'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Riwayat Penerimaan */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
                <h4 className="font-bold text-emerald-950 text-xs mb-3 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>DATA PENERIMAAN DI SMP NEGERI 2 KASIHAN</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Tahun Masuk:</span>
                    <strong className="text-slate-900">{student.tahunMasuk}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Tanggal Diterima:</span>
                    <strong className="text-slate-900">{formatDateIndonesian(student.tanggalDiterima)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Diterima di Kelas:</span>
                    <strong className="text-slate-900">{student.diterimaDiKelas}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Jalur Masuk PPDB:</span>
                    <strong className="text-emerald-800">{student.jalurMasuk}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ALAMAT & JASMANI */}
          {activeTab === 'alamat_jasmani' && (
            <div className="space-y-6">
              {/* Alamat & Tempat Tinggal */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>B. KETERANGAN TEMPAT TINGGAL</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Alamat Lengkap:</span>
                      <strong className="text-slate-900 text-right">{student.tempatTinggal?.alamatLengkap || '-'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">RT / RW:</span>
                      <strong className="text-slate-900">RT {student.tempatTinggal?.rt || '-'} / RW {student.tempatTinggal?.rw || '-'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Dusun / Kampung:</span>
                      <strong className="text-slate-900">{student.tempatTinggal?.dusun || '-'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Kelurahan / Desa:</span>
                      <strong className="text-slate-900">{student.tempatTinggal?.kelurahan || '-'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Kecamatan:</span>
                      <strong className="text-slate-900">{student.tempatTinggal?.kecamatan || 'Kasihan'}</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Kabupaten / Kota:</span>
                      <strong className="text-slate-900">{student.tempatTinggal?.kabupatenKota || 'Bantul'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Kode Pos:</span>
                      <strong className="text-slate-900 font-mono">{student.tempatTinggal?.kodePos || '55184'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Tinggal Bersama:</span>
                      <strong className="text-slate-900">{student.tempatTinggal?.tinggalBersama || 'Orang Tua'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Transportasi ke Sekolah:</span>
                      <strong className="text-slate-900">{student.tempatTinggal?.transportasi || 'Sepeda'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Jarak & Waktu Tempuh:</span>
                      <strong className="text-slate-900">
                        {student.tempatTinggal?.jarakKeSekolahKm || 0} km ({student.tempatTinggal?.waktuTempuhMenit || 0} menit)
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Jasmani & Kesehatan */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>C. KETERANGAN KESEHATAN & JASMANI</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-400 block text-[11px]">Golongan Darah</span>
                    <strong className="text-lg font-bold text-red-600">{student.jasmani?.golonganDarah || '-'}</strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-400 block text-[11px]">Tinggi Badan</span>
                    <strong className="text-lg font-bold text-slate-800">{student.jasmani?.tinggiBadanCm || '-'} cm</strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-400 block text-[11px]">Berat Badan</span>
                    <strong className="text-lg font-bold text-slate-800">{student.jasmani?.beratBadanKg || '-'} kg</strong>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <span className="text-slate-400 block text-[11px]">Riwayat Sakit</span>
                    <strong className="text-xs font-bold text-slate-800 block truncate">
                      {student.jasmani?.riwayatPenyakit || 'Tidak ada'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SD & ORANG TUA */}
          {activeTab === 'pendidikan_ortu' && (
            <div className="space-y-6">
              {/* Asal SD/MI */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>D. KETERANGAN PENDIDIKAN SEBELUMNYA (SD/MI)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Asal SD / MI:</span>
                      <strong className="text-slate-900">{student.pendidikanSebelumnya?.asalSdMi || '-'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Kabupaten / Kota SD:</span>
                      <strong className="text-slate-900">{student.pendidikanSebelumnya?.kabupatenSdMi || 'Bantul'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">No. Peserta Ujian SD:</span>
                      <strong className="text-slate-900 font-mono">{student.pendidikanSebelumnya?.noPesertaUjianSd || '-'}</strong>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Nomor Ijazah SD:</span>
                      <strong className="text-slate-900 font-mono">{student.pendidikanSebelumnya?.noIjazahSd || '-'}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Tanggal Ijazah SD:</span>
                      <strong className="text-slate-900">{formatDateIndonesian(student.pendidikanSebelumnya?.tanggalIjazahSd)}</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-500">Nilai Kelulusan SD:</span>
                      <strong className="text-slate-900">{student.pendidikanSebelumnya?.nilaiKelulusanSd || '-'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Orang Tua */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>E. KETERANGAN TENTANG ORANG TUA / WALI</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Ayah */}
                  <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
                    <div className="font-bold text-emerald-800 text-xs border-b border-slate-200 pb-1 mb-2">
                      DATA AYAH KANDUNG
                    </div>
                    <div className="flex justify-between"><span className="text-slate-400">Nama:</span><strong>{student.dataOrangTua?.namaAyah || '-'}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">NIK:</span><span className="font-mono">{student.dataOrangTua?.nikAyah || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">TTL:</span><span>{student.dataOrangTua?.tempatLahirAyah}, {student.dataOrangTua?.tanggalLahirAyah}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Pendidikan:</span><span>{student.dataOrangTua?.pendidikanAyah || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Pekerjaan:</span><span>{student.dataOrangTua?.pekerjaanAyah || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Penghasilan:</span><span>{student.dataOrangTua?.penghasilanAyah || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">No. HP / WA:</span><span className="font-mono">{student.dataOrangTua?.noHpAyah || '-'}</span></div>
                  </div>

                  {/* Ibu */}
                  <div className="p-3.5 bg-white rounded-lg border border-slate-200 space-y-1.5">
                    <div className="font-bold text-pink-800 text-xs border-b border-slate-200 pb-1 mb-2">
                      DATA IBU KANDUNG
                    </div>
                    <div className="flex justify-between"><span className="text-slate-400">Nama:</span><strong>{student.dataOrangTua?.namaIbu || '-'}</strong></div>
                    <div className="flex justify-between"><span className="text-slate-400">NIK:</span><span className="font-mono">{student.dataOrangTua?.nikIbu || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">TTL:</span><span>{student.dataOrangTua?.tempatLahirIbu}, {student.dataOrangTua?.tanggalLahirIbu}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Pendidikan:</span><span>{student.dataOrangTua?.pendidikanIbu || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Pekerjaan:</span><span>{student.dataOrangTua?.pekerjaanIbu || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Penghasilan:</span><span>{student.dataOrangTua?.penghasilanIbu || '-'}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">No. HP / WA:</span><span className="font-mono">{student.dataOrangTua?.noHpIbu || '-'}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AKADEMIK & RAPOR */}
          {activeTab === 'akademik_rapor' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    F. REKAPITULASI NILAI RAPOR & PERKEMBANGAN AKADEMIK
                  </h3>
                  <p className="text-xs text-slate-500">
                    Catatan nilai per semester yang tercantum pada lembar Buku Induk
                  </p>
                </div>
                {onEditScores && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditScores(student, 1)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>+ Input / Edit Nilai Semester</span>
                    </button>
                  </div>
                )}
              </div>

              {(!student.semesterReports || student.semesterReports.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-semibold text-slate-700">Belum ada rekaman nilai rapor semester terinput.</p>
                  <p className="text-xs text-slate-400 mt-1 mb-4">
                    Gunakan tombol di bawah untuk memasukkan rekaman nilai per semester (Semester 1 s.d. 6).
                  </p>
                  {onEditScores && (
                    <button
                      onClick={() => onEditScores(student, 1)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold shadow-sm inline-flex items-center gap-2"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Input Nilai Rapor Sekarang</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {student.semesterReports.map((report) => (
                    <div key={report.semester} className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
                        <span className="font-bold text-xs text-emerald-800">
                          Semester {report.semester} (Kelas {report.kelas} • TP {report.tahunAjaran})
                        </span>
                        <div className="flex items-center gap-3 text-xs">
                          <span>Rata-rata: <strong className="text-emerald-700">{report.scores.rataRata || '-'}</strong></span>
                          <span>Peringkat: <strong className="text-purple-700">{report.scores.peringkat ? `#${report.scores.peringkat}` : '-'}</strong></span>
                          {onEditScores && (
                            <button
                              onClick={() => onEditScores(student, report.semester)}
                              className="px-2.5 py-1 bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 rounded-md font-bold text-[11px] flex items-center gap-1 shadow-xs transition"
                            >
                              <Edit className="w-3 h-3 text-blue-600" />
                              <span>Edit Nilai Smt {report.semester}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Mapel Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-center text-xs">
                        <div className="p-2 bg-white rounded border border-slate-200"><span className="text-[10px] text-slate-400 block">PAI</span><strong>{report.scores.pai}</strong></div>
                        <div className="p-2 bg-white rounded border border-slate-200"><span className="text-[10px] text-slate-400 block">PPKn</span><strong>{report.scores.pancasila}</strong></div>
                        <div className="p-2 bg-white rounded border border-slate-200"><span className="text-[10px] text-slate-400 block">B. Indo</span><strong>{report.scores.bahasaIndonesia}</strong></div>
                        <div className="p-2 bg-white rounded border border-slate-200"><span className="text-[10px] text-slate-400 block">Matematika</span><strong>{report.scores.matematika}</strong></div>
                        <div className="p-2 bg-white rounded border border-slate-200"><span className="text-[10px] text-slate-400 block">IPA</span><strong>{report.scores.ipa}</strong></div>
                        <div className="p-2 bg-white rounded border border-slate-200"><span className="text-[10px] text-slate-400 block">IPS</span><strong>{report.scores.ips}</strong></div>
                        <div className="p-2 bg-white rounded border border-slate-200"><span className="text-[10px] text-slate-400 block">B. Inggris</span><strong>{report.scores.bahasaInggris}</strong></div>
                        <div className="p-2 bg-white rounded border border-slate-200"><span className="text-[10px] text-slate-400 block">Seni Budaya</span><strong>{report.scores.seniBudaya}</strong></div>
                        <div className="p-2 bg-white rounded border border-slate-200"><span className="text-[10px] text-slate-400 block">PJOK</span><strong>{report.scores.pjok}</strong></div>
                        <div className="p-2 bg-white rounded border border-slate-200"><span className="text-[10px] text-slate-400 block">Informatika</span><strong>{report.scores.informatika}</strong></div>
                        <div className="p-2 bg-white rounded border border-slate-200"><span className="text-[10px] text-slate-400 block">B. Jawa</span><strong>{report.scores.bahasaJawa}</strong></div>
                      </div>

                      {/* Kehadiran & Sikap */}
                      <div className="mt-3 pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600">
                        <div>
                          <span>Kehadiran: Sakit: <strong>{report.kehadiran?.sakit || 0}</strong>, Izin: <strong>{report.kehadiran?.izin || 0}</strong>, Alpa: <strong>{report.kehadiran?.tanpaKeterangan || 0}</strong></span>
                        </div>
                        <div>
                          <span>Sikap Spiritual: <strong>{report.sikapSpiritual || 'Baik'}</strong> | Sikap Sosial: <strong>{report.sikapSosial || 'Baik'}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PRESTASI & BK */}
          {activeTab === 'prestasi_bk' && (
            <div className="space-y-6">
              {/* Prestasi */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>G. CATATAN PRESTASI SISWA</span>
                </h3>
                {(!student.prestasi || student.prestasi.length === 0) ? (
                  <p className="text-slate-500 italic text-xs">Belum ada catatan kejuaraan / prestasi tercatat.</p>
                ) : (
                  <div className="space-y-2">
                    {student.prestasi.map((p) => (
                      <div key={p.id} className="p-3 bg-white rounded-lg border border-slate-200 flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              {p.juara}
                            </span>
                            <span className="font-bold text-slate-900">{p.namaPrestasi}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Bidang: {p.bidang} • Tingkat: {p.tingkat} • Penyelenggara: {p.penyelenggara}
                          </div>
                        </div>
                        <span className="font-semibold text-slate-400 text-xs">{p.tahun}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ekstrakurikuler */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs mb-3">KEGIATAN EKSTRAKURIKULER</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {student.ekstrakurikuler?.map((ek) => (
                    <div key={ek.id} className="p-2.5 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-800">{ek.nama}</div>
                        <div className="text-[10px] text-slate-400">{ek.keterangan}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {ek.predikat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan Bimbingan Konseling / Wali Kelas */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs mb-3">CATATAN PERKEMBANGAN / BIMBINGAN KONSELING (BK)</h4>
                {(!student.catatanPerkembangan || student.catatanPerkembangan.length === 0) ? (
                  <p className="text-slate-500 italic text-xs">Belum ada catatan khusus.</p>
                ) : (
                  <div className="space-y-2">
                    {student.catatanPerkembangan.map((c) => (
                      <div key={c.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-slate-900">{c.perihal}</strong>
                          <span className="text-slate-400 text-[10px]">{formatDateIndonesian(c.tanggal)}</span>
                        </div>
                        <p className="text-slate-600">{c.catatan}</p>
                        <div className="text-[10px] text-emerald-700 font-medium">
                          Tindak Lanjut: {c.tindakLanjut} (Oleh: {c.petugas})
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Terdaftar sejak: {formatDateIndonesian(student.createdAt)}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintMasterSheet(student)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Lembar Buku Induk</span>
            </button>
            <button
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
