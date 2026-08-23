import { UserAccount, UserRole, RolePermissions } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewStudents: true,
    canCreateStudent: true,
    canEditStudent: true,
    canDeleteStudent: true,
    canImportExcel: true,
    canExportData: true,
    canPrintBukuInduk: true,
    canPrintStudentCard: true,
    canEditScores: true,
    canEditCounseling: true,
    canAccessAiAssistant: true,
    canEditSchoolProfile: true,
    canResetDatabase: true,
    canManageUsers: true,
    canSyncCloud: true,
  },
  petugas_tu: {
    // Hak akses Petugas TU dan Wali Kelas digabung
    canViewStudents: true,
    canCreateStudent: true,
    canEditStudent: true,
    canDeleteStudent: true,
    canImportExcel: true,
    canExportData: true,
    canPrintBukuInduk: true,
    canPrintStudentCard: true,
    canEditScores: true, // Hak Wali Kelas: input & edit nilai rapor/leger
    canEditCounseling: true, // Hak Wali Kelas/BK: catatan perkembangan siswa
    canAccessAiAssistant: true,
    canEditSchoolProfile: false,
    canResetDatabase: false,
    canManageUsers: false,
    canSyncCloud: true,
  },
  kepala_sekolah: {
    canViewStudents: true,
    canCreateStudent: false,
    canEditStudent: false,
    canDeleteStudent: false,
    canImportExcel: false,
    canExportData: true,
    canPrintBukuInduk: true,
    canPrintStudentCard: false,
    canEditScores: false,
    canEditCounseling: false,
    canAccessAiAssistant: true,
    canEditSchoolProfile: false,
    canResetDatabase: false,
    canManageUsers: false,
    canSyncCloud: true,
  },
};

export interface RoleDescription {
  role: UserRole;
  title: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  iconName: string;
  summary: string;
  responsibilities: string[];
  rules: string[];
}

export const ROLE_DESCRIPTIONS: Record<UserRole, RoleDescription> = {
  admin: {
    role: 'admin',
    title: 'Administrator IT (Super Admin)',
    badgeColor: 'text-purple-700',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-200',
    iconName: 'ShieldCheck',
    summary: 'Akses penuh tanpa batas ke seluruh modul sistem, pengaturan database Cloud Firestore, dan otorisasi pengguna.',
    responsibilities: [
      'Pemeliharaan & konfigurasi server/database Firebase Firestore',
      'Manajemen akun pengguna & kata sandi',
      'Backup & pemulihan darurat database Buku Induk',
      'Pengaturan profil resmi dan identitas sekolah',
    ],
    rules: [
      'Wajib menggunakan autentikasi resmi saat mengakses menu Pengaturan Cloud.',
      'Operasi reset database memerlukan konfirmasi ganda.',
      'Seluruh aktivitas terekam dalam log audit sistem.',
    ],
  },
  petugas_tu: {
    role: 'petugas_tu',
    title: 'Petugas TU & Wali Kelas (Pengelola Data Siswa)',
    badgeColor: 'text-blue-700',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-200',
    iconName: 'FileSpreadsheet',
    summary: 'Pengelola teknis data pokok siswa, penerimaan baru, mutasi, pengisian nilai rapor semester, leger, dan cetak dokumen resmi.',
    responsibilities: [
      'Input data pendaftaran siswa baru & nomor induk resmi',
      'Pembaruan berkas biodata, dokumen keluarga, dan ijazah SD',
      'Impor data massal melalui spreadsheet Excel (SheetJS)',
      'Input & edit capaian nilai rapor semester per mata pelajaran (Wali Kelas)',
      'Pencatatan rekap presensi dan catatan sikap siswa binaan',
      'Pencetakan Lembar Buku Induk Bagian 1 & Bagian 2 serta Kartu Pelajar',
    ],
    rules: [
      'Tidak diperkenankan mengubah konfigurasi identitas hukum sekolah.',
      'Dilarang melakukan reset database massal.',
      'Setiap perubahan data siswa harus divalidasi dengan dokumen fisik.',
    ],
  },
  kepala_sekolah: {
    role: 'kepala_sekolah',
    title: 'Kepala Sekolah (Otorisator & Supervisor)',
    badgeColor: 'text-amber-700',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    iconName: 'GraduationCap',
    summary: 'Monitoring berkala, verifikasi kemajuan siswa, legalisasi lembar buku induk, dan telaah statistik sekolah.',
    responsibilities: [
      'Supervisi kelengkapan data Buku Induk Siswa',
      'Verifikasi kelulusan dan mutasi siswa',
      'Penandatanganan / legalisasi Lembar Induk resmi',
      'Pemanfaatan AI Asisten untuk analisis capaian sekolah',
    ],
    rules: [
      'Akses baca (Read-Only) pada formulir pengeditan siswa demi integritas data.',
      'Dapat mencetak dan mengunduh seluruh rekap nilai (Leger) dan lembar induk.',
    ],
  },
};

export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr-admin-01',
    username: 'admin',
    password: 'admin123',
    name: 'Rofiqul Anwar, S.Pd., M.Eng.',
    email: 'admin@smpn2kasihan.sch.id',
    role: 'admin',
    roleLabel: 'Administrator IT',
    nip: '19880412 201201 1 003',
    jabatan: 'Admin Sistem & Koordinator IT E-Binduk',
    phoneNumber: '0812-2849-0192',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    permissions: ROLE_PERMISSIONS.admin,
  },
  {
    id: 'usr-tu-01',
    username: 'petugas.tu',
    password: 'tu123',
    name: 'Siti Aminah, S.Kom.',
    email: 'tu@smpn2kasihan.sch.id',
    role: 'petugas_tu',
    roleLabel: 'Petugas TU & Wali Kelas',
    nip: '19850312 201001 2 015',
    jabatan: 'Pengelola Buku Induk & Data Akademik Siswa',
    phoneNumber: '0813-2890-4421',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    permissions: ROLE_PERMISSIONS.petugas_tu,
  },
  {
    id: 'usr-ks-01',
    username: 'kepala.sekolah',
    password: 'kepsek123',
    name: 'Drs. H. Suryanto, M.Pd.',
    email: 'kepala@smpn2kasihan.sch.id',
    role: 'kepala_sekolah',
    roleLabel: 'Kepala Sekolah',
    nip: '19680514 199412 1 002',
    jabatan: 'Kepala SMP Negeri 2 Kasihan',
    phoneNumber: '0812-3456-7890',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    permissions: ROLE_PERMISSIONS.kepala_sekolah,
  },
];
