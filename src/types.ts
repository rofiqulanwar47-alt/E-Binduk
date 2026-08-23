export type Gender = 'L' | 'P';
export type Religion = 'Islam' | 'Kristen' | 'Katolik' | 'Hindu' | 'Buddha' | 'Konghucu';
export type BloodType = 'A' | 'B' | 'AB' | 'O' | '-';
export type StudentStatus = 'Aktif' | 'Lulus' | 'Mutasi Keluar' | 'Mutasi Masuk' | 'Keluar / DO';
export type AdmissionTrack = 'Zonasi' | 'Afirmasi' | 'Prestasi' | 'Perpindahan Tugas Orang Tua';

export type UserRole =
  | 'admin'
  | 'petugas_tu'
  | 'kepala_sekolah';

export interface RolePermissions {
  canViewStudents: boolean;
  canCreateStudent: boolean;
  canEditStudent: boolean;
  canDeleteStudent: boolean;
  canImportExcel: boolean;
  canExportData: boolean;
  canPrintBukuInduk: boolean;
  canPrintStudentCard: boolean;
  canEditScores: boolean;
  canEditCounseling: boolean;
  canAccessAiAssistant: boolean;
  canEditSchoolProfile: boolean;
  canResetDatabase: boolean;
  canManageUsers: boolean;
  canSyncCloud: boolean;
  restrictedToClass?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  nip?: string;
  jabatan: string;
  assignedClass?: string;
  avatarUrl?: string;
  phoneNumber?: string;
  permissions: RolePermissions;
}

export interface SubjectScore {
  pai: number; // Pendidikan Agama & Budi Pekerti
  pancasila: number; // PPKn / Pendidikan Pancasila
  bahasaIndonesia: number; // Bahasa Indonesia
  matematika: number; // Matematika
  ipa: number; // Ilmu Pengetahuan Alam
  ips: number; // Ilmu Pengetahuan Sosial
  bahasaInggris: number; // Bahasa Inggris
  seniBudaya: number; // Seni Musik / Rupa / Tari
  pjok: number; // Pendidikan Jasmani, Olahraga & Kesehatan
  informatika: number; // Informatika
  bahasaJawa: number; // Muatan Lokal Bahasa Jawa
  rataRata?: number;
  peringkat?: number;
  catatan?: string;
}

export interface SemesterReport {
  semester: 1 | 2 | 3 | 4 | 5 | 6;
  kelas: string; // e.g. "7A", "8A", "9A"
  tahunAjaran: string; // e.g. "2023/2024"
  scores: SubjectScore;
  kehadiran: {
    sakit: number;
    izin: number;
    tanpaKeterangan: number;
  };
  sikapSpiritual: 'Sangat Baik' | 'Baik' | 'Cukup';
  sikapSosial: 'Sangat Baik' | 'Baik' | 'Cukup';
}

export interface StudentAchievement {
  id: string;
  tahun: string;
  namaPrestasi: string;
  bidang: 'Akademik' | 'Seni Budaya' | 'Olahraga' | 'Keagamaan' | 'Teknologi' | 'Lainnya';
  tingkat: 'Sekolah' | 'Kecamatan' | 'Kabupaten (Bantul)' | 'Provinsi (DIY)' | 'Nasional' | 'Internasional';
  juara: 'Juara 1' | 'Juara 2' | 'Juara 3' | 'Harapan 1' | 'Finalis' | 'Peserta';
  penyelenggara: string;
}

export interface Extracurricular {
  id: string;
  nama: string; // e.g., "Pramuka", "Karawitan", "PMR", "Tonti / Paskibra", "Futsal", "Robotik", "Tari Tradisional"
  predikat: 'Sangat Baik' | 'Baik' | 'Cukup';
  keterangan: string;
}

export interface CounselingRecord {
  id: string;
  tanggal: string;
  perihal: string;
  catatan: string;
  tindakLanjut: string;
  petugas: string; // e.g., "Guru BK", "Wali Kelas"
}

export interface ParentData {
  namaAyah: string;
  nikAyah: string;
  tempatLahirAyah: string;
  tanggalLahirAyah: string;
  agamaAyah: Religion;
  pendidikanAyah: string;
  pekerjaanAyah: string;
  penghasilanAyah: string;
  noHpAyah: string;
  statusAyah: 'Masih Hidup' | 'Meninggal' | 'Cerai';

  namaIbu: string;
  nikIbu: string;
  tempatLahirIbu: string;
  tanggalLahirIbu: string;
  agamaIbu: Religion;
  pendidikanIbu: string;
  pekerjaanIbu: string;
  penghasilanIbu: string;
  noHpIbu: string;
  statusIbu: 'Masih Hidup' | 'Meninggal' | 'Cerai';

  namaWali?: string;
  nikWali?: string;
  hubunganWali?: string;
  pendidikanWali?: string;
  pekerjaanWali?: string;
  penghasilanWali?: string;
  noHpWali?: string;
}

