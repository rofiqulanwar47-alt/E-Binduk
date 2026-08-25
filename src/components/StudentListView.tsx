import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Printer,
  CreditCard,
  Sparkles,
  LayoutGrid,
  List,
  CheckSquare,
  Square,
  HeartHandshake,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SortAsc,
  Calculator,
  GraduationCap,
  TrendingUp,
  ArrowRightLeft,
  UserCheck,
  UserMinus,
  School,
  Layers,
} from 'lucide-react';
import { Student, UserAccount, SchoolProfile } from '../types';
import { calculateAge, exportStudentsToCsv, formatDateIndonesian } from '../utils/formatters';
import { getStudentPhoto } from '../utils/studentPhotos';
import { ImportStudentExcelModal } from './ImportStudentExcelModal';
import { ClassPromotionModal } from './ClassPromotionModal';
import { GraduationModal } from './GraduationModal';
import { MutationModal } from './MutationModal';

interface StudentListViewProps {
  students: Student[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser?: UserAccount;
  schoolProfile?: SchoolProfile;
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onEditScores?: (student: Student, semester?: number) => void;
  onDeleteStudent: (studentId: string) => void;
  onDeleteMultipleStudents?: (studentIds: string[]) => void;
  onOpenNewStudent: () => void;
  onPrintMasterSheet: (student: Student) => void;
  onPrintCard: (student: Student) => void;
  onAnalyzeAi: (student: Student) => void;
  onImportStudents?: (importedStudents: Student[], mode: 'append' | 'replace') => void;
  onPromoteStudents?: (
    promotions: { studentId: string; targetClass: string; newAcademicYear: string }[]
  ) => Promise<void> | void;
  onGraduateStudents?: (
    graduations: {
      studentId: string;
      tanggalLulus: string;
      melanjutkanKe: string;
      noIjazahSmp?: string;
    }[]
  ) => Promise<void> | void;
  onSaveMutationMasuk?: (student: Student) => Promise<void> | void;
  onSaveMutationKeluar?: (
    studentId: string,
    mutationData: {
      tanggalMutasi: string;
      pindahKeSekolah: string;
      alasanMutasi: string;
    }
  ) => Promise<void> | void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  students,
  searchQuery,
  setSearchQuery,
  currentUser,
  schoolProfile = {
    namaSekolah: 'SMP NEGERI 2 KASIHAN',
    npsn: '20400331',
    nss: '201040103001',
    alamatLengkap: 'Jl. Bibis, Kasihan, Bantul, D.I. Yogyakarta 55184',
    kelurahan: 'Bangunjiwo',
    kecamatan: 'Kasihan',
    kabupatenKota: 'Kabupaten Bantul',
    provinsi: 'D.I. Yogyakarta',
    kodePos: '55184',
    telepon: '(0274) 412345',
    email: 'smpn2kasihan@bantulkab.go.id',
    website: 'https://smpn2kasihan.sch.id',
    kepalaSekolah: 'Drs. H. Wardiyanto, M.Pd.',
    nipKepalaSekolah: '19680512 199412 1 002',
    tahunAjaranAktif: '2024/2025',
    semesterAktif: 1,
    akreditasi: 'A',
    logoUrl: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&q=80&w=200',
  },
  onSelectStudent,
  onEditStudent,
  onEditScores,
  onDeleteStudent,
  onDeleteMultipleStudents,
  onOpenNewStudent,
  onPrintMasterSheet,
  onPrintCard,
  onAnalyzeAi,
  onImportStudents,
  onPromoteStudents,
  onGraduateStudents,
  onSaveMutationMasuk,
  onSaveMutationKeluar,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedWelfare, setSelectedWelfare] = useState<string>('all');
  
  // Sorting: Default 'kelas_nama' (Urut Kelas lalu Abjad Nama)
  const [sortBy, setSortBy] = useState<'kelas_nama' | 'nama' | 'noInduk' | 'nisn' | 'kelas'>('kelas_nama');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination
  const [pageSize, setPageSize] = useState<number | 'all'>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // New Modals State
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState<boolean>(false);
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState<boolean>(false);
  const [isMutationModalOpen, setIsMutationModalOpen] = useState<boolean>(false);
  const [mutationModalMode, setMutationModalMode] = useState<'masuk' | 'keluar'>('masuk');
  const [selectedStudentForMutation, setSelectedStudentForMutation] = useState<Student | null>(null);
  const [selectedStudentsForPromotion, setSelectedStudentsForPromotion] = useState<Student[]>([]);
  const [selectedStudentsForGraduation, setSelectedStudentsForGraduation] = useState<Student[]>([]);

