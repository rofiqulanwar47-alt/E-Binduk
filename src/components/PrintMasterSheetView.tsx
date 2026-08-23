import React, { useState, useMemo } from 'react';
import {
  Printer,
  ArrowLeft,
  Search,
  Filter,
  Users,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle2,
  Award,
  Layers,
  School,
} from 'lucide-react';
import { Student, SchoolProfile } from '../types';
import { formatDateIndonesian, calculateAge } from '../utils/formatters';
import { OfficialKopSurat } from './OfficialKopSurat';

interface PrintMasterSheetViewProps {
  students: Student[];
  selectedStudent: Student | null;
  schoolProfile: SchoolProfile;
  onBack: () => void;
  onSelectStudent: (student: Student) => void;
}

type PrintMode = 'full' | 'sheet1' | 'sheet2' | 'batch_class';

export const PrintMasterSheetView: React.FC<PrintMasterSheetViewProps> = ({
  students,
  selectedStudent,
  schoolProfile,
  onBack,
  onSelectStudent,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [printMode, setPrintMode] = useState<PrintMode>('full');

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

  // Natural class helper
  const parseClassOrder = (cls: string) => {
    if (!cls) return { grade: 999, section: 'Z' };
    const match = cls.trim().match(/^(\d+)\s*([A-Za-z]*)/);
    if (match) {
      return { grade: parseInt(match[1], 10), section: match[2].toUpperCase() };
    }
    if (cls.toLowerCase().includes('alumni')) return { grade: 900, section: 'A' };
    return { grade: 800, section: cls.toUpperCase() };
  };

  // Filter & Sort students based on class and search query (Urut Kelas & Abjad Nama)
  const filteredStudents = useMemo(() => {
    return students
      .filter((s) => {
        const matchClass = selectedClass === 'all' || s.kelasSekarang === selectedClass;
        const q = searchQuery.toLowerCase().trim();
        const matchQuery =
          !q ||
          s.namaLengkap.toLowerCase().includes(q) ||
          s.nisn.includes(q) ||
          s.nis.includes(q) ||
          (s.nik && s.nik.includes(q)) ||
          (s.noUrutInduk && s.noUrutInduk.toLowerCase().includes(q));
        return matchClass && matchQuery;
      })
      .sort((a, b) => {
        const classA = parseClassOrder(a.kelasSekarang);
        const classB = parseClassOrder(b.kelasSekarang);
        if (classA.grade !== classB.grade) {
          return classA.grade - classB.grade;
        }
        if (classA.section !== classB.section) {
          return classA.section.localeCompare(classB.section);
        }
        return (a.namaLengkap || '').localeCompare(b.namaLengkap || '', 'id', { sensitivity: 'base' });
      });
  }, [students, selectedClass, searchQuery]);

  const [currentStudentId, setCurrentStudentId] = useState<string>(
    selectedStudent?.id || (filteredStudents.length > 0 ? filteredStudents[0].id : '')
  );

  // Active student object
  const activeStudent = useMemo(() => {
    return (
      students.find((s) => s.id === currentStudentId) ||
      selectedStudent ||
      filteredStudents[0] ||
      students[0]
    );
  }, [students, currentStudentId, selectedStudent, filteredStudents]);

  // Navigation handlers
  const currentIdx = filteredStudents.findIndex((s) => s.id === activeStudent?.id);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx >= 0 && currentIdx < filteredStudents.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      const target = filteredStudents[currentIdx - 1];
      setCurrentStudentId(target.id);
      onSelectStudent(target);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const target = filteredStudents[currentIdx + 1];
      setCurrentStudentId(target.id);
      onSelectStudent(target);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!students || students.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
        <p className="text-slate-600 font-medium">Belum ada data siswa di dalam sistem.</p>
        <p className="text-xs text-slate-400 mt-1">Impor data siswa via Excel terlebih dahulu pada menu Pengaturan.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold"
        >
          Kembali ke Data Siswa
        </button>
      </div>
    );
  }

  // Render Single Student Sheet (Lembar 1 & Lembar 2)
  const renderSingleStudentDoc = (st: Student, indexNum?: number) => {
    return (
      <div
        key={st.id}
        className="printable-student-doc bg-white text-slate-950 font-serif leading-tight p-6 sm:p-10 border border-slate-300 shadow-lg rounded-xl max-w-4xl mx-auto mb-8 print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:rounded-none page-break-after"
      >
        {/* ==================== LEMBAR 1: BIODATA & KELUARGA ==================== */}
        {(printMode === 'full' || printMode === 'sheet1' || printMode === 'batch_class') && (
          <div className="sheet-page-1 pb-6 print:pb-0">
            {/* KOP SURAT RESMI */}
            <OfficialKopSurat schoolProfile={schoolProfile} />

            {/* JUDUL LEMBAR INDUK */}
            <div className="text-center my-3">
              <h1 className="text-sm sm:text-base font-bold uppercase tracking-wider font-sans underline">
                LEMBAR BUKU INDUK SISWA (LEMBAR I)
              </h1>
              <p className="text-xs font-sans font-semibold mt-0.5 text-slate-800">
                Nomor Induk Siswa (No. Register): <span className="font-mono text-sm font-bold">{st.noUrutInduk}</span> &nbsp;|&nbsp; NISN: <span className="font-mono text-sm font-bold">{st.nisn}</span> &nbsp;|&nbsp; NIS: <span className="font-mono text-sm">{st.nis}</span>
              </p>
            </div>

            {/* FOTO & IDENTITAS UTAMA */}
            <div className="flex items-start gap-4 mb-3">
              <div className="w-24 sm:w-28 h-32 sm:h-36 border-2 border-slate-800 flex flex-col items-center justify-center bg-slate-50 p-1 text-center shrink-0">
                {st.fotoUrl ? (
                  <img
                    src={st.fotoUrl}
                    alt={st.namaLengkap}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="text-[10px] font-sans text-slate-400 leading-tight">
                    Pas Foto<br />3 x 4 cm
                  </div>
                )}
              </div>

              <div className="flex-1 text-xs font-sans">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr>
                      <td className="w-56 whitespace-nowrap py-1 text-slate-700 font-medium align-top">1. Nama Lengkap Peserta Didik</td>
                      <td className="w-3 py-1 text-center font-bold align-top">:</td>
                      <td className="py-1 font-bold text-sm uppercase text-slate-950 align-top">{st.namaLengkap}</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-1 text-slate-700 align-top">2. Nama Panggilan</td>
                      <td className="py-1 text-center font-bold align-top">:</td>
                      <td className="py-1 font-semibold align-top">{st.namaPanggilan || '-'}</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-1 text-slate-700 align-top">3. Nomor Induk Siswa Nasional (NISN)</td>
                      <td className="py-1 text-center font-bold align-top">:</td>
                      <td className="py-1 font-mono font-bold text-slate-950 align-top">{st.nisn}</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-1 text-slate-700 align-top">4. Nomor Induk Kependudukan (NIK)</td>
                      <td className="py-1 text-center font-bold align-top">:</td>
                      <td className="py-1 font-mono font-bold text-slate-950 align-top">{st.nik || '-'}</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-1 text-slate-700 align-top">5. Nomor Kartu Keluarga (No. KK)</td>
                      <td className="py-1 text-center font-bold align-top">:</td>
                      <td className="py-1 font-mono font-bold text-slate-950 align-top">{st.noKk || '-'}</td>
                    </tr>
                    <tr>
                      <td className="whitespace-nowrap py-1 text-slate-700 align-top">6. Nomor Induk Sekolah (NIS)</td>
                      <td className="py-1 text-center font-bold align-top">:</td>
                      <td className="py-1 font-mono font-bold text-slate-950 align-top">{st.nis}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION A: KETERANGAN TENTANG DIRI PESERTA DIDIK */}
            <div className="mb-3 font-sans text-xs">
              <div className="bg-slate-100 px-2 py-0.5 font-bold border-y border-slate-300 uppercase text-[11px]">
                A. KETERANGAN TENTANG DIRI PESERTA DIDIK
              </div>
              <table className="w-full mt-1 border-collapse text-xs">
                <tbody>
                  <tr>
                    <td className="w-56 whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">7. Jenis Kelamin</td>
                    <td className="w-3 py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">{st.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">8. Tempat dan Tanggal Lahir</td>
                    <td className="py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">{st.tempatLahir}, {formatDateIndonesian(st.tanggalLahir)}</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">9. Agama / Kepercayaan</td>
                    <td className="py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">{st.agama}</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">10. Kewarganegaraan</td>
                    <td className="py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">{st.kewarganegaraan || 'WNI'}</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">11. Anak Keberapa / Saudara</td>
                    <td className="py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">
                      Anak ke-{st.anakKe || 1} dari {(st.jumlahSaudaraKandung || 0) + 1} bersaudara
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">12. Bahasa Sehari-hari di Rumah</td>
                    <td className="py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">{st.bahasaSehariHari || 'Bahasa Indonesia, Jawa'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION B: KETERANGAN TEMPAT TINGGAL & KESEHATAN */}
            <div className="mb-3 font-sans text-xs">
              <div className="bg-slate-100 px-2 py-0.5 font-bold border-y border-slate-300 uppercase text-[11px]">
                B. KETERANGAN TEMPAT TINGGAL & KESEHATAN JASMANI
              </div>
              <table className="w-full mt-1 border-collapse text-xs">
                <tbody>
                  <tr>
                    <td className="w-56 whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">13. Alamat Lengkap</td>
                    <td className="w-3 py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">
                      {st.tempatTinggal?.alamatLengkap || '-'} (RT {st.tempatTinggal?.rt || '-'}/RW {st.tempatTinggal?.rw || '-'})
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">14. Dusun / Kelurahan / Kecamatan</td>
                    <td className="py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">
                      Dusun {st.tempatTinggal?.dusun || '-'}, Kel. {st.tempatTinggal?.kelurahan || '-'}, Kec. {st.tempatTinggal?.kecamatan || '-'}, {st.tempatTinggal?.kabupatenKota || 'Bantul'}
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">15. Tinggal Bersama / Transportasi</td>
                    <td className="py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">
                      {st.tempatTinggal?.tinggalBersama || 'Orang Tua'} / Menggunakan {st.tempatTinggal?.transportasi || 'Sepeda'} (Jarak: {st.tempatTinggal?.jarakKeSekolahKm || 1} km)
                    </td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">16. Keadaan Jasmani</td>
                    <td className="py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">
                      Golongan Darah: <strong>{st.jasmani?.golonganDarah || '-'}</strong> • TB: {st.jasmani?.tinggiBadanCm || 150} cm • BB: {st.jasmani?.beratBadanKg || 45} kg • Riwayat Penyakit: {st.jasmani?.riwayatPenyakit || 'Tidak ada'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION C: PENDIDIKAN SEBELUMNYA */}
            <div className="mb-3 font-sans text-xs">
              <div className="bg-slate-100 px-2 py-0.5 font-bold border-y border-slate-300 uppercase text-[11px]">
                C. KETERANGAN PENDIDIKAN SEBELUMNYA (SD/MI)
              </div>
              <table className="w-full mt-1 border-collapse text-xs">
                <tbody>
                  <tr>
                    <td className="w-56 whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">17. Sekolah Asal (SD/MI)</td>
                    <td className="w-3 py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">{st.pendidikanSebelumnya?.asalSdMi || '-'} (Kab. {st.pendidikanSebelumnya?.kabupatenSdMi || 'Bantul'})</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">18. No. & Tgl Ijazah SD / Nilai</td>
                    <td className="py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">
                      No. Ijazah: {st.pendidikanSebelumnya?.noIjazahSd || '-'} • Tgl: {formatDateIndonesian(st.pendidikanSebelumnya?.tanggalIjazahSd)} • Rata-rata Nilai: {st.pendidikanSebelumnya?.nilaiKelulusanSd || '-'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* SECTION D: ORANG TUA KANDUNG & WALI */}
            <div className="mb-3 font-sans text-xs">
              <div className="bg-slate-100 px-2 py-0.5 font-bold border-y border-slate-300 uppercase text-[11px]">
                D. KETERANGAN TENTANG ORANG TUA KANDUNG & WALI
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1 border border-slate-300 p-2 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold underline text-slate-900 mb-1">19. DATA AYAH KANDUNG:</div>
                  <div>Nama: <strong>{st.dataOrangTua?.namaAyah || '-'}</strong></div>
                  <div>NIK: {st.dataOrangTua?.nikAyah || '-'}</div>
                  <div>Pendidikan: {st.dataOrangTua?.pendidikanAyah || '-'}</div>
                  <div>Pekerjaan: {st.dataOrangTua?.pekerjaanAyah || '-'}</div>
                  <div>Penghasilan: {st.dataOrangTua?.penghasilanAyah || '-'}</div>
                  <div>No. HP/WA: {st.dataOrangTua?.noHpAyah || '-'}</div>
                  <div>Status: {st.dataOrangTua?.statusAyah || 'Masih Hidup'}</div>
                </div>
                <div className="space-y-0.5 border-l border-slate-200 pl-3">
                  <div className="font-bold underline text-slate-900 mb-1">20. DATA IBU KANDUNG:</div>
                  <div>Nama: <strong>{st.dataOrangTua?.namaIbu || '-'}</strong></div>
                  <div>NIK: {st.dataOrangTua?.nikIbu || '-'}</div>
                  <div>Pendidikan: {st.dataOrangTua?.pendidikanIbu || '-'}</div>
                  <div>Pekerjaan: {st.dataOrangTua?.pekerjaanIbu || '-'}</div>
                  <div>Penghasilan: {st.dataOrangTua?.penghasilanIbu || '-'}</div>
                  <div>No. HP/WA: {st.dataOrangTua?.noHpIbu || '-'}</div>
                  <div>Status: {st.dataOrangTua?.statusIbu || 'Masih Hidup'}</div>
                </div>
              </div>
            </div>

            {/* SECTION E: PENERIMAAN DI SMPN 2 KASIHAN */}
            <div className="mb-4 font-sans text-xs">
              <div className="bg-slate-100 px-2 py-0.5 font-bold border-y border-slate-300 uppercase text-[11px]">
                E. PENERIMAAN PESERTA DIDIK DI SMP NEGERI 2 KASIHAN
              </div>
              <table className="w-full mt-1 border-collapse text-xs">
                <tbody>
                  <tr>
                    <td className="w-56 whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">21. Tanggal & Tahun Masuk</td>
                    <td className="w-3 py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">{formatDateIndonesian(st.tanggalDiterima)} (Tahun Masuk: {st.tahunMasuk || '2024'})</td>
                  </tr>
                  <tr>
                    <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">22. Diterima di Kelas / Jalur</td>
                    <td className="py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">Kelas {st.diterimaDiKelas || st.kelasSekarang} &nbsp;|&nbsp; Jalur Penerimaan PPDB: <strong className="text-emerald-950">{st.jalurMasuk || 'Zonasi'}</strong></td>
                  </tr>
                  {st.catatanPenerimaan && (
                    <tr>
                      <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">23. Catatan / Riwayat Penerimaan</td>
                      <td className="py-0.5 text-center font-bold align-top">:</td>
                      <td className="py-0.5 font-medium align-top">{st.catatanPenerimaan}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="whitespace-nowrap py-0.5 text-slate-700 font-medium align-top">24. Bantuan Sosial Pendidikan</td>
                    <td className="py-0.5 text-center font-bold align-top">:</td>
                    <td className="py-0.5 font-medium align-top">
                      {st.kesejahteraan?.penerimaKip ? 'Penerima KIP/PIP' : 'Bukan KIP'} • {st.kesejahteraan?.penerimaKmsBantul ? 'Penerima KMS Bantul' : 'Non-KMS'} • Layak PIP: {st.kesejahteraan?.layakPip ? 'Ya' : 'Tidak'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* LEGALISASI LEMBAR 1 */}
            <div className="mt-4 pt-2 font-sans text-xs">
              <div className="flex justify-between items-start text-center">
                <div className="w-48">
                  <p>Mengetahui,</p>
                  <p className="font-semibold">Orang Tua / Wali Murid</p>
                  <div className="h-14 flex items-end justify-center">
                    <p className="font-bold underline">{st.dataOrangTua?.namaAyah || st.dataOrangTua?.namaIbu || '........................'}</p>
                  </div>
                </div>

                <div className="w-52">
                  <p>Kasihan, {formatDateIndonesian(new Date().toISOString())}</p>
                  <p className="font-semibold">Pengelola Buku Induk (TU)</p>
                  <div className="h-14 flex items-end justify-center">
                    <div>
                      <p className="font-bold underline">{schoolProfile.pengelolaBukuInduk || 'Drs. Tri Wahyono'}</p>
                      <p className="text-[10px] text-slate-600">NIP. {schoolProfile.nipPengelolaBukuInduk || '197904122005011003'}</p>
                    </div>
                  </div>
                </div>

                <div className="w-52">
                  <p>Kasihan, {formatDateIndonesian(new Date().toISOString())}</p>
                  <p className="font-semibold">Kepala {schoolProfile.namaSekolah || 'SMP N 2 Kasihan'}</p>
                  <div className="h-14 flex items-end justify-center">
                    <div>
                      <p className="font-bold underline">{schoolProfile.kepalaSekolah || 'Drs. H. Sugeng Riyadi, M.Pd.'}</p>
                      <p className="text-[10px] text-slate-600">NIP. {schoolProfile.nipKepalaSekolah || '196803151994121002'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-1 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-400 font-sans">
              <span>Lembar 1 Buku Induk Siswa • {schoolProfile.namaSekolah} Bantul</span>
              <span>Dokumen Negara • Standar Kemendikbudristek RI</span>
            </div>
          </div>
        )}

        {/* Jeda Halaman Antara Lembar 1 dan Lembar 2 */}
        {printMode === 'full' && <div className="page-break-after my-6 print:my-0 border-t-2 border-dashed border-slate-300 print:border-none"></div>}

        {/* ==================== LEMBAR 2: RAPOR & PRESTASI ==================== */}
        {(printMode === 'full' || printMode === 'sheet2' || printMode === 'batch_class') && (
          <div className="sheet-page-2 pt-4 print:pt-0">
            {/* Header Lembar 2 */}
            <div className="border-b-2 border-slate-900 pb-2 mb-3 text-center">
              <h2 className="text-sm font-extrabold uppercase font-sans tracking-wide text-slate-950">
                LEMBAR BUKU INDUK SISWA (LEMBAR II: HASIL BELAJAR & HISTORI)
              </h2>
              <p className="text-xs font-sans mt-0.5">
                Nama Siswa: <strong className="uppercase">{st.namaLengkap}</strong> &nbsp;|&nbsp; NISN: <strong className="font-mono">{st.nisn}</strong> &nbsp;|&nbsp; Kelas Sekarang: <strong>{st.kelasSekarang}</strong>
              </p>
            </div>

            {/* F. REKAPITULASI HASIL EVALUASI BELAJAR (NILAI RAPOR) */}
            <div className="mb-3 font-sans text-xs">
              <div className="bg-slate-100 px-2 py-0.5 font-bold border-y border-slate-300 uppercase text-[11px]">
                F. REKAPITULASI HASIL EVALUASI BELAJAR (NILAI RAPOR SEMESTER)
              </div>
              <div className="overflow-x-auto mt-1">
                <table className="w-full border-collapse text-[11px] text-center border border-slate-400">
                  <thead>
                    <tr className="bg-slate-100 font-bold border-b border-slate-400">
                      <th className="border border-slate-400 py-1 px-1.5 text-left w-36">Mata Pelajaran</th>
                      <th className="border border-slate-400 py-1 px-1 w-12">Sem 1</th>
                      <th className="border border-slate-400 py-1 px-1 w-12">Sem 2</th>
                      <th className="border border-slate-400 py-1 px-1 w-12">Sem 3</th>
                      <th className="border border-slate-400 py-1 px-1 w-12">Sem 4</th>
                      <th className="border border-slate-400 py-1 px-1 w-12">Sem 5</th>
                      <th className="border border-slate-400 py-1 px-1 w-12">Sem 6</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { key: 'pai', label: '1. Pendidikan Agama & Budi Pekerti' },
                      { key: 'pancasila', label: '2. Pendidikan Pancasila (PPKn)' },
                      { key: 'bahasaIndonesia', label: '3. Bahasa Indonesia' },
                      { key: 'matematika', label: '4. Matematika' },
                      { key: 'ipa', label: '5. Ilmu Pengetahuan Alam (IPA)' },
                      { key: 'ips', label: '6. Ilmu Pengetahuan Sosial (IPS)' },
                      { key: 'bahasaInggris', label: '7. Bahasa Inggris' },
                      { key: 'seniBudaya', label: '8. Seni Budaya & Prakarya' },
                      { key: 'pjok', label: '9. PJOK / Penjasorkes' },
                      { key: 'informatika', label: '10. Informatika' },
                      { key: 'bahasaJawa', label: '11. Muatan Lokal (B. Jawa)' },
                    ].map((subj) => {
                      const getScore = (sem: number) => {
                        const rep = st.semesterReports?.find((r) => r.semester === sem);
                        return rep?.scores ? (rep.scores as any)[subj.key] || '-' : '-';
                      };
                      return (
                        <tr key={subj.key} className="border-b border-slate-300">
                          <td className="border border-slate-300 py-0.5 px-2 text-left font-medium text-slate-800">
                            {subj.label}
                          </td>
                          <td className="border border-slate-300 py-0.5 font-mono">{getScore(1)}</td>
                          <td className="border border-slate-300 py-0.5 font-mono">{getScore(2)}</td>
                          <td className="border border-slate-300 py-0.5 font-mono">{getScore(3)}</td>
                          <td className="border border-slate-300 py-0.5 font-mono">{getScore(4)}</td>
                          <td className="border border-slate-300 py-0.5 font-mono">{getScore(5)}</td>
                          <td className="border border-slate-300 py-0.5 font-mono">{getScore(6)}</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-400">
                      <td className="border border-slate-400 py-1 px-2 text-left">RATA-RATA NILAI RAPOR</td>
                      {[1, 2, 3, 4, 5, 6].map((sem) => {
                        const rep = st.semesterReports?.find((r) => r.semester === sem);
                        return (
                          <td key={sem} className="border border-slate-400 py-1 font-mono font-bold text-blue-900">
                            {rep?.scores?.rataRata ? Number(rep.scores.rataRata).toFixed(1) : '-'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* G. KEGIATAN EKSTRAKURIKULER & PRESTASI */}
            <div className="grid grid-cols-2 gap-3 mb-3 font-sans text-xs">
              {/* Ekstrakurikuler */}
              <div className="border border-slate-300 p-2 rounded">
                <div className="font-bold border-b border-slate-300 pb-1 mb-1 text-[11px] uppercase">
                  G. KEGIATAN EKSTRAKURIKULER
                </div>
                {st.ekstrakurikuler && st.ekstrakurikuler.length > 0 ? (
                  <ul className="space-y-1">
                    {st.ekstrakurikuler.map((ek, i) => (
                      <li key={i} className="text-xs">
                        • <strong>{ek.nama}</strong> ({ek.predikat}) — {ek.keterangan || 'Aktif'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">• Pramuka Penggalang (Aktif)</p>
                )}
              </div>

              {/* Prestasi */}
              <div className="border border-slate-300 p-2 rounded">
                <div className="font-bold border-b border-slate-300 pb-1 mb-1 text-[11px] uppercase">
                  H. PRESTASI & PENGHARGAAN
                </div>
                {st.prestasi && st.prestasi.length > 0 ? (
                  <ul className="space-y-1">
                    {st.prestasi.map((pr, i) => (
                      <li key={i} className="text-xs">
                        • <strong>{pr.namaPrestasi}</strong> ({pr.tingkat}, {pr.tahun})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 italic text-[11px]">Tidak ada catatan prestasi khusus.</p>
                )}
              </div>
            </div>

            {/* I. MUTASI KELUAR / KELULUSAN */}
            <div className="mb-4 font-sans text-xs">
              <div className="bg-slate-100 px-2 py-0.5 font-bold border-y border-slate-300 uppercase text-[11px]">
                I. KETERANGAN MENINGGALKAN SEKOLAH / MUTASI / KELULUSAN
              </div>
              <table className="w-full mt-1 border-collapse text-xs">
                <tbody>
                  <tr>
                    <td className="w-56 py-0.5 text-slate-700">24. Status Akhir Siswa</td>
                    <td className="w-3">:</td>
                    <td className="py-0.5 font-bold">{st.status} (Kelas {st.kelasSekarang})</td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-slate-700">25. Tanggal Keluar / Mutasi / Lulus</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5 font-medium">
                      {st.tanggalLulus
                        ? `Lulus: ${formatDateIndonesian(st.tanggalLulus)}`
                        : st.tanggalMutasi
                        ? `Mutasi: ${formatDateIndonesian(st.tanggalMutasi)}`
                        : '- (Masih Belajar)'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-slate-700">26. Alasan Keluar / Sekolah Lanjutan</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5 font-medium">
                      {st.melanjutkanKe
                        ? `Melanjutkan ke ${st.melanjutkanKe}`
                        : st.pindahKeSekolah
                        ? `Pindah ke ${st.pindahKeSekolah} (${st.alasanMutasi || 'Pindah tempat tinggal'})`
                        : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-0.5 text-slate-700">27. No. Ijazah SMP / Sertifikat Kelulusan</td>
                    <td className="py-0.5">:</td>
                    <td className="py-0.5 font-mono">{st.noIjazahSmp || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* PENGESAHAN AKHIR LEMBAR 2 */}
            <div className="mt-6 pt-2 font-sans text-xs">
              <div className="flex justify-between items-start text-center">
                <div className="w-48 text-left text-[10px] text-slate-500">
                  <p>Catatan:</p>
                  <p>Lembar ini sah bila dibubuhi cap stempel resmi sekolah.</p>
                </div>

                <div className="w-60">
                  <p>Kasihan, {formatDateIndonesian(new Date().toISOString())}</p>
                  <p className="font-semibold">Kepala {schoolProfile.namaSekolah || 'SMP N 2 Kasihan'}</p>
                  <div className="h-16 flex items-end justify-center">
                    <div>
                      <p className="font-bold underline">{schoolProfile.kepalaSekolah || 'Drs. H. Sugeng Riyadi, M.Pd.'}</p>
                      <p className="text-[10px] text-slate-600">NIP. {schoolProfile.nipKepalaSekolah || '196803151994121002'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-1 border-t border-slate-300 flex items-center justify-between text-[9px] text-slate-400 font-sans">
              <span>Lembar 2 Buku Induk Siswa • {schoolProfile.namaSekolah} Bantul</span>
              <span>Dokumen Arsip Abadi Pendidikan Nasional</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Screen Controls (Hidden during print) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Kembali ke Data Siswa"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Cetak Lembar Resmi Buku Induk Siswa</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  {students.length} Siswa Terdaftar
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Format Standar Kemendikbudristek RI • Kertas F4/A4 Standar Arsip Nasional (Lembar I & Lembar II)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode Cetak Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setPrintMode('full')}
                className={`px-2.5 py-1.5 rounded-md transition ${
                  printMode === 'full' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lengkap (Lembar 1 & 2)
              </button>
              <button
                onClick={() => setPrintMode('sheet1')}
                className={`px-2.5 py-1.5 rounded-md transition ${
                  printMode === 'sheet1' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lembar 1 Saja
              </button>
              <button
                onClick={() => setPrintMode('sheet2')}
                className={`px-2.5 py-1.5 rounded-md transition ${
                  printMode === 'sheet2' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lembar 2 Saja
              </button>
              <button
                onClick={() => setPrintMode('batch_class')}
                className={`px-2.5 py-1.5 rounded-md transition ${
                  printMode === 'batch_class' ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Cetak seluruh siswa dalam satu kelas sekaligus"
              >
                Cetak 1 Kelas ({filteredStudents.length})
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>
                {printMode === 'batch_class'
                  ? `Cetak Seluruh ${filteredStudents.length} Siswa`
                  : 'Cetak / Simpan PDF Lembar Induk'}
              </span>
            </button>
          </div>
        </div>

        {/* Filter and Selection Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          {/* Class Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Pilih Rombel / Kelas:</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">Semua Rombel ({students.length} Siswa)</option>
              {classesList.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls} ({students.filter((s) => s.kelasSekarang === cls).length} Siswa)
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Cari Siswa (Nama / NISN / NIS):</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Ketik Nama, NISN, atau No Induk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Student Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Pilih Siswa ({currentIdx + 1} dari {filteredStudents.length}):
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Siswa Sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={activeStudent?.id || ''}
                onChange={(e) => {
                  setCurrentStudentId(e.target.value);
                  const found = students.find((s) => s.id === e.target.value);
                  if (found) onSelectStudent(found);
                }}
                className="flex-1 px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-800 truncate"
              >
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.noUrutInduk} - {s.namaLengkap} ({s.kelasSekarang})
                  </option>
                ))}
              </select>

              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                title="Siswa Berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Print Instructions & PDF Guide */}
      <div className="max-w-4xl mx-auto p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 print:hidden space-y-2">
        <h4 className="font-bold flex items-center gap-2 text-blue-950">
          <FileText className="w-4 h-4 text-blue-700" />
          <span>Petunjuk Cetak & Simpan ke PDF Resmi:</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 text-blue-800 text-[11px]">
          <li><strong>Simpan ke PDF:</strong> Klik tombol <em>&ldquo;Cetak / Simpan PDF&rdquo;</em>, lalu pada jendela browser ubah <strong>Destination (Tujuan)</strong> menjadi <strong>&ldquo;Save as PDF (Simpan sebagai PDF)&rdquo;</strong>.</li>
          <li><strong>Ukuran Kertas:</strong> Gunakan kertas F4 / Folio (21.5 x 33 cm) atau A4 (21 x 29.7 cm) standar dokumen Buku Induk.</li>
          <li><strong>Margin:</strong> Atur margin printer ke <em>&ldquo;Default&rdquo;</em> atau <em>&ldquo;Minimum&rdquo;</em> dan centang opsi <em>&ldquo;Background graphics (Grafis latar belakang)&rdquo;</em> agar kop surat dan warna tabel tercetak sempurna.</li>
        </ul>
      </div>

      {/* RENDER PREVIEW / PRINT CANVAS */}
      {printMode === 'batch_class' ? (
        <div className="space-y-6">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs font-semibold border border-blue-200 print:hidden text-center">
            Menampilkan Lembar Buku Induk untuk <strong>{filteredStudents.length} siswa</strong> di {selectedClass === 'all' ? 'Seluruh Kelas' : `Kelas ${selectedClass}`}. Klik tombol <strong>Cetak</strong> untuk mencetak semua siswa sekaligus.
          </div>
          {filteredStudents.map((st, i) => renderSingleStudentDoc(st, i + 1))}
        </div>
      ) : (
        activeStudent && renderSingleStudentDoc(activeStudent)
      )}
    </div>
  );
};
