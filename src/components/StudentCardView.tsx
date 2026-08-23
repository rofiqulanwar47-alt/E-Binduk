import React, { useState, useMemo } from 'react';
import {
  Printer,
  ArrowLeft,
  School,
  QrCode,
  ShieldCheck,
  Search,
  Users,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Grid,
} from 'lucide-react';
import { Student, SchoolProfile } from '../types';
import { formatDateIndonesian } from '../utils/formatters';
import { PrintGuideBanner } from './PrintGuideBanner';
import { DEFAULT_LOGO_BANTUL, DEFAULT_LOGO_TUTWURI } from '../utils/defaultLogos';

interface StudentCardViewProps {
  students: Student[];
  selectedStudent: Student | null;
  schoolProfile: SchoolProfile;
  onBack: () => void;
  onSelectStudent: (student: Student) => void;
}

export const StudentCardView: React.FC<StudentCardViewProps> = ({
  students,
  selectedStudent,
  schoolProfile,
  onBack,
  onSelectStudent,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cardPrintMode, setCardPrintMode] = useState<'single' | 'grid_sheet'>('single');

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
          s.nis.includes(q);
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

  const activeStudent = useMemo(() => {
    return (
      students.find((s) => s.id === currentStudentId) ||
      selectedStudent ||
      filteredStudents[0] ||
      students[0]
    );
  }, [students, currentStudentId, selectedStudent, filteredStudents]);

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
        <p className="text-slate-600">Tidak ada data siswa untuk membuat kartu pelajar.</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
        >
          Kembali ke Data Siswa
        </button>
      </div>
    );
  }

  // Render Front Side of Single Card
  const renderCardFront = (s: Student) => (
    <div className="w-[360px] h-[225px] rounded-xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-3.5 shadow-md relative overflow-hidden border border-blue-500/40 flex flex-col justify-between print:shadow-none print:border-slate-800 shrink-0">
      {/* Decorative background watermark */}
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-6 translate-y-6">
        <School className="w-36 h-36 text-white" />
      </div>

      {/* Header Card */}
      <div className="flex items-center gap-2 border-b border-blue-500/30 pb-1.5 relative z-10">
        <div className="w-7 h-7 rounded-lg bg-white p-0.5 flex items-center justify-center shadow shrink-0">
          <img
            src={schoolProfile.logoBantulUrl || DEFAULT_LOGO_BANTUL}
            alt="Logo Kab Bantul"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_BANTUL;
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[8px] uppercase font-bold tracking-wider text-blue-200 truncate">
            Pemerintah Kab. {schoolProfile.kabupaten || 'Bantul'} • Dikpora
          </h4>
          <h3 className="text-[11px] font-black tracking-wide text-white uppercase truncate">
            {schoolProfile.namaSekolah || 'SMP NEGERI 2 KASIHAN'}
          </h3>
          <p className="text-[7.5px] text-blue-100/80 font-medium">
            KARTU TANDA PELAJAR • TP {schoolProfile.tahunAjaranAktif}
          </p>
        </div>
        <div className="w-6 h-6 rounded-md bg-white/90 p-0.5 flex items-center justify-center shadow shrink-0">
          <img
            src={schoolProfile.logoTutwuriUrl || DEFAULT_LOGO_TUTWURI}
            alt="Logo Tut Wuri"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_TUTWURI;
            }}
          />
        </div>
      </div>

      {/* Body Card */}
      <div className="flex items-center gap-3 my-0.5 relative z-10">
        {/* Student Photo */}
        <div className="w-16 h-20 rounded border border-blue-400/80 shadow-xs bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
          {s.fotoUrl ? (
            <img
              src={s.fotoUrl}
              alt={s.namaLengkap}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-[8px] text-slate-400 text-center font-sans">
              Foto<br />3x4
            </div>
          )}
        </div>

        {/* Student Bio */}
        <div className="space-y-0.5 text-[9px] flex-1 min-w-0 font-sans">
          <div className="font-extrabold text-[11px] text-blue-300 truncate leading-tight">
            {s.namaLengkap}
          </div>
          <div className="text-slate-200 font-mono text-[8.5px]">
            NISN: <strong className="text-white">{s.nisn}</strong> &nbsp;|&nbsp; NIS: <strong className="text-white">{s.nis}</strong>
          </div>
          <div className="text-slate-300 text-[8.5px]">
            Kelas: <strong className="text-blue-200">Kelas {s.kelasSekarang}</strong> &nbsp;|&nbsp; Gol: <strong className="text-red-400">{s.jasmani?.golonganDarah || 'O'}</strong>
          </div>
          <div className="text-slate-300 text-[8.5px] truncate">
            TTL: {s.tempatLahir}, {formatDateIndonesian(s.tanggalLahir)}
          </div>
          <div className="text-slate-300 text-[8px] truncate">
            Alamat: {s.tempatTinggal?.kelurahan || 'Bangunjiwo'}, {s.tempatTinggal?.kecamatan || 'Kasihan'}
          </div>
        </div>
      </div>

      {/* Footer Card */}
      <div className="flex items-center justify-between pt-1 border-t border-blue-500/30 text-[7.5px] text-blue-200/90 relative z-10">
        <div>
          <div className="font-mono text-[8px] tracking-wider bg-white text-slate-900 px-1.5 py-0.2 rounded font-bold">
            ||| |||| || {s.nisn} ||
          </div>
          <span className="text-[6.5px] text-blue-300">Siswa Aktif SMPN 2 Kasihan</span>
        </div>

        <div className="text-right">
          <div>Kepala Sekolah,</div>
          <div className="font-bold text-white text-[8px] underline">
            {schoolProfile.kepalaSekolah}
          </div>
        </div>
      </div>
    </div>
  );

  // Render Back Side of Single Card
  const renderCardBack = (s: Student) => (
    <div className="w-[360px] h-[225px] rounded-xl bg-white text-slate-900 p-3.5 shadow-md border border-slate-300 flex flex-col justify-between print:shadow-none print:border-slate-800 shrink-0 font-sans">
      <div>
        <div className="text-center border-b border-slate-200 pb-1 mb-1.5">
          <h4 className="text-[10px] font-bold text-slate-900 uppercase">
            TATA TERTIB KARTU PELAJAR
          </h4>
          <p className="text-[7.5px] text-slate-500">{schoolProfile.namaSekolah} Bantul</p>
        </div>

        <ol className="list-decimal list-inside text-[8px] text-slate-700 space-y-0.5 leading-tight">
          <li>Kartu ini adalah tanda bukti sah siswa {schoolProfile.namaSekolah}.</li>
          <li>Wajib dibawa setiap hari dan digunakan untuk presensi & perpustakaan.</li>
          <li>Kartu ini tidak dapat dipindahtangankan kepada orang lain.</li>
          <li>Bila kartu hilang / rusak segera lapor ke Bagian Tata Usaha (TU).</li>
          <li>Barang siapa menemukan kartu ini, harap mengembalikan ke alamat sekolah.</li>
        </ol>
      </div>

      <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between text-[7.5px] text-slate-600">
        <div className="max-w-[240px]">
          <strong className="block text-slate-900 font-bold text-[8px]">{schoolProfile.namaSekolah}</strong>
          <span className="truncate block">{schoolProfile.alamat}, {schoolProfile.kecamatan}, {schoolProfile.kabupaten}</span>
          <span className="block">Telp: {schoolProfile.noTelepon}</span>
        </div>

        <div className="w-10 h-10 bg-slate-50 rounded border border-slate-300 flex flex-col items-center justify-center p-0.5 shrink-0">
          <QrCode className="w-6 h-6 text-slate-800" />
          <span className="text-[5.5px] font-bold text-slate-600">VERIFIED</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header Controls (Hidden during print) */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Kembali"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Kartu Tanda Pelajar Digital (KTP-S)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  {students.length} Siswa Terdaftar
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Desain ID Card Standar ISO/IEC 7810 (85.6 × 54 mm) • Barcode NISN Siap Scan Perpustakaan & Presensi
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setCardPrintMode('single')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                  cardPrintMode === 'single'
                    ? 'bg-white shadow-xs text-blue-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>1 Siswa (Depan & Belakang)</span>
              </button>
              <button
                onClick={() => setCardPrintMode('grid_sheet')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                  cardPrintMode === 'grid_sheet'
                    ? 'bg-blue-600 text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Lembar Massal Grid A4 ({filteredStudents.length} Siswa)</span>
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>
                {cardPrintMode === 'grid_sheet'
                  ? `Cetak Lembar Kartu (${filteredStudents.length} Siswa)`
                  : 'Cetak Kartu Siswa Ini'}
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
              onChange={(e) => setSelectedClass(e.target.value)}
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
                    {s.namaLengkap} - Kelas {s.kelasSekarang}
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

      {/* Print Instructions Banner */}
      <PrintGuideBanner />

      {/* CARD VIEW DISPLAY */}
      {cardPrintMode === 'single' ? (
        <div className="flex flex-col items-center justify-center gap-6 py-6 print:py-0">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div>
              <p className="text-center text-xs font-bold text-slate-500 mb-2 print:hidden">Tampak Depan</p>
              {activeStudent && renderCardFront(activeStudent)}
            </div>
            <div>
              <p className="text-center text-xs font-bold text-slate-500 mb-2 print:hidden">Tampak Belakang</p>
              {activeStudent && renderCardBack(activeStudent)}
            </div>
          </div>
        </div>
      ) : (
        /* Massal Grid Print Mode (8 Cards per sheet / A4 layout) */
        <div className="space-y-4">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs font-semibold border border-blue-200 print:hidden text-center">
            Mode Cetak Massal Lembar Kartu Pelajar: Menampilkan <strong>{filteredStudents.length} siswa</strong>. Setiap lembar memuat kartu siap potong.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 justify-items-center">
            {filteredStudents.map((st) => (
              <div key={st.id} className="p-2 border border-slate-200 rounded-xl bg-white shadow-xs page-break-inside-avoid">
                {renderCardFront(st)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Instructions */}
      <div className="max-w-2xl mx-auto p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 print:hidden">
        <h4 className="font-bold flex items-center gap-2 mb-1 text-blue-950">
          <ShieldCheck className="w-4 h-4 text-blue-700" />
          <span>Petunjuk Pencetakan Kartu Pelajar:</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 text-blue-800 text-[11px]">
          <li>Gunakan kertas PVC Card / Photo Paper glossy tebal (230 - 260 gsm) untuk hasil tajam tahan lama.</li>
          <li>Atur margin printer ke <em>&ldquo;None / Minimum&rdquo;</em> dan skala <em>&ldquo;100% (Actual Size)&rdquo;</em>.</li>
          <li>Barcode NISN dapat di-scan langsung menggunakan barcode scanner laser pada aplikasi perpustakaan dan presensi.</li>
        </ul>
      </div>
    </div>
  );
};