export interface AddressData {
  alamatLengkap: string;
  rt: string;
  rw: string;
  dusun: string; // e.g. "Bibis", "Kalipucang", "Kasihan", "Gendeng", "Banyon"
  kelurahan: string; // e.g. "Bangunjiwo", "Tamantirto", "Tirtonirmolo", "Ngestiharjo"
  kecamatan: string; // e.g. "Kasihan", "Sewon", "Pajangan", "Bantul"
  kabupatenKota: string; // e.g. "Bantul", "Kota Yogyakarta", "Sleman"
  provinsi: string; // "D.I. Yogyakarta"
  kodePos: string;
  tinggalBersama: 'Orang Tua' | 'Wali' | 'Kost' | 'Asrama' | 'Panti Asuhan' | 'Lainnya';
  transportasi: 'Jalan Kaki' | 'Sepeda' | 'Sepeda Motor' | 'Angkutan Umum' | 'Antar Jemput' | 'Ojek Online';
  jarakKeSekolahKm: number;
  waktuTempuhMenit: number;
}

export interface HealthData {
  golonganDarah: BloodType;
  tinggiBadanCm: number;
  beratBadanKg: number;
  lingkarKepalaCm?: number;
  riwayatPenyakit: string;
  kelainanJasmani: string;
}

export interface PreviousEducationData {
  asalSdMi: string;
  npsnSdMi?: string;
  kabupatenSdMi: string;
  noPesertaUjianSd: string;
  noIjazahSd: string;
  tanggalIjazahSd: string;
  noSkhun?: string;
  nilaiKelulusanSd?: number;
  lamaBelajarTahun: number;
}

export interface WelfareData {
  penerimaKip: boolean;
  noKip?: string;
  penerimaPkh: boolean;
  penerimaKmsBantul: boolean; // Kartu Menuju Sejahtera (KMS) Kab. Bantul
  noKks?: string; // Kartu Keluarga Sejahtera
  layakPip: boolean;
  alasanLayakPip?: string;
}

export interface Student {
  id: string; // Unique UUID
  // Identitas Pokok Buku Induk
  noUrutInduk: string; // e.g. "2024/001"
  nis: string; // Nomor Induk Siswa Sekolah (e.g. "12450")
  nisn: string; // 10 digit NISN Nasional (e.g. "0098765432")
  nik: string; // 16 digit NIK KTP/KK
  noKk: string; // 16 digit Nomor Kartu Keluarga
  namaLengkap: string;
  namaPanggilan: string;
  jenisKelamin: Gender;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  agama: Religion;
  kewarganegaraan: 'WNI' | 'WNA';
  anakKe: number;
  jumlahSaudaraKandung: number;
  jumlahSaudaraTiri: number;
  jumlahSaudaraAngkat: number;
  statusDalamKeluarga: 'Anak Kandung' | 'Anak Tiri' | 'Anak Angkat' | 'Anak Asuh';
  bahasaSehariHari: string;
  fotoUrl: string;

  // Modul Data Lengkap
  tempatTinggal: AddressData;
  jasmani: HealthData;
  pendidikanSebelumnya: PreviousEducationData;
  dataOrangTua: ParentData;
  kesejahteraan: WelfareData;

  // Riwayat Penerimaan di SMP N 2 Kasihan
  tahunMasuk: string; // e.g. "2024"
  tanggalDiterima: string; // YYYY-MM-DD
  diterimaDiKelas: string; // e.g. "7A"
  jalurMasuk: AdmissionTrack;
  catatanPenerimaan?: string;

  // Status & Penempatan Sekarang
  status: StudentStatus;
  kelasSekarang: string; // e.g. "7A", "8C", "9B", "Alumni"
  tahunAjaran: string; // e.g. "2024/2025"

  // Riwayat Akademik & Perkembangan
  semesterReports: SemesterReport[];
  ekstrakurikuler: Extracurricular[];
  prestasi: StudentAchievement[];
  catatanPerkembangan: CounselingRecord[];

  // Data Kelulusan / Mutasi
  tanggalLulus?: string;
  noIjazahSmp?: string;
  noSkhunSmp?: string;
  melanjutkanKe?: string; // e.g. "SMA Negeri 1 Kasihan", "SMK Negeri 1 Bantul"
  tanggalMutasi?: string;
  pindahKeSekolah?: string;
  alasanMutasi?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface SchoolProfile {
  namaSekolah: string;
  npsn: string;
  nss: string;
  akreditasi: string;
  alamat: string;
  dusun: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  telepon: string;
  email: string;
  website: string;
  kepalaSekolah: string;
  nipKepalaSekolah: string;
  pengelolaBukuInduk: string;
  nipPengelolaBukuInduk: string;
  tahunAjaranAktif: string;
  semesterAktif: 1 | 2;
  motto: string;
  noTelepon?: string;
  logoBantulUrl?: string;
  logoTutwuriUrl?: string;
  logoUrl?: string;
}

export interface StudentAnalysisResult {
  ringkasanProfil: string;
  potensiBakat: string[];
  rekomendasiBk: string[];
  rencanaPengembangan: string[];
  kelayakanBantuan: string;
  catatanKhusus?: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'buku-induk'
  | 'cetak-lembar'
  | 'kartu-pelajar'
  | 'leger'
  | 'ai-asisten'
  | 'pengaturan';