  // Permission flags (default to true if currentUser not specified)
  const canCreateStudent = currentUser ? currentUser.permissions.canCreateStudent : true;
  const canEditStudent = currentUser ? currentUser.permissions.canEditStudent : true;
  const canDeleteStudent = currentUser ? currentUser.permissions.canDeleteStudent : true;
  const canExportData = currentUser ? currentUser.permissions.canExportData : true;
  const canImportExcel = currentUser ? (currentUser.permissions.canImportExcel || currentUser.role === 'admin' || currentUser.role === 'petugas_tu') : true;
  const canPrintBukuInduk = currentUser ? currentUser.permissions.canPrintBukuInduk : true;
  const canPrintStudentCard = currentUser ? currentUser.permissions.canPrintStudentCard : true;
  const canEditScoresFlag = currentUser ? currentUser.permissions.canEditScores : true;
  const canAccessAi = currentUser ? currentUser.permissions.canAccessAiAssistant : true;

  // Counts for pills
  const counts = useMemo(() => {
    let all = students.length;
    let aktif = 0;
    let k7 = 0;
    let k8 = 0;
    let k9 = 0;
    let mutasiMasuk = 0;
    let mutasiKeluar = 0;
    let lulus = 0;

    students.forEach((s) => {
      if (s.status === 'Aktif') aktif++;
      if (s.status === 'Mutasi Masuk') mutasiMasuk++;
      if (s.status === 'Mutasi Keluar') mutasiKeluar++;
      if (s.status === 'Lulus') lulus++;

      if (s.kelasSekarang?.startsWith('7')) k7++;
      else if (s.kelasSekarang?.startsWith('8')) k8++;
      else if (s.kelasSekarang?.startsWith('9')) k9++;
    });

    return { all, aktif, k7, k8, k9, mutasiMasuk, mutasiKeluar, lulus };
  }, [students]);

  // Unique list of classes
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

  // Quick Open Modal Handlers
  const handleOpenPromotionForSelection = (customList?: Student[]) => {
    if (customList && customList.length > 0) {
      setSelectedStudentsForPromotion(customList);
    } else if (selectedIds.length > 0) {
      const selected = students.filter(
        (s) => selectedIds.includes(s.id) && (s.kelasSekarang?.startsWith('7') || s.kelasSekarang?.startsWith('8'))
      );
      setSelectedStudentsForPromotion(selected.length > 0 ? selected : []);
    } else {
      setSelectedStudentsForPromotion([]);
    }
    setIsPromotionModalOpen(true);
  };

  const handleOpenGraduationForSelection = (customList?: Student[]) => {
    if (customList && customList.length > 0) {
      setSelectedStudentsForGraduation(customList);
    } else if (selectedIds.length > 0) {
      const selected = students.filter(
        (s) => selectedIds.includes(s.id) && s.kelasSekarang?.startsWith('9')
      );
      setSelectedStudentsForGraduation(selected.length > 0 ? selected : []);
    } else {
      setSelectedStudentsForGraduation([]);
    }
    setIsGraduationModalOpen(true);
  };

  const handleOpenMutation = (mode: 'masuk' | 'keluar', student?: Student) => {
    setMutationModalMode(mode);
    setSelectedStudentForMutation(student || null);
    setIsMutationModalOpen(true);
  };

  // Helper for natural class parsing
  const parseClassOrder = (cls: string) => {
    if (!cls) return { grade: 999, section: 'Z' };
    const match = cls.trim().match(/^(\d+)\s*([A-Za-z]*)/);
    if (match) {
      return { grade: parseInt(match[1], 10), section: match[2].toUpperCase() };
    }
    if (cls.toLowerCase().includes('alumni')) return { grade: 900, section: 'A' };
    return { grade: 800, section: cls.toUpperCase() };
  };

  // Filtered & Sorted students
  const filteredAndSortedStudents = useMemo(() => {
    const filtered = students.filter((s) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName =
          (s.namaLengkap || '').toLowerCase().includes(q) ||
          (s.namaPanggilan && s.namaPanggilan.toLowerCase().includes(q));
        const matchNisn = (s.nisn || '').includes(q);
        const matchNis = (s.nis || '').includes(q);
        const matchNik = (s.nik || '').includes(q);
        const matchInduk = (s.noUrutInduk || '').toLowerCase().includes(q);
        const matchParent =
          (s.dataOrangTua?.namaAyah || '').toLowerCase().includes(q) ||
          (s.dataOrangTua?.namaIbu || '').toLowerCase().includes(q);
        const matchDusun =
          (s.tempatTinggal?.dusun || '').toLowerCase().includes(q) ||
          (s.tempatTinggal?.kelurahan || '').toLowerCase().includes(q);

        if (!matchName && !matchNisn && !matchNis && !matchNik && !matchInduk && !matchParent && !matchDusun) {
          return false;
        }
      }

      // Class filter
      if (selectedClass !== 'all') {
        if (selectedClass === '7' && !s.kelasSekarang.startsWith('7')) return false;
        if (selectedClass === '8' && !s.kelasSekarang.startsWith('8')) return false;
        if (selectedClass === '9' && !s.kelasSekarang.startsWith('9')) return false;
        if (selectedClass === 'Alumni' && s.status !== 'Lulus') return false;
        if (!['7', '8', '9', 'Alumni'].includes(selectedClass) && s.kelasSekarang !== selectedClass) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all' && s.status !== selectedStatus) {
        return false;
      }

      // Gender filter
      if (selectedGender !== 'all' && s.jenisKelamin !== selectedGender) {
        return false;
      }

      // Admission Track filter
      if (selectedTrack !== 'all' && s.jalurMasuk !== selectedTrack) {
        return false;
      }

      // Welfare filter
      if (selectedWelfare === 'kip' && !s.kesejahteraan?.penerimaKip) return false;
      if (selectedWelfare === 'kms' && !s.kesejahteraan?.penerimaKmsBantul) return false;
      if (selectedWelfare === 'non' && (s.kesejahteraan?.penerimaKip || s.kesejahteraan?.penerimaKmsBantul))
        return false;

      return true;
    });

