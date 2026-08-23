import * as XLSX from 'xlsx';
import { Student, Gender, Religion, BloodType, StudentStatus, AdmissionTrack } from '../types';

/**
 * Helper to convert Excel date serial numbers or date strings to YYYY-MM-DD
 */
export function formatExcelDate(rawDate: any): string {
  if (!rawDate) return '2011-01-01';

  // If it's already in YYYY-MM-DD format
  if (typeof rawDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawDate.trim())) {
    return rawDate.trim();
  }

  // If it's DD/MM/YYYY or DD-MM-YYYY
  if (typeof rawDate === 'string') {
    const parts = rawDate.trim().split(/[/.-]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    }
  }

  // If it's a SheetJS / Excel numeric serial number
  if (typeof rawDate === 'number') {
    try {
      const parsed = XLSX.SSF.parse_date_code(rawDate);
      if (parsed) {
        const y = parsed.y;
        const m = String(parsed.m).padStart(2, '0');
        const d = String(parsed.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } catch {
      // Fallback
    }
  }

  // Try standard JS Date parsing
  try {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {
    // Ignore
  }

  return '2011-01-01';
}

/**
 * Generate official Excel template (.xlsx) for SMP Negeri 2 Kasihan
 */
export function generateStudentExcelTemplate(): void {
  const headers = [
    'No Urut Induk',
    'NIS',
    'NISN',
    'NIK',
    'No Kartu Keluarga',
    'Nama Lengkap',
    'Nama Panggilan',
    'Jenis Kelamin (L/P)',
    'Tempat Lahir',
    'Tanggal Lahir (YYYY-MM-DD)',
    'Agama',
    'Kelas Sekarang (7A/7B/8A/8B/9A/9B)',
    'Status Siswa (Aktif/Lulus/Mutasi Keluar)',
    'Alamat Lengkap',
    'RT',
    'RW',
    'Dusun',
    'Kelurahan/Desa',
    'Kecamatan',
    'Kabupaten/Kota',
    'Provinsi',
    'Kode Pos',
    'Tinggal Bersama',
    'Transportasi',
    'Jarak ke Sekolah (km)',
    'Golongan Darah (A/B/AB/O/-)',
    'Tinggi Badan (cm)',
    'Berat Badan (kg)',
    'Riwayat Penyakit',
    'Kelainan Jasmani',
    'Sekolah Asal (SD/MI)',
    'NPSN SD',
    'Kabupaten SD',
    'No Ijazah SD',
    'Nilai Kelulusan SD',
    'Nama Ayah',
    'NIK Ayah',
    'Pekerjaan Ayah',
    'Penghasilan Ayah',
    'No HP Ayah',
    'Nama Ibu',
    'NIK Ibu',
    'Pekerjaan Ibu',
    'Penghasilan Ibu',
    'No HP Ibu',
    'Nama Wali',
    'Pekerjaan Wali',
    'Hubungan Wali',
    'Tahun Masuk',
    'Tanggal Diterima',
    'Diterima di Kelas',
    'Jalur Masuk (Zonasi/Afirmasi/Prestasi/Perpindahan Tugas Orang Tua)',
    'Penerima KIP (Ya/Tidak)',
    'No KIP',
    'Penerima PKH (Ya/Tidak)',
    'Penerima KMS Bantul (Ya/Tidak)',
    'Layak PIP (Ya/Tidak)',
  ];

  const sampleRows = [
    [
      '2024/001',
      '12401',
      '0104589231',
      '3402031508100001',
      '3402030101150009',
      'Aditya Bagus Nugroho',
      'Adit',
      'L',
      'Bantul',
      '2011-05-15',
      'Islam',
      '7A',
      'Aktif',
      'RT 03 RW 02 Dusun Bibis Kulon, Bangunjiwo',
      '03',
      '02',
      'Bibis',
      'Bangunjiwo',
      'Kasihan',
      'Bantul',
      'D.I. Yogyakarta',
      '55184',
      'Orang Tua',
      'Sepeda',
      1.2,
      'O',
      154,
      46,
      'Tidak ada',
      'Tidak ada',
      'SD Negeri Bibis Kasihan',
      '20400123',
      'Bantul',
      'DN-04/D-SD/13/0014251',
      88.5,
      'Bambang Triyono',
      '3402031005780003',
      'Wiraswasta / Pengrajin Gerabah',
      'Rp 2.500.000 - Rp 4.000.000',
      '081328901234',
      'Sri Wahyuni',
      '3402035209820002',
      'Tenaga Medis Puskesmas',
      'Rp 3.000.000 - Rp 4.500.000',
      '085743129876',
      '',
      '',
      '',
      '2024',
      '2024-07-15',
      '7A',
      'Zonasi',
      'Tidak',
      '',
      'Tidak',
      'Tidak',
      'Tidak',
    ],
    [
      '2024/002',
      '12402',
      '0113829471',
      '3402035607110002',
      '3402031204140005',
      'Anindya Putri Rahmadani',
      'Anin',
      'P',
      'Yogyakarta',
      '2011-07-16',
      'Islam',
      '7A',
      'Aktif',
      'Dusun Kalipucang RT 04, Bangunjiwo',
      '04',
      '01',
      'Kalipucang',
      'Bangunjiwo',
      'Kasihan',
      'Bantul',
      'D.I. Yogyakarta',
      '55184',
      'Orang Tua',
      'Antar Jemput',
      2.5,
      'A',
      150,
      42,
      'Tidak ada',
      'Tidak ada',
      'SD Negeri 1 Kasihan',
      '20400125',
      'Bantul',
      'DN-04/D-SD/13/0014252',
      92.0,
      'Rahmad Hidayat, S.E.',
      '3402031209760001',
      'Karyawan Swasta',
      'Rp 4.000.000 - Rp 6.000.000',
      '081227182930',
      'Dewi Lestari, S.Pd.',
      '3402034503800004',
      'Guru SMP',
      'Rp 3.500.000 - Rp 5.000.000',
      '081392019283',
      '',
      '',
      '',
      '2024',
      '2024-07-15',
      '7A',
      'Prestasi',
      'Tidak',
      '',
      'Tidak',
      'Tidak',
      'Tidak',
    ],
    [
      '2024/003',
      '12403',
      '0109283746',
      '3402032103110003',
      '3402030502120008',
      'Bima Arya Pratama',
      'Bima',
      'L',
      'Bantul',
      '2011-03-21',
      'Islam',
      '7B',
      'Aktif',
      'Dusun Gendeng RT 02, Bangunjiwo',
      '02',
      '01',
      'Gendeng',
      'Bangunjiwo',
      'Kasihan',
      'Bantul',
      'D.I. Yogyakarta',
      '55184',
      'Orang Tua',
      'Jalan Kaki',
      0.8,
      'B',
      158,
      50,
      'Asma Ringan',
      'Tidak ada',
      'SD Negeri 2 Kasihan',
      '20400126',
      'Bantul',
      'DN-04/D-SD/13/0014253',
      86.0,
      'Agus Santoso',
      '3402031102750002',
      'Petani / Buruh Harian',
      '< Rp 1.500.000',
      '087839201928',
      'Supriyanti',
      '3402036108790001',
      'Pedagang Pasar',
      '< Rp 1.500.000',
      '085643920192',
      '',
      '',
      '',
      '2024',
      '2024-07-15',
      '7B',
      'Afirmasi',
      'Ya',
      'KIP-3402-2024-0891',
      'Ya',
      'Ya',
      'Ya',
    ],
  ];

  const worksheetData = [headers, ...sampleRows];
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for readability
  const colWidths = headers.map((h) => ({ wch: Math.max(h.length + 3, 14) }));
  colWidths[5] = { wch: 28 }; // Nama Lengkap
  colWidths[13] = { wch: 35 }; // Alamat Lengkap
  colWidths[30] = { wch: 26 }; // Sekolah Asal
  colWidths[35] = { wch: 24 }; // Nama Ayah
  colWidths[40] = { wch: 24 }; // Nama Ibu
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data_Buku_Induk_Siswa');

  // Write and download
  XLSX.writeFile(wb, 'Template_Buku_Induk_SMPN2Kasihan.xlsx');
}

/**
 * Result structure for Excel Parsing
 */
export interface ExcelParseResult {
  success: boolean;
  students: Student[];
  errors: string[];
  warnings: string[];
  totalRowsRead: number;
}

/**
 * Parse an uploaded Excel file (.xlsx / .xls) into Student objects using SheetJS
 */
export async function parseExcelStudentFile(
  file: File,
  existingCount: number = 0
): Promise<ExcelParseResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const students: Student[] = [];

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: false });

    // Pick first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return {
        success: false,
        students: [],
        errors: ['File Excel tidak memiliki lembar kerja (worksheet).'],
        warnings: [],
        totalRowsRead: 0,
      };
    }

    const worksheet = workbook.Sheets[sheetName];
    // Convert to array of raw objects
    const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    if (!rawRows || rawRows.length === 0) {
      return {
        success: false,
        students: [],
        errors: ['Lembar kerja Excel kosong. Harap masukkan data siswa.'],
        warnings: [],
        totalRowsRead: 0,
      };
    }

    // Helper to find field value across multiple possible column name aliases
    const getVal = (row: any, ...aliases: string[]): any => {
      for (const alias of aliases) {
        if (row[alias] !== undefined && row[alias] !== '') {
          return row[alias];
        }
        // Case-insensitive lookup
        const lowerAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const key of Object.keys(row)) {
          const cleanKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (cleanKey === lowerAlias && row[key] !== undefined && row[key] !== '') {
            return row[key];
          }
        }
      }
      return '';
    };

    rawRows.forEach((row, index) => {
      const rowNum = index + 2; // considering 1-based index and header row

      const namaLengkap = String(getVal(row, 'Nama Lengkap', 'Nama Siswa', 'Nama', 'namaLengkap')).trim();
      if (!namaLengkap) {
        warnings.push(`Baris ${rowNum}: Nama Siswa kosong, baris dilewati.`);
        return;
      }

      const rawNis = String(getVal(row, 'NIS', 'Nomor Induk', 'nis')).trim();
      const rawNisn = String(getVal(row, 'NISN', 'Nomor Induk Siswa Nasional', 'nisn')).trim();
      const rawNoUrut = String(getVal(row, 'No Urut Induk', 'No Induk', 'No. Urut', 'noUrutInduk')).trim();

      const nis = rawNis || `${12400 + existingCount + index + 1}`;
      const nisn = rawNisn || `010${String(Math.floor(1000000 + Math.random() * 9000000))}`;
      const noUrutInduk = rawNoUrut || `2024/${String(existingCount + index + 1).padStart(3, '0')}`;

      // Gender normalization
      const rawJk = String(getVal(row, 'Jenis Kelamin (L/P)', 'Jenis Kelamin', 'JK', 'Gender', 'jenisKelamin')).trim();
      let jenisKelamin: Gender = 'L';
      if (
        rawJk.toUpperCase().startsWith('P') ||
        rawJk.toLowerCase() === 'perempuan' ||
        rawJk.toLowerCase() === 'wanita' ||
        rawJk.toLowerCase() === 'f'
      ) {
        jenisKelamin = 'P';
      }

      // Religion normalization
      const rawAgama = String(getVal(row, 'Agama', 'agama')).trim();
      let agama: Religion = 'Islam';
      if (rawAgama) {
        const agLower = rawAgama.toLowerCase();
        if (agLower.includes('kristen') || agLower.includes('protestan')) agama = 'Kristen';
        else if (agLower.includes('katolik')) agama = 'Katolik';
        else if (agLower.includes('hindu')) agama = 'Hindu';
        else if (agLower.includes('buddha') || agLower.includes('budha')) agama = 'Buddha';
        else if (agLower.includes('konghucu')) agama = 'Konghucu';
        else agama = 'Islam';
      }

      // Class normalization
      const rawKelas = String(getVal(row, 'Kelas Sekarang (7A/7B/8A/8B/9A/9B)', 'Kelas Sekarang', 'Kelas', 'kelasSekarang')).trim();
      const kelasSekarang = rawKelas || '7A';

      // Status normalization
      const rawStatus = String(getVal(row, 'Status Siswa (Aktif/Lulus/Mutasi Keluar)', 'Status Siswa', 'Status', 'status')).trim();
      let status: StudentStatus = 'Aktif';
      if (rawStatus) {
        const stLower = rawStatus.toLowerCase();
        if (stLower.includes('lulus')) status = 'Lulus';
        else if (stLower.includes('mutasi')) status = 'Mutasi Keluar';
        else if (stLower.includes('keluar') || stLower.includes('do')) status = 'Keluar / DO';
        else status = 'Aktif';
      }

      // Blood type
      const rawGolDarah = String(getVal(row, 'Golongan Darah (A/B/AB/O/-)', 'Golongan Darah', 'Gol Darah', 'golonganDarah')).trim().toUpperCase();
      let golonganDarah: BloodType = '-';
      if (['A', 'B', 'AB', 'O'].includes(rawGolDarah)) {
        golonganDarah = rawGolDarah as BloodType;
      }

      // Admission Track
      const rawJalur = String(getVal(row, 'Jalur Masuk (Zonasi/Afirmasi/Prestasi/Perpindahan Tugas Orang Tua)', 'Jalur Masuk', 'jalurMasuk')).trim();
      let jalurMasuk: AdmissionTrack = 'Zonasi';
      if (rawJalur.toLowerCase().includes('afirmasi')) jalurMasuk = 'Afirmasi';
      else if (rawJalur.toLowerCase().includes('prestasi')) jalurMasuk = 'Prestasi';
      else if (rawJalur.toLowerCase().includes('pindah') || rawJalur.toLowerCase().includes('tugas')) jalurMasuk = 'Perpindahan Tugas Orang Tua';

      // Dates
      const tanggalLahir = formatExcelDate(getVal(row, 'Tanggal Lahir (YYYY-MM-DD)', 'Tanggal Lahir', 'tanggalLahir'));
      const tanggalDiterima = formatExcelDate(getVal(row, 'Tanggal Diterima', 'Tanggal Masuk', 'tanggalDiterima')) || '2024-07-15';

      // Welfare Booleans
      const isTrue = (val: any) => {
        if (typeof val === 'boolean') return val;
        const s = String(val).trim().toLowerCase();
        return s === 'ya' || s === 'true' || s === '1' || s === 'y' || s === 'yes';
      };

      const penerimaKip = isTrue(getVal(row, 'Penerima KIP (Ya/Tidak)', 'Penerima KIP', 'KIP', 'penerimaKip'));
      const penerimaPkh = isTrue(getVal(row, 'Penerima PKH (Ya/Tidak)', 'Penerima PKH', 'PKH', 'penerimaPkh'));
      const penerimaKmsBantul = isTrue(getVal(row, 'Penerima KMS Bantul (Ya/Tidak)', 'Penerima KMS', 'KMS Bantul', 'penerimaKmsBantul'));
      const layakPip = isTrue(getVal(row, 'Layak PIP (Ya/Tidak)', 'Layak PIP', 'PIP', 'layakPip'));

      const student: Student = {
        id: `std-imp-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
        noUrutInduk,
        nis,
        nisn,
        nik: String(getVal(row, 'NIK', 'nik') || `340203${tanggalLahir.replace(/-/g, '').substring(2)}0001`),
        noKk: String(getVal(row, 'No Kartu Keluarga', 'No KK', 'noKk') || '3402030101150001'),
        namaLengkap,
        namaPanggilan: String(getVal(row, 'Nama Panggilan', 'namaPanggilan') || namaLengkap.split(' ')[0]),
        jenisKelamin,
        tempatLahir: String(getVal(row, 'Tempat Lahir', 'tempatLahir') || 'Bantul'),
        tanggalLahir,
        agama,
        kewarganegaraan: 'WNI',
        anakKe: Number(getVal(row, 'Anak Ke', 'anakKe')) || 1,
        jumlahSaudaraKandung: Number(getVal(row, 'Jumlah Saudara Kandung', 'jumlahSaudaraKandung')) || 1,
        jumlahSaudaraTiri: 0,
        jumlahSaudaraAngkat: 0,
        statusDalamKeluarga: 'Anak Kandung',
        bahasaSehariHari: 'Bahasa Jawa, Bahasa Indonesia',
        fotoUrl: String(getVal(row, 'Foto URL', 'fotoUrl') || (
          jenisKelamin === 'L'
            ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300'
            : 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300'
        )),

        tempatTinggal: {
          alamatLengkap: String(getVal(row, 'Alamat Lengkap', 'Alamat', 'alamatLengkap') || 'Kasihan, Bantul'),
          rt: String(getVal(row, 'RT', 'rt') || '01'),
          rw: String(getVal(row, 'RW', 'rw') || '01'),
          dusun: String(getVal(row, 'Dusun', 'dusun') || 'Bibis'),
          kelurahan: String(getVal(row, 'Kelurahan/Desa', 'Kelurahan', 'Desa', 'kelurahan') || 'Bangunjiwo'),
          kecamatan: String(getVal(row, 'Kecamatan', 'kecamatan') || 'Kasihan'),
          kabupatenKota: String(getVal(row, 'Kabupaten/Kota', 'Kabupaten', 'kabupatenKota') || 'Bantul'),
          provinsi: String(getVal(row, 'Provinsi', 'provinsi') || 'D.I. Yogyakarta'),
          kodePos: String(getVal(row, 'Kode Pos', 'kodePos') || '55184'),
          tinggalBersama: (getVal(row, 'Tinggal Bersama', 'tinggalBersama') as any) || 'Orang Tua',
          transportasi: (getVal(row, 'Transportasi', 'transportasi') as any) || 'Sepeda',
          jarakKeSekolahKm: Number(getVal(row, 'Jarak ke Sekolah (km)', 'Jarak (km)', 'jarakKeSekolahKm')) || 1.5,
          waktuTempuhMenit: 10,
        },

        jasmani: {
          golonganDarah,
          tinggiBadanCm: Number(getVal(row, 'Tinggi Badan (cm)', 'Tinggi Badan', 'tinggiBadanCm')) || 152,
          beratBadanKg: Number(getVal(row, 'Berat Badan (kg)', 'Berat Badan', 'beratBadanKg')) || 45,
          lingkarKepalaCm: 53,
          riwayatPenyakit: String(getVal(row, 'Riwayat Penyakit', 'riwayatPenyakit') || 'Tidak ada'),
          kelainanJasmani: String(getVal(row, 'Kelainan Jasmani', 'kelainanJasmani') || 'Tidak ada'),
        },

        pendidikanSebelumnya: {
          asalSdMi: String(getVal(row, 'Sekolah Asal (SD/MI)', 'Sekolah Asal', 'asalSdMi') || 'SD Negeri 1 Kasihan'),
          npsnSdMi: String(getVal(row, 'NPSN SD', 'npsnSdMi') || '20400125'),
          kabupatenSdMi: String(getVal(row, 'Kabupaten SD', 'kabupatenSdMi') || 'Bantul'),
          noPesertaUjianSd: '04-001-020-5',
          noIjazahSd: String(getVal(row, 'No Ijazah SD', 'No Ijazah', 'noIjazahSd') || 'DN-04/D-SD/13/0014250'),
          tanggalIjazahSd: '2024-06-15',
          nilaiKelulusanSd: Number(getVal(row, 'Nilai Kelulusan SD', 'Nilai SD', 'nilaiKelulusanSd')) || 88.0,
          lamaBelajarTahun: 6,
        },

        dataOrangTua: {
          namaAyah: String(getVal(row, 'Nama Ayah', 'namaAyah') || ''),
          nikAyah: String(getVal(row, 'NIK Ayah', 'nikAyah') || '3402031005780003'),
          tempatLahirAyah: 'Bantul',
          tanggalLahirAyah: '1978-05-10',
          agamaAyah: 'Islam',
          pendidikanAyah: 'SMA / Sederajat',
          pekerjaanAyah: String(getVal(row, 'Pekerjaan Ayah', 'pekerjaanAyah') || 'Wiraswasta'),
          penghasilanAyah: String(getVal(row, 'Penghasilan Ayah', 'penghasilanAyah') || 'Rp 2.500.000 - Rp 4.000.000'),
          noHpAyah: String(getVal(row, 'No HP Ayah', 'noHpAyah') || ''),
          statusAyah: 'Masih Hidup',

          namaIbu: String(getVal(row, 'Nama Ibu', 'namaIbu') || ''),
          nikIbu: String(getVal(row, 'NIK Ibu', 'nikIbu') || '3402035209820002'),
          tempatLahirIbu: 'Bantul',
          tanggalLahirIbu: '1982-09-12',
          agamaIbu: 'Islam',
          pendidikanIbu: 'SMA / Sederajat',
          pekerjaanIbu: String(getVal(row, 'Pekerjaan Ibu', 'pekerjaanIbu') || 'Ibu Rumah Tangga'),
          penghasilanIbu: String(getVal(row, 'Penghasilan Ibu', 'penghasilanIbu') || 'Rp 2.500.000 - Rp 4.000.000'),
          noHpIbu: String(getVal(row, 'No HP Ibu', 'noHpIbu') || ''),
          statusIbu: 'Masih Hidup',

          namaWali: String(getVal(row, 'Nama Wali', 'namaWali') || ''),
          pekerjaanWali: String(getVal(row, 'Pekerjaan Wali', 'pekerjaanWali') || ''),
          hubunganWali: String(getVal(row, 'Hubungan Wali', 'hubunganWali') || ''),
        },

        kesejahteraan: {
          penerimaKip,
          noKip: String(getVal(row, 'No KIP', 'noKip') || ''),
          penerimaPkh,
          penerimaKmsBantul,
          layakPip,
        },

        tahunMasuk: String(getVal(row, 'Tahun Masuk', 'tahunMasuk') || '2024'),
        tanggalDiterima,
        diterimaDiKelas: String(getVal(row, 'Diterima di Kelas', 'diterimaDiKelas') || kelasSekarang),
        jalurMasuk,

        status,
        kelasSekarang,
        tahunAjaran: '2024/2025',

        semesterReports: [
          {
            semester: 1,
            kelas: kelasSekarang,
            tahunAjaran: '2024/2025',
            scores: {
              pai: 85,
              pancasila: 84,
              bahasaIndonesia: 86,
              matematika: 82,
              ipa: 83,
              ips: 85,
              bahasaInggris: 84,
              seniBudaya: 88,
              pjok: 87,
              informatika: 85,
              bahasaJawa: 86,
              rataRata: 85.0,
              peringkat: 10,
              catatan: 'Menunjukkan perkembangan akademik yang sangat baik.',
            },
            kehadiran: { sakit: 1, izin: 1, tanpaKeterangan: 0 },
            sikapSpiritual: 'Sangat Baik',
            sikapSosial: 'Sangat Baik',
          },
        ],
        ekstrakurikuler: [
          {
            id: `eks-${Date.now()}-1`,
            nama: 'Pramuka Penggalang',
            predikat: 'Sangat Baik',
            keterangan: 'Aktif dalam kegiatan latihan kepramukaan gugus depan.',
          },
        ],
        prestasi: [],
        catatanPerkembangan: [],

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      students.push(student);
    });

    return {
      success: students.length > 0,
      students,
      errors,
      warnings,
      totalRowsRead: rawRows.length,
    };
  } catch (err: any) {
    return {
      success: false,
      students: [],
      errors: [`Gagal memproses file Excel: ${err?.message || 'Format data tidak valid.'}`],
      warnings: [],
      totalRowsRead: 0,
    };
  }
}

/**
 * Generate official Excel template for Import Nilai Rapor (Kurikulum Merdeka)
 */
export function generateScoreReportExcelTemplate(
  students: Student[],
  selectedClass: string,
  semester: number
): void {
  const classStudents = selectedClass && selectedClass !== 'Semua'
    ? students.filter((s) => s.kelasSekarang === selectedClass && s.status === 'Aktif')
    : students.filter((s) => s.status === 'Aktif');

  const headers = [
    'No',
    'No Induk',
    'NISN',
    'Nama Siswa',
    'Kelas',
    'L/P',
    'PAI',
    'PPKn/Pancasila',
    'Bahasa Indonesia',
    'Matematika',
    'IPA',
    'IPS',
    'Bahasa Inggris',
    'Seni Budaya',
    'PJOK',
    'Informatika',
    'Bahasa Jawa',
    'Sakit',
    'Izin',
    'Alpa',
    'Catatan Akademik',
  ];

  const rows = classStudents.map((s, idx) => {
    const report = s.semesterReports?.find((r) => r.semester === semester);
    const scores = report?.scores;
    const kehadiran = report?.kehadiran;

    return [
      idx + 1,
      s.noUrutInduk || '',
      s.nisn || '',
      s.namaLengkap || '',
      s.kelasSekarang || selectedClass,
      s.jenisKelamin || 'L',
      scores?.pai ?? 80,
      scores?.pancasila ?? 82,
      scores?.bahasaIndonesia ?? 85,
      scores?.matematika ?? 78,
      scores?.ipa ?? 80,
      scores?.ips ?? 83,
      scores?.bahasaInggris ?? 81,
      scores?.seniBudaya ?? 86,
      scores?.pjok ?? 84,
      scores?.informatika ?? 85,
      scores?.bahasaJawa ?? 84,
      kehadiran?.sakit ?? 0,
      kehadiran?.izin ?? 0,
      kehadiran?.tanpaKeterangan ?? 0,
      scores?.catatan || 'Capaian kompetensi sangat baik dan aktif dalam pembelajaran.',
    ];
  });

  const wsData = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column width config
  ws['!cols'] = [
    { wch: 5 },  // No
    { wch: 12 }, // No Induk
    { wch: 14 }, // NISN
    { wch: 30 }, // Nama
    { wch: 8 },  // Kelas
    { wch: 6 },  // L/P
    { wch: 8 },  // PAI
    { wch: 15 }, // PPKn
    { wch: 18 }, // B.Indo
    { wch: 12 }, // Mtk
    { wch: 8 },  // IPA
    { wch: 8 },  // IPS
    { wch: 14 }, // B.Inggris
    { wch: 13 }, // Seni Budaya
    { wch: 8 },  // PJOK
    { wch: 12 }, // Informatika
    { wch: 13 }, // B.Jawa
    { wch: 8 },  // Sakit
    { wch: 8 },  // Izin
    { wch: 8 },  // Alpa
    { wch: 45 }, // Catatan
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `Nilai_Sem_${semester}`);

  const fileName = `TEMPLATE_NILAI_RAPOR_KELAS_${selectedClass || 'ALL'}_SEM_${semester}_SMPN2KASIHAN.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Parse Excel file for Score Import and update students
 */
export async function parseExcelScoreReportFile(
  file: File,
  existingStudents: Student[],
  semester: number,
  targetClass?: string
): Promise<{
  success: boolean;
  updatedCount: number;
  updatedStudents: Student[];
  errors: string[];
  warnings: string[];
  matchedDetails: Array<{ studentName: string; nisn: string; average: number }>;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          resolve({
            success: false,
            updatedCount: 0,
            updatedStudents: existingStudents,
            errors: ['File Excel tidak memiliki lembar kerja (worksheet).'],
            warnings: [],
            matchedDetails: [],
          });
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawRows.length === 0) {
          resolve({
            success: false,
            updatedCount: 0,
            updatedStudents: existingStudents,
            errors: ['File Excel kosong atau tidak memiliki baris data nilai.'],
            warnings: [],
            matchedDetails: [],
          });
          return;
        }

        const errors: string[] = [];
        const warnings: string[] = [];
        const matchedDetails: Array<{ studentName: string; nisn: string; average: number }> = [];

        // Helper to get number value clamped between 0 and 100
        const parseScore = (val: any, defaultVal = 0): number => {
          if (val === undefined || val === null || val === '') return defaultVal;
          const num = Number(val);
          if (isNaN(num)) return defaultVal;
          return Math.max(0, Math.min(100, Math.round(num)));
        };

        const parseDays = (val: any): number => {
          if (val === undefined || val === null || val === '') return 0;
          const num = Number(val);
          return isNaN(num) ? 0 : Math.max(0, Math.floor(num));
        };

        // Deep copy students array to avoid mutative bugs
        const studentMap = new Map<string, Student>();
        existingStudents.forEach((s) => studentMap.set(s.id, JSON.parse(JSON.stringify(s))));

        let updatedCount = 0;

        rawRows.forEach((row, rowIdx) => {
          // Identify student identifier columns
          const getCol = (...names: string[]) => {
            for (const name of names) {
              const exact = row[name];
              if (exact !== undefined && exact !== '') return exact;

              // Case-insensitive / normalized lookup
              const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
              const foundKey = Object.keys(row).find(
                (k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedName
              );
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
                return row[foundKey];
              }
            }
            return '';
          };

          const rawNisn = String(getCol('NISN', 'nisn', 'Nomor NISN')).trim();
          const rawNoInduk = String(getCol('No Induk', 'No Urut Induk', 'noInduk', 'noUrutInduk', 'NIS')).trim();
          const rawNama = String(getCol('Nama Siswa', 'Nama Lengkap', 'namaSiswa', 'namaLengkap', 'Nama')).trim();

          if (!rawNisn && !rawNoInduk && !rawNama) {
            return; // Skip empty header/filler rows
          }

          // Match student in our database
          let matched: Student | undefined;
          if (rawNisn) {
            matched = Array.from(studentMap.values()).find((s) => s.nisn === rawNisn);
          }
          if (!matched && rawNoInduk) {
            matched = Array.from(studentMap.values()).find(
              (s) => s.noUrutInduk === rawNoInduk || s.nis === rawNoInduk
            );
          }
          if (!matched && rawNama) {
            const cleanTarget = rawNama.toLowerCase().replace(/[^a-z0-9]/g, '');
            matched = Array.from(studentMap.values()).find(
              (s) => s.namaLengkap.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanTarget
            );
          }

          if (!matched) {
            warnings.push(
              `Baris ${rowIdx + 2}: Siswa "${rawNama || rawNisn || rawNoInduk}" tidak ditemukan di database siswa.`
            );
            return;
          }

          // Parse subject scores
          const pai = parseScore(getCol('PAI', 'Agama', 'Pendidikan Agama', 'Pendidikan Agama & Budi Pekerti'), 80);
          const pancasila = parseScore(getCol('PPKn/Pancasila', 'PPKn', 'Pancasila', 'Pendidikan Pancasila', 'PKn'), 80);
          const bahasaIndonesia = parseScore(getCol('Bahasa Indonesia', 'B.Indo', 'B Indo', 'Bahasa Indo', 'BINDO'), 80);
          const matematika = parseScore(getCol('Matematika', 'MTK', 'Mtk', 'Math'), 75);
          const ipa = parseScore(getCol('IPA', 'Ilmu Pengetahuan Alam'), 78);
          const ips = parseScore(getCol('IPS', 'Ilmu Pengetahuan Sosial'), 80);
          const bahasaInggris = parseScore(getCol('Bahasa Inggris', 'B.Inggris', 'B Inggris', 'B.ING', 'BING'), 80);
          const seniBudaya = parseScore(getCol('Seni Budaya', 'Seni', 'SBK', 'Seni Rupa', 'Seni Musik'), 85);
          const pjok = parseScore(getCol('PJOK', 'Penjas', 'Penjaskes', 'Olahraga'), 84);
          const informatika = parseScore(getCol('Informatika', 'TIK', 'Komputer'), 85);
          const bahasaJawa = parseScore(getCol('Bahasa Jawa', 'B.Jawa', 'B Jawa', 'Mulok Bahasa Jawa', 'BJAWA'), 82);

          const sakit = parseDays(getCol('Sakit', 'S'));
          const izin = parseDays(getCol('Izin', 'I'));
          const tanpaKeterangan = parseDays(getCol('Alpa', 'Tanpa Keterangan', 'TK', 'A'));
          const catatan = String(getCol('Catatan Akademik', 'Catatan', 'Keterangan') || '').trim();

          const allScores = [
            pai, pancasila, bahasaIndonesia, matematika, ipa,
            ips, bahasaInggris, seniBudaya, pjok, informatika, bahasaJawa
          ];
          const total = allScores.reduce((a, b) => a + b, 0);
          const rataRata = Number((total / allScores.length).toFixed(1));

          const semesterNum = (semester as 1 | 2 | 3 | 4 | 5 | 6);

          // Update student semester report
          const existingReports = matched.semesterReports || [];
          const existingReportIdx = existingReports.findIndex((r) => r.semester === semesterNum);

          const newReport = {
            semester: semesterNum,
            kelas: matched.kelasSekarang || targetClass || '7A',
            tahunAjaran: '2024/2025',
            scores: {
              pai,
              pancasila,
              bahasaIndonesia,
              matematika,
              ipa,
              ips,
              bahasaInggris,
              seniBudaya,
              pjok,
              informatika,
              bahasaJawa,
              rataRata,
              catatan: catatan || 'Capaian kompetensi sangat baik dan konsisten.',
            },
            kehadiran: {
              sakit,
              izin,
              tanpaKeterangan,
            },
            sikapSpiritual: (rataRata >= 85 ? 'Sangat Baik' : 'Baik') as 'Sangat Baik' | 'Baik' | 'Cukup',
            sikapSosial: (rataRata >= 85 ? 'Sangat Baik' : 'Baik') as 'Sangat Baik' | 'Baik' | 'Cukup',
          };

          if (existingReportIdx >= 0) {
            existingReports[existingReportIdx] = newReport;
          } else {
            existingReports.push(newReport);
          }

          matched.semesterReports = existingReports;
          matched.updatedAt = new Date().toISOString();

          studentMap.set(matched.id, matched);
          updatedCount++;
          matchedDetails.push({
            studentName: matched.namaLengkap,
            nisn: matched.nisn,
            average: rataRata,
          });
        });

        const updatedStudents = Array.from(studentMap.values());

        resolve({
          success: updatedCount > 0,
          updatedCount,
          updatedStudents,
          errors,
          warnings,
          matchedDetails,
        });
      } catch (err: any) {
        resolve({
          success: false,
          updatedCount: 0,
          updatedStudents: existingStudents,
          errors: [`Gagal memproses file Excel nilai: ${err?.message || 'Format tidak dikenali'}`],
          warnings: [],
          matchedDetails: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        updatedCount: 0,
        updatedStudents: existingStudents,
        errors: ['Gagal membaca file dari perangkat.'],
        warnings: [],
        matchedDetails: [],
      });
    };

    reader.readAsArrayBuffer(file);
  });
}
