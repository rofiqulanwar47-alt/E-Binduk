import { Student } from '../types';

export function formatDateIndonesian(dateString?: string): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function calculateAge(birthDateString?: string): number | string {
  if (!birthDateString) return '-';
  try {
    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return '-';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch {
    return '-';
  }
}

export function formatCurrency(amount: string | number): string {
  if (typeof amount === 'number') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return amount || '-';
}

export function exportStudentsToCsv(students: Student[]): void {
  const headers = [
    'No Induk',
    'NISN',
    'NIS',
    'NIK',
    'Nama Lengkap',
    'Nama Panggilan',
    'Jenis Kelamin',
    'Tempat Lahir',
    'Tanggal Lahir',
    'Agama',
    'Kelas',
    'Status',
    'Jalur Masuk',
    'Alamat Lengkap',
    'Dusun',
    'Kelurahan',
    'Kecamatan',
    'Kabupaten',
    'Nama Ayah',
    'Pekerjaan Ayah',
    'No HP Ayah',
    'Nama Ibu',
    'Pekerjaan Ibu',
    'No HP Ibu',
    'Penerima KIP',
    'Penerima KMS Bantul',
    'Asal SD',
    'Tahun Masuk',
  ];

  const rows = students.map((s) => [
    `"${s.noUrutInduk}"`,
    `"${s.nisn}"`,
    `"${s.nis}"`,
    `"${s.nik}"`,
    `"${s.namaLengkap.replace(/"/g, '""')}"`,
    `"${s.namaPanggilan.replace(/"/g, '""')}"`,
    `"${s.jenisKelamin}"`,
    `"${s.tempatLahir}"`,
    `"${s.tanggalLahir}"`,
    `"${s.agama}"`,
    `"${s.kelasSekarang}"`,
    `"${s.status}"`,
    `"${s.jalurMasuk}"`,
    `"${(s.tempatTinggal?.alamatLengkap || '').replace(/"/g, '""')}"`,
    `"${s.tempatTinggal?.dusun || ''}"`,
    `"${s.tempatTinggal?.kelurahan || ''}"`,
    `"${s.tempatTinggal?.kecamatan || ''}"`,
    `"${s.tempatTinggal?.kabupatenKota || ''}"`,
    `"${(s.dataOrangTua?.namaAyah || '').replace(/"/g, '""')}"`,
    `"${(s.dataOrangTua?.pekerjaanAyah || '').replace(/"/g, '""')}"`,
    `"${s.dataOrangTua?.noHpAyah || ''}"`,
    `"${(s.dataOrangTua?.namaIbu || '').replace(/"/g, '""')}"`,
    `"${(s.dataOrangTua?.pekerjaanIbu || '').replace(/"/g, '""')}"`,
    `"${s.dataOrangTua?.noHpIbu || ''}"`,
    `"${s.kesejahteraan?.penerimaKip ? 'Ya' : 'Tidak'}"`,
    `"${s.kesejahteraan?.penerimaKmsBantul ? 'Ya' : 'Tidak'}"`,
    `"${(s.pendidikanSebelumnya?.asalSdMi || '').replace(/"/g, '""')}"`,
    `"${s.tahunMasuk}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `BUKU_INDUK_SMPN2_KASIHAN_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