    // Sort
    return filtered.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'kelas_nama') {
        const classA = parseClassOrder(a.kelasSekarang);
        const classB = parseClassOrder(b.kelasSekarang);
        if (classA.grade !== classB.grade) {
          cmp = classA.grade - classB.grade;
        } else if (classA.section !== classB.section) {
          cmp = classA.section.localeCompare(classB.section);
        } else {
          cmp = (a.namaLengkap || '').localeCompare(b.namaLengkap || '', 'id', { sensitivity: 'base' });
        }
      } else if (sortBy === 'nama') {
        cmp = (a.namaLengkap || '').localeCompare(b.namaLengkap || '', 'id', { sensitivity: 'base' });
      } else if (sortBy === 'noInduk') {
        cmp = (a.noUrutInduk || '').localeCompare(b.noUrutInduk || '', undefined, { numeric: true });
      } else if (sortBy === 'nisn') {
        cmp = (a.nisn || '').localeCompare(b.nisn || '', undefined, { numeric: true });
      } else if (sortBy === 'kelas') {
        const classA = parseClassOrder(a.kelasSekarang);
        const classB = parseClassOrder(b.kelasSekarang);
        if (classA.grade !== classB.grade) {
          cmp = classA.grade - classB.grade;
        } else if (classA.section !== classB.section) {
          cmp = classA.section.localeCompare(classB.section);
        } else {
          cmp = (a.namaLengkap || '').localeCompare(b.namaLengkap || '', 'id', { sensitivity: 'base' });
        }
      }

      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [
    students,
    searchQuery,
    selectedClass,
    selectedStatus,
    selectedGender,
    selectedTrack,
    selectedWelfare,
    sortBy,
    sortOrder,
  ]);

  // Reset to page 1 whenever filters or sorting change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedClass,
    selectedStatus,
    selectedGender,
    selectedTrack,
    selectedWelfare,
    sortBy,
    sortOrder,
    pageSize,
  ]);

  // Total pages
  const totalItems = filteredAndSortedStudents.length;
  const currentNumericPageSize = pageSize === 'all' ? totalItems : pageSize;
  const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(totalItems / currentNumericPageSize));

  // Clamped current page
  const activePage = Math.min(currentPage, totalPages);

  // Paginated slice
  const paginatedStudents = useMemo(() => {
    if (pageSize === 'all') return filteredAndSortedStudents;
    const start = (activePage - 1) * pageSize;
    return filteredAndSortedStudents.slice(start, start + pageSize);
  }, [filteredAndSortedStudents, activePage, pageSize]);

  // Pagination bounds
  const startItemIndex = totalItems === 0 ? 0 : pageSize === 'all' ? 1 : (activePage - 1) * pageSize + 1;
  const endItemIndex = totalItems === 0 ? 0 : pageSize === 'all' ? totalItems : Math.min(activePage * pageSize, totalItems);

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = () => {
    const pageIds = paginatedStudents.map((s) => s.id);
    const allPageSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleSortColumn = (column: 'kelas_nama' | 'nama' | 'noInduk' | 'nisn' | 'kelas') => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Generate smart pagination numbers
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | 'ellipsis')[] = [];
    pages.push(1);

    if (activePage > 3) {
      pages.push('ellipsis');
    }

    const start = Math.max(2, activePage - 1);
    const end = Math.min(totalPages - 1, activePage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (activePage < totalPages - 2) {
      pages.push('ellipsis');
    }

    pages.push(totalPages);
    return pages;
  }, [totalPages, activePage]);

  return (
    <div className="space-y-4 pb-12">
      {/* Header Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
              <span>Master Data Buku Induk Siswa</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold border border-blue-200">
                {totalItems} Siswa
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar register buku induk resmi SMP Negeri 2 Kasihan Bantul (Urut Kelas 7A-9D & Abjad Nama)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Naik Kelas Action Button */}
            {canEditStudent && onPromoteStudents && (
              <button
                type="button"
                onClick={() => handleOpenPromotionForSelection()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition cursor-pointer"
                title="Proses Kenaikan Kelas 7 dan 8 ke tingkat berikutnya untuk tahun ajaran baru"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Naik Kelas</span>
              </button>
            )}

            {/* Luluskan Action Button */}
            {canEditStudent && onGraduateStudents && (
              <button
                type="button"
                onClick={() => handleOpenGraduationForSelection()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition cursor-pointer"
                title="Proses Kelulusan Siswa Kelas 9 dan masukkan ke data register Alumni resmi"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Luluskan (Alumni)</span>
              </button>
            )}

            {/* Mutasi Siswa Action Button */}
            {canEditStudent && (
              <button
                type="button"
                onClick={() => handleOpenMutation('masuk')}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition cursor-pointer"
                title="Pencatatan Siswa Mutasi Masuk atau Keluar"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Mutasi Siswa</span>
              </button>
            )}

            {canImportExcel && (
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-xs cursor-pointer"
                title="Impor data siswa baru atau perbarui dari file Excel"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600 rotate-180" />
                <span>Impor Excel</span>
              </button>
            )}

            {canExportData && (
              <button
                onClick={() => exportStudentsToCsv(filteredAndSortedStudents)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Ekspor CSV ({totalItems})</span>
              </button>
            )}

            {canCreateStudent && (
              <button
                onClick={onOpenNewStudent}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Siswa</span>
              </button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                title="Tampilan Tabel Master"
                className={`p-1.5 rounded-md cursor-pointer ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Tampilan Kartu Identitas"
                className={`p-1.5 rounded-md cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={() => {
              setSelectedClass('all');
              setSelectedStatus('all');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer ${
              selectedClass === 'all' && selectedStatus === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Semua ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedClass('all');
              setSelectedStatus('Aktif');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer ${
              selectedStatus === 'Aktif' && selectedClass === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Aktif ({counts.aktif})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedClass('7');
              setSelectedStatus('all');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer ${
              selectedClass === '7'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Kelas 7 ({counts.k7})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedClass('8');
              setSelectedStatus('all');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer ${
              selectedClass === '8'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Kelas 8 ({counts.k8})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedClass('9');
              setSelectedStatus('all');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer ${
              selectedClass === '9'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Kelas 9 ({counts.k9})
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedClass('all');
              setSelectedStatus('Mutasi Masuk');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'Mutasi Masuk'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Mutasi Masuk ({counts.mutasiMasuk})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedClass('all');
              setSelectedStatus('Mutasi Keluar');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'Mutasi Keluar'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Mutasi Keluar ({counts.mutasiKeluar})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedClass('all');
              setSelectedStatus('Lulus');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'Lulus'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Alumni ({counts.lulus})</span>
          </button>
        </div>

        {/* Contextual Action Banner */}
        {selectedClass === '9' && canEditStudent && onGraduateStudents && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-purple-950">
              <GraduationCap className="w-4 h-4 text-purple-700 shrink-0" />
              <span>
                <strong>Menu Kelulusan Kelas 9:</strong> Memudahkan pengisian data saat ganti tahun pelajaran. Klik tombol kelulusan untuk memindahkan siswa kelas 9 ke daftar Alumni resmi.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenGraduationForSelection()}
              className="px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold whitespace-nowrap shadow-xs cursor-pointer flex items-center gap-1 self-start sm:self-auto"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Luluskan Seluruh Kelas 9</span>
            </button>
          </div>
        )}

        {(selectedClass === '7' || selectedClass === '8') && canEditStudent && onPromoteStudents && (
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-teal-950">
              <TrendingUp className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                <strong>Menu Kenaikan Kelas {selectedClass}:</strong> Melanjutkan siswa ke tingkat berikutnya ({selectedClass === '7' ? 'Kelas 7 ➔ Kelas 8' : 'Kelas 8 ➔ Kelas 9'}) secara otomatis dari data yang sudah ada.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenPromotionForSelection()}
              className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg font-bold whitespace-nowrap shadow-xs cursor-pointer flex items-center gap-1 self-start sm:self-auto"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Naik Kelas {selectedClass}</span>
            </button>
          </div>
        )}

        {(selectedStatus === 'Mutasi Masuk' || selectedStatus === 'Mutasi Keluar') && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-950">
              <ArrowRightLeft className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Manajemen Siswa Mutasi:</strong> Anda sedang melihat data siswa {selectedStatus}. Anda dapat mencatat siswa mutasi masuk baru atau mencatat mutasi keluar.
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleOpenMutation(selectedStatus === 'Mutasi Masuk' ? 'masuk' : 'keluar')}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold whitespace-nowrap shadow-xs cursor-pointer flex items-center gap-1 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah {selectedStatus}</span>
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari Nama, NISN, NIK, Dusun..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white transition-colors"
            />
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-2.5 py-1.5 sm:py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium"
            >
              <option value="all">Semua Tingkat/Kelas</option>
              <option value="7">Semua Kelas 7</option>
              <option value="8">Semua Kelas 8</option>
              <option value="9">Semua Kelas 9</option>
              <optgroup label="Kelas Spesifik">
                {classesList.map((cls) => (
                  <option key={cls} value={cls}>
                    Kelas {cls}
                  </option>
                ))}
              </optgroup>
              <option value="Alumni">Alumni / Lulus</option>
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 sm:py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium"
            >
              <option value="all">Semua Status Siswa</option>
              <option value="Aktif">Aktif</option>
              <option value="Lulus">Lulus (Alumni)</option>
              <option value="Mutasi Keluar">Mutasi Keluar</option>
              <option value="Mutasi Masuk">Mutasi Masuk</option>
            </select>
          </div>

          {/* Filter Jalur PPDB */}
          <div>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full px-2.5 py-1.5 sm:py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium"
            >
              <option value="all">Semua Jalur Masuk</option>
              <option value="Zonasi">Zonasi</option>
              <option value="Afirmasi">Afirmasi (KMS/KIP)</option>
              <option value="Prestasi">Prestasi</option>
              <option value="Perpindahan Tugas Orang Tua">Mutasi Orang Tua</option>
            </select>
          </div>

          {/* Filter Bantuan */}
          <div>
            <select
              value={selectedWelfare}
              onChange={(e) => setSelectedWelfare(e.target.value)}
              className="w-full px-2.5 py-1.5 sm:py-2 rounded-lg border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-colors text-slate-700 font-medium"
            >
              <option value="all">Semua Kesejahteraan</option>
              <option value="kip">Penerima KIP / PIP</option>
              <option value="kms">Penerima KMS Bantul</option>
              <option value="non">Non-Bantuan</option>
            </select>
          </div>
        </div>

        {/* Sort & Pagination Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
          {/* Sorting controls */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 flex items-center gap-1 text-[11px]">
              <SortAsc className="w-3.5 h-3.5 text-blue-600" />
              <span>Urutan Data:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="kelas_nama">Urut Kelas ➔ Abjad Nama (A - Z)</option>
              <option value="nama">Abjad Nama (A - Z)</option>
              <option value="noInduk">No. Induk Siswa</option>
              <option value="nisn">Nomor NISN</option>
              <option value="kelas">Kelas</option>
            </select>

            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700"
              title={sortOrder === 'asc' ? 'Urutan Meningkat (A-Z / 1-9)' : 'Urutan Menurun (Z-A / 9-1)'}
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-600" />}
            </button>
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] text-slate-500 font-medium">Tampilkan per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-slate-200 text-xs bg-slate-50 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={10}>10 per hal</option>
              <option value={25}>25 per hal</option>
              <option value={50}>50 per hal</option>
              <option value={100}>100 per hal</option>
              <option value="all">Semua ({totalItems})</option>
            </select>
          </div>
        </div>

        {/* Selected Batch Bar */}
        {selectedIds.length > 0 && (
          <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-blue-900">
              {selectedIds.length} siswa terpilih
            </span>
            <div className="flex items-center gap-2">
              {canExportData && (
                <button
                  onClick={() => {
                    const sel = students.filter((s) => selectedIds.includes(s.id));
                    exportStudentsToCsv(sel);
                  }}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition cursor-pointer"
                >
                  Ekspor Terpilih CSV
                </button>
              )}
              {onDeleteMultipleStudents && canDeleteStudent && (
                <button
                  onClick={() => onDeleteMultipleStudents(selectedIds)}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-semibold transition flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus {selectedIds.length} Terpilih</span>
                </button>
              )}
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1 text-slate-500 hover:text-slate-700 font-semibold cursor-pointer"
              >
                Batal Pilihan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content: Table or Cards */}
      {filteredAndSortedStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 uppercase tracking-tight">Tidak Ada Data Siswa Ditemukan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Coba sesuaikan kata kunci pencarian atau reset filter untuk menampilkan data Buku Induk.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedClass('all');
              setSelectedStatus('all');
              setSelectedGender('all');
              setSelectedTrack('all');
              setSelectedWelfare('all');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-100 select-none">
                  <th className="py-3 px-3 w-8 text-center">
                    <button onClick={handleSelectAllOnPage} className="text-slate-400 hover:text-slate-700" title="Pilih Semua di Halaman Ini">
                      {paginatedStudents.length > 0 && paginatedStudents.every((s) => selectedIds.includes(s.id)) ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-blue-700" onClick={() => handleSortColumn('noInduk')}>
                    <div className="flex items-center gap-1">
                      <span>No Induk / NISN</span>
                      {sortBy === 'noInduk' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                    </div>
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-blue-700" onClick={() => handleSortColumn('nama')}>
                    <div className="flex items-center gap-1">
                      <span>Nama Lengkap & Panggilan</span>
                      {(sortBy === 'nama' || sortBy === 'kelas_nama') && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                    </div>
                  </th>
                  <th className="py-3 px-3 cursor-pointer hover:text-blue-700" onClick={() => handleSortColumn('kelas')}>
                    <div className="flex items-center gap-1">
                      <span>Kelas</span>
                      {(sortBy === 'kelas' || sortBy === 'kelas_nama') && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                    </div>
                  </th>
                  <th className="py-3 px-3">L/P</th>
                  <th className="py-3 px-3">Tempat, Tanggal Lahir (Usia)</th>
                  <th className="py-3 px-3">Domisili / Dusun</th>
                  <th className="py-3 px-3">Nama Orang Tua</th>
                  <th className="py-3 px-3">Bantuan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center min-w-[220px] whitespace-nowrap bg-slate-100 text-slate-700">
                    Aksi Register
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedStudents.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  const isKip = student.kesejahteraan?.penerimaKip || student.kesejahteraan?.penerimaKmsBantul;

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-blue-50/30 transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleToggleSelect(student.id)}
                          className="text-slate-400 hover:text-slate-700"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      {/* No Induk & NISN */}
                      <td className="py-3 px-3 font-mono text-xs text-slate-600">
                        <div className="font-bold text-slate-800">{student.noUrutInduk}</div>
                        <div className="text-[11px] text-slate-500 font-mono">NISN: {student.nisn}</div>
                        <div className="text-[10px] text-slate-400 font-mono">NIS: {student.nis}</div>
                      </td>

                      {/* Nama Lengkap & Foto */}
                      <td className="py-3 px-3">
                        <div
                          className="flex items-center gap-2.5 cursor-pointer group"
                          onClick={() => onSelectStudent(student)}
                        >
                          <img
                            src={getStudentPhoto(student)}
                            alt={student.namaLengkap}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getStudentPhoto(student);
                            }}
                          />
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-blue-600 transition text-xs">
                              {student.namaLengkap}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Panggilan: &ldquo;{student.namaPanggilan || '-'}&rdquo; • NIK: {student.nik}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Kelas */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded font-bold text-xs bg-slate-100 text-slate-800 border border-slate-200">
                          {student.kelasSekarang}
                        </span>
                      </td>

                      {/* Gender */}
                      <td className="py-3 px-3 font-semibold text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            student.jenisKelamin === 'L'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-pink-50 text-pink-700 border border-pink-200'
                          }`}
                        >
                          {student.jenisKelamin}
                        </span>
                      </td>

                      {/* TTL & Usia */}
                      <td className="py-3 px-3 text-slate-600 text-xs">
                        <div>{student.tempatLahir}, {formatDateIndonesian(student.tanggalLahir)}</div>
                        <div className="text-[10px] text-slate-400 font-medium">
                          Usia: {calculateAge(student.tanggalLahir)} tahun
                        </div>
                      </td>

                      {/* Alamat / Dusun */}
                      <td className="py-3 px-3 text-slate-600 text-xs">
                        <div className="font-medium text-slate-800">
                          {student.tempatTinggal?.dusun || '-'}, {student.tempatTinggal?.kelurahan || '-'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {student.tempatTinggal?.kecamatan || 'Kasihan'}, {student.tempatTinggal?.kabupatenKota || 'Bantul'}
                        </div>
                      </td>

                      {/* Orang Tua */}
                      <td className="py-3 px-3 text-slate-600 text-xs">
                        <div>Ayah: <span className="font-medium text-slate-800">{student.dataOrangTua?.namaAyah || '-'}</span></div>
                        <div className="text-[10px] text-slate-400">
                          Ibu: {student.dataOrangTua?.namaIbu || '-'}
                        </div>
                      </td>

                      {/* Bantuan */}
                      <td className="py-3 px-3">
                        {isKip ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            <HeartHandshake className="w-3 h-3" />
                            <span>{student.kesejahteraan?.penerimaKmsBantul ? 'KMS/KIP' : 'KIP'}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <div className="space-y-1">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase inline-block ${
                              student.status === 'Aktif'
                                ? 'bg-green-100 text-green-700'
                                : student.status === 'Mutasi Masuk'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : student.status === 'Mutasi Keluar'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : student.status === 'Lulus'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {student.status}
                          </span>

                          {student.status === 'Mutasi Masuk' && (
                            <div className="text-[10px] text-emerald-800 font-medium leading-tight">
                              Dari: {student.pendidikanSebelumnya?.asalSdMi || 'Sekolah Lain'}
                            </div>
                          )}

                          {student.status === 'Mutasi Keluar' && (
                            <div className="text-[10px] text-amber-800 font-medium leading-tight">
                              Ke: {student.pindahKeSekolah || 'Sekolah Tujuan'}
                            </div>
                          )}

                          {student.status === 'Lulus' && student.melanjutkanKe && (
                            <div className="text-[10px] text-purple-800 font-medium leading-tight">
                              ➔ {student.melanjutkanKe}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions Register Bar */}
                      <td className="py-3 px-3 text-center whitespace-nowrap min-w-[220px]">
                        <div className="inline-flex items-center justify-center gap-1 bg-slate-50/80 p-1 rounded-lg border border-slate-200/80 shadow-2xs">
                          {/* 0. Contextual Naik Kelas / Luluskan */}
                          {canEditStudent && (student.kelasSekarang?.startsWith('7') || student.kelasSekarang?.startsWith('8')) && student.status === 'Aktif' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPromotionForSelection([student]);
                              }}
                              title={`Naikkan Kelas Siswa Ini ke Tingkat Berikutnya`}
                              className="p-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100 hover:border-teal-300 border border-teal-200 rounded-md transition-all shadow-2xs hover:scale-105 cursor-pointer"
                            >
                              <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canEditStudent && student.kelasSekarang?.startsWith('9') && student.status === 'Aktif' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenGraduationForSelection([student]);
                              }}
                              title="Luluskan Siswa Kelas 9 Ini ke Arsip Alumni"
                              className="p-1.5 text-purple-700 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 border border-purple-200 rounded-md transition-all shadow-2xs hover:scale-105 cursor-pointer"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {canEditStudent && student.status === 'Aktif' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenMutation('keluar', student);
                              }}
                              title="Catat Mutasi Keluar untuk Siswa Ini"
                              className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 border border-amber-200 rounded-md transition-all shadow-2xs hover:scale-105 cursor-pointer"
                            >
                              <ArrowRightLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 1. Lihat Buku Induk */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStudent(student);
                            }}
                            title="Buka Buku Induk Lengkap"
                            className="p-1.5 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-md transition-all shadow-2xs hover:scale-105 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Cetak Lembar Buku Induk */}
                          {canPrintBukuInduk && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPrintMasterSheet(student);
                              }}
                              title="Cetak Lembar Buku Induk Resmi (Lembar I & II)"
                              className="p-1.5 text-indigo-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-md transition-all shadow-2xs hover:scale-105 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 3. Cetak Kartu Pelajar */}
                          {canPrintStudentCard && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onPrintCard(student);
                              }}
                              title="Cetak Kartu Pelajar Digital (KTP-S)"
                              className="p-1.5 text-emerald-700 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 rounded-md transition-all shadow-2xs hover:scale-105 cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 4. Analisis AI */}
                          {canAccessAi && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onAnalyzeAi(student);
                              }}
                              title="Analisis Profil Siswa dengan AI"
                              className="p-1.5 text-purple-700 bg-white hover:bg-purple-50 hover:border-purple-300 border border-slate-200 rounded-md transition-all shadow-2xs hover:scale-105 cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 5. Edit Nilai Rapor */}
                          {onEditScores && canEditScoresFlag && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditScores(student, 1);
                              }}
                              title="Edit / Input Nilai Rapor Siswa"
                              className="p-1.5 text-blue-700 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-md transition-all shadow-2xs hover:scale-105 cursor-pointer"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 6. Edit Biodata Siswa */}
                          {canEditStudent && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditStudent(student);
                              }}
                              title="Edit Biodata Siswa"
                              className="p-1.5 text-amber-700 bg-white hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-md transition-all shadow-2xs hover:scale-105 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* 7. Hapus Siswa */}
                          {canDeleteStudent && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteStudent(student.id);
                              }}
                              title="Hapus Data Siswa"
                              className="p-1.5 text-rose-600 bg-white hover:bg-rose-50 hover:border-rose-300 border border-slate-200 rounded-md transition-all shadow-2xs hover:scale-105 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedStudents.map((student) => {
            const isKip = student.kesejahteraan?.penerimaKip || student.kesejahteraan?.penerimaKmsBantul;

            return (
              <div
                key={student.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-blue-500 hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar Card */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      No Induk: {student.noUrutInduk}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        student.status === 'Aktif'
                          ? 'bg-green-100 text-green-700'
                          : student.status === 'Lulus'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {student.status}
                    </span>
                  </div>

                  {/* Profile Header */}
                  <div className="flex items-center gap-3">
                    <img
                      src={getStudentPhoto(student)}
                      alt={student.namaLengkap}
                      className="w-12 h-12 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getStudentPhoto(student);
                      }}
                    />
                    <div>
                      <h3
                        onClick={() => onSelectStudent(student)}
                        className="font-bold text-slate-800 text-sm hover:text-blue-600 cursor-pointer transition line-clamp-1"
                      >
                        {student.namaLengkap}
                      </h3>
                      <div className="text-xs text-slate-500 font-mono">
                        NISN: <strong className="text-slate-700">{student.nisn}</strong>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[11px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          Kelas {student.kelasSekarang}
                        </span>
                        <span
                          className={`text-[11px] font-semibold ${
                            student.jenisKelamin === 'L' ? 'text-blue-600' : 'text-pink-600'
                          }`}
                        >
                          {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details List */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">TTL:</span>
                      <span className="text-slate-800 font-medium">
                        {student.tempatLahir}, {formatDateIndonesian(student.tanggalLahir)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Domisili:</span>
                      <span className="text-slate-800 font-medium truncate max-w-[180px]">
                        {student.tempatTinggal?.dusun || '-'}, {student.tempatTinggal?.kelurahan || 'Bangunjiwo'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Orang Tua:</span>
                      <span className="text-slate-800 font-medium truncate max-w-[180px]">
                        {student.dataOrangTua?.namaAyah || student.dataOrangTua?.namaIbu || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Jalur PPDB:</span>
                      <span className="text-xs font-semibold text-slate-700">{student.jalurMasuk}</span>
                    </div>
                    {isKip && (
                      <div className="pt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <HeartHandshake className="w-3 h-3" />
                          <span>Penerima Manfaat PIP / KMS Bantul</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectStudent(student);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 border border-blue-200"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Buku Induk</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {canPrintBukuInduk && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrintMasterSheet(student);
                        }}
                        title="Cetak Lembar Buku Induk Resmi"
                        className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canPrintStudentCard && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPrintCard(student);
                        }}
                        title="Cetak Kartu Pelajar Digital"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canAccessAi && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAnalyzeAi(student);
                        }}
                        title="Analisis AI"
                        className="p-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onEditScores && canEditScoresFlag && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditScores(student, 1);
                        }}
                        title="Edit / Input Nilai Rapor Siswa"
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canEditStudent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditStudent(student);
                        }}
                        title="Edit Biodata Siswa"
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDeleteStudent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStudent(student.id);
                        }}
                        title="Hapus Data Siswa"
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer Controls */}
      {filteredAndSortedStudents.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-700">
          <div className="text-slate-500 font-medium text-center sm:text-left">
            Menampilkan <strong className="text-slate-900">{startItemIndex}</strong> - <strong className="text-slate-900">{endItemIndex}</strong> dari <strong className="text-slate-900">{totalItems}</strong> siswa
            {pageSize !== 'all' && (
              <span className="text-slate-400 ml-1">
                (Halaman {activePage} dari {totalPages})
              </span>
            )}
          </div>

          {pageSize !== 'all' && totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={activePage === 1}
                title="Halaman Pertama"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>

              {/* Prev Page */}
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={activePage === 1}
                title="Halaman Sebelumnya"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {pageNumbers.map((p, idx) => {
                  if (p === 'ellipsis') {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                        …
                      </span>
                    );
                  }
                  const isCurrent = p === activePage;
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[28px] h-7 px-2 rounded-lg font-bold text-xs transition ${
                        isCurrent
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={activePage === totalPages}
                title="Halaman Berikutnya"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={activePage === totalPages}
                title="Halaman Terakhir"
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Import Student Excel Modal */}
      {isImportModalOpen && (
        <ImportStudentExcelModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          existingStudents={students}
          onApplyImport={(imported, mode) => {
            if (onImportStudents) {
              onImportStudents(imported, mode);
            }
            setIsImportModalOpen(false);
          }}
        />
      )}

      {/* Modal Kenaikan Kelas (Tingkat 7 & 8) */}
      {isPromotionModalOpen && onPromoteStudents && (
        <ClassPromotionModal
          isOpen={isPromotionModalOpen}
          onClose={() => {
            setIsPromotionModalOpen(false);
            setSelectedStudentsForPromotion([]);
          }}
          students={students}
          preSelectedStudents={selectedStudentsForPromotion}
          currentAcademicYear={schoolProfile?.tahunAjaranAktif || '2024/2025'}
          onConfirmPromotion={async (promotions) => {
            await onPromoteStudents(promotions);
            setIsPromotionModalOpen(false);
            setSelectedStudentsForPromotion([]);
            setSelectedIds([]);
          }}
        />
      )}

      {/* Modal Kelulusan (Tingkat 9 -> Alumni) */}
      {isGraduationModalOpen && onGraduateStudents && (
        <GraduationModal
          isOpen={isGraduationModalOpen}
          onClose={() => {
            setIsGraduationModalOpen(false);
            setSelectedStudentsForGraduation([]);
          }}
          students={students}
          preSelectedStudents={selectedStudentsForGraduation}
          currentAcademicYear={schoolProfile?.tahunAjaranAktif || '2024/2025'}
          onConfirmGraduation={async (graduations) => {
            await onGraduateStudents(graduations);
            setIsGraduationModalOpen(false);
            setSelectedStudentsForGraduation([]);
            setSelectedIds([]);
          }}
        />
      )}

      {/* Modal Mutasi Siswa (Masuk & Keluar) */}
      {isMutationModalOpen && (
        <MutationModal
          isOpen={isMutationModalOpen}
          onClose={() => {
            setIsMutationModalOpen(false);
            setSelectedStudentForMutation(null);
          }}
          students={students}
          initialMode={mutationModalMode}
          selectedStudent={selectedStudentForMutation}
          currentAcademicYear={schoolProfile?.tahunAjaranAktif || '2024/2025'}
          onSaveMutationMasuk={async (newStudent) => {
            if (onSaveMutationMasuk) {
              await onSaveMutationMasuk(newStudent);
            }
            setIsMutationModalOpen(false);
          }}
          onSaveMutationKeluar={async (studentId, mutationData) => {
            if (onSaveMutationKeluar) {
              await onSaveMutationKeluar(studentId, mutationData);
            }
            setIsMutationModalOpen(false);
            setSelectedStudentForMutation(null);
          }}
        />
      )}
    </div>
  );
};
