import React, { useState, useMemo } from 'react';
import {
  X,
  UserCheck,
  UserMinus,
  Search,
  Building2,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRightLeft,
  School,
} from 'lucide-react';
import { Student, StudentStatus, Gender, Religion, AdmissionTrack, SchoolProfile } from '../types';
import { getDefaultStudentPhoto } from '../utils/studentPhotos';

interface MutationModalProps {
  initialMode?: 'masuk' | 'keluar';
  initialSelectedStudent?: Student | null;
  students: Student[];
  schoolProfile: SchoolProfile;
  onClose: () => void;
  onSaveMutationMasuk: (student: Student) => Promise<void> | void;
  onSaveMutationKeluar: (
    studentId: string,
    mutationData: {
      tanggalMutasi: string;
      pindahKeSekolah: string;
      alasanMutasi: string;
    }
  ) => Promise<void> | void;
}

export const MutationModal: React.FC<MutationModalProps> = ({
  initialMode = 'masuk',
  initialSelectedStudent = null,
  students,
  schoolProfile,
  onClose,
  onSaveMutationMasuk,
  onSaveMutationKeluar,
}) => {
  const [activeTab, setActiveTab] = useState<'masuk' | 'keluar'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Mutasi Masuk Form State ---
  const [masukForm, setMasukForm] = useState({
    noUrutInduk: `2024/${Math.floor(Math.random() * 900) + 100}`,
    nis: `12${Math.floor(Math.random() * 900) + 100}`,
    nisn: `011${Math.floor(Math.random() * 8999999) + 1000000}`,
    nik: '',
    namaLengkap: '',
    namaPanggilan: '',
    jenisKelamin: 'L' as Gender,
    tempatLahir: 'Bantul',
    tanggalLahir: '2011-05-10',
    agama: 'Islam' as Religion,
    diterimaDiKelas: '7A',
    kelasSekarang: '7A',
    tahunMasuk: '2024',
    tanggalDiterima: new Date().toISOString().split('T')[0],
    jalurMasuk: 'Perpindahan Tugas Orang Tua' as AdmissionTrack,
    asalSekolahSmp: 'SMP Negeri 1 Bantul',
    alasanMutasi: 'Mengikuti kepindahan tugas orang tua ke wilayah Kasihan Bantul',
    dusun: 'Bibis',
    kelurahan: 'Bangunjiwo',
    kecamatan: 'Kasihan',
    kabupatenKota: 'Bantul',
    namaAyah: '',
    namaIbu: '',
    noHp: '',
  });

  // --- Mutasi Keluar Form State ---
  const activeStudents = useMemo(() => {
    return students.filter((s) => s.status === 'Aktif' || s.status === 'Mutasi Masuk');
  }, [students]);

  const [selectedStudentForKeluar, setSelectedStudentForKeluar] = useState<Student | null>(
    initialSelectedStudent || (activeStudents.length > 0 ? activeStudents[0] : null)
  );

  const [keluarForm, setKeluarForm] = useState({
    tanggalMutasi: new Date().toISOString().split('T')[0],
    pindahKeSekolah: 'SMP Negeri 1 Bantul',
    alasanMutasi: 'Ikut pindah domisili orang tua ke luar kecamatan',
  });

  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  const searchedActiveStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return activeStudents.slice(0, 30);
    const q = studentSearchQuery.toLowerCase();
    return activeStudents
      .filter(
        (s) =>
          s.namaLengkap.toLowerCase().includes(q) ||
          s.nisn.toLowerCase().includes(q) ||
          s.kelasSekarang.toLowerCase().includes(q) ||
          s.noUrutInduk.toLowerCase().includes(q)
      )
      .slice(0, 30);
  }, [activeStudents, studentSearchQuery]);

  // Submit Mutasi Masuk
  const handleSubmitMasuk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masukForm.namaLengkap.trim() || !masukForm.nisn.trim()) {
      alert('Mohon isi Nama Lengkap dan NISN Siswa Pindahan.');
      return;
    }

    const newStudent: Student = {
      id: `std-mutasi-${Date.now()}`,
      noUrutInduk: masukForm.noUrutInduk,
      nis: masukForm.nis,
      nisn: masukForm.nisn,
      nik: masukForm.nik || '3402010000000000',
      noKk: '3402010000000000',
      namaLengkap: masukForm.namaLengkap.trim(),
      namaPanggilan: masukForm.namaPanggilan.trim() || masukForm.namaLengkap.split(' ')[0],
      jenisKelamin: masukForm.jenisKelamin,
      tempatLahir: masukForm.tempatLahir,
      tanggalLahir: masukForm.tanggalLahir,
      agama: masukForm.agama,
      kewarganegaraan: 'WNI',
      anakKe: 1,
      jumlahSaudaraKandung: 1,
      jumlahSaudaraTiri: 0,
      jumlahSaudaraAngkat: 0,
      statusDalamKeluarga: 'Anak Kandung',
      bahasaSehariHari: 'Bahasa Indonesia, Jawa',
      fotoUrl: getDefaultStudentPhoto(masukForm.jenisKelamin, masukForm.namaLengkap || masukForm.nisn),
      tempatTinggal: {
        alamatLengkap: `${masukForm.dusun}, ${masukForm.kelurahan}, ${masukForm.kecamatan}`,
        rt: '01',
        rw: '01',
        dusun: masukForm.dusun,
        kelurahan: masukForm.kelurahan,
        kecamatan: masukForm.kecamatan,
        kabupatenKota: masukForm.kabupatenKota,
        provinsi: 'D.I. Yogyakarta',
        kodePos: '55184',
        tinggalBersama: 'Orang Tua',
        transportasi: 'Sepeda Motor',
        jarakKeSekolahKm: 2,
        waktuTempuhMenit: 10,
      },
      jasmani: {
        golonganDarah: 'O',
        tinggiBadanCm: 155,
        beratBadanKg: 45,
        riwayatPenyakit: 'Tidak ada',
        kelainanJasmani: 'Tidak ada',
      },
      pendidikanSebelumnya: {
        asalSdMi: masukForm.asalSekolahSmp,
        kabupatenSdMi: masukForm.kabupatenKota,
        noPesertaUjianSd: '',
        noIjazahSd: '',
        tanggalIjazahSd: '',
        lamaBelajarTahun: 6,
      },
      dataOrangTua: {
        namaAyah: masukForm.namaAyah || 'Ayah',
        nikAyah: '',
        tempatLahirAyah: 'Bantul',
        tanggalLahirAyah: '1975-01-01',
        agamaAyah: masukForm.agama,
        pendidikanAyah: 'SMA / Sederajat',
        pekerjaanAyah: 'Karyawan Swasta',
        penghasilanAyah: 'Rp 3.000.000 - Rp 5.000.000',
        noHpAyah: masukForm.noHp,
        statusAyah: 'Masih Hidup',
        namaIbu: masukForm.namaIbu || 'Ibu',
        nikIbu: '',
        tempatLahirIbu: 'Bantul',
        tanggalLahirIbu: '1978-01-01',
        agamaIbu: masukForm.agama,
        pendidikanIbu: 'SMA / Sederajat',
        pekerjaanIbu: 'Ibu Rumah Tangga',
        penghasilanIbu: 'Tidak Berpenghasilan',
        noHpIbu: masukForm.noHp,
        statusIbu: 'Masih Hidup',
      },
      kesejahteraan: {
        penerimaKip: false,
        penerimaPkh: false,
        penerimaKmsBantul: false,
        layakPip: false,
      },
      tahunMasuk: masukForm.tahunMasuk,
      tanggalDiterima: masukForm.tanggalDiterima,
      diterimaDiKelas: masukForm.diterimaDiKelas,
      jalurMasuk: masukForm.jalurMasuk,
      status: 'Mutasi Masuk' as StudentStatus,
      kelasSekarang: masukForm.kelasSekarang,
      catatanPenerimaan: `Siswa Pindahan Masuk dari ${masukForm.asalSekolahSmp} (Alasan: ${masukForm.alasanMutasi})`,
      tahunAjaran: schoolProfile.tahunAjaranAktif || '2024/2025',
      semesterReports: [],
      ekstrakurikuler: [{ id: 'ek-1', nama: 'Pramuka', predikat: 'Baik', keterangan: 'Wajib' }],
      prestasi: [],
      catatanPerkembangan: [],
      tanggalMutasi: masukForm.tanggalDiterima,
      alasanMutasi: masukForm.alasanMutasi,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIsSubmitting(true);
    try {
      await onSaveMutationMasuk(newStudent);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan siswa mutasi masuk.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Mutasi Keluar
  const handleSubmitKeluar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForKeluar) {
      alert('Pilih siswa yang akan dicatat mutasi keluar.');
      return;
    }
    if (!keluarForm.pindahKeSekolah.trim()) {
      alert('Mohon isi nama Sekolah Tujuan pindah.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveMutationKeluar(selectedStudentForKeluar.id, {
        tanggalMutasi: keluarForm.tanggalMutasi,
        pindahKeSekolah: keluarForm.pindahKeSekolah.trim(),
        alasanMutasi: keluarForm.alasanMutasi.trim(),
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Gagal mencatat mutasi keluar.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ArrowRightLeft className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Pencatatan Mutasi Siswa Buku Induk</span>
              </h2>
              <p className="text-xs text-emerald-200">
                Pencatatan resmi siswa pindahan masuk maupun pindahan keluar di SMP Negeri 2 Kasihan Bantul.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('masuk')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'masuk'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>1. Catat Siswa Mutasi Masuk (Pindahan Masuk)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('keluar')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'keluar'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <UserMinus className="w-4 h-4" />
            <span>2. Catat Siswa Mutasi Keluar (Pindah Sekolah)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {activeTab === 'masuk' ? (
            /* =================== TAB 1: MUTASI MASUK =================== */
            <form onSubmit={handleSubmitMasuk} className="space-y-4">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Formulir ini mendaftarkan peserta didik baru yang masuk ke SMP Negeri 2 Kasihan Bantul melalui jalur pindahan/mutasi dari sekolah lain. Data akan otomatis tercatat berstatus <strong className="text-emerald-800">Mutasi Masuk</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* No Induk & NISN */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. Induk Sekolah *</label>
                  <input
                    type="text"
                    required
                    value={masukForm.noUrutInduk}
                    onChange={(e) => setMasukForm({ ...masukForm, noUrutInduk: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">NISN Nasional (10 Digit) *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={masukForm.nisn}
                    onChange={(e) => setMasukForm({ ...masukForm, nisn: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIS Sekolah</label>
                  <input
                    type="text"
                    value={masukForm.nis}
                    onChange={(e) => setMasukForm({ ...masukForm, nis: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono bg-white"
                  />
                </div>

                {/* Nama Lengkap */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Siswa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Sesuai Akta / Ijazah"
                    value={masukForm.namaLengkap}
                    onChange={(e) => setMasukForm({ ...masukForm, namaLengkap: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold bg-white"
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin *</label>
                  <select
                    value={masukForm.jenisKelamin}
                    onChange={(e) => setMasukForm({ ...masukForm, jenisKelamin: e.target.value as Gender })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                {/* Diterima di Kelas */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Diterima di Kelas (Rombel) *</label>
                  <select
                    value={masukForm.kelasSekarang}
                    onChange={(e) =>
                      setMasukForm({
                        ...masukForm,
                        kelasSekarang: e.target.value,
                        diterimaDiKelas: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-emerald-50 text-emerald-900 font-bold"
                  >
                    <option value="7A">Kelas 7A</option>
                    <option value="7B">Kelas 7B</option>
                    <option value="7C">Kelas 7C</option>
                    <option value="7D">Kelas 7D</option>
                    <option value="8A">Kelas 8A</option>
                    <option value="8B">Kelas 8B</option>
                    <option value="8C">Kelas 8C</option>
                    <option value="8D">Kelas 8D</option>
                    <option value="9A">Kelas 9A</option>
                    <option value="9B">Kelas 9B</option>
                    <option value="9C">Kelas 9C</option>
                    <option value="9D">Kelas 9D</option>
                  </select>
                </div>

                {/* Tanggal Mutasi Masuk */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Mutasi Masuk *</label>
                  <input
                    type="date"
                    required
                    value={masukForm.tanggalDiterima}
                    onChange={(e) => setMasukForm({ ...masukForm, tanggalDiterima: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                  />
                </div>

                {/* Agama */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Agama</label>
                  <select
                    value={masukForm.agama}
                    onChange={(e) => setMasukForm({ ...masukForm, agama: e.target.value as Religion })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>

                {/* Asal Sekolah */}
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Asal Sekolah SMP Sebelumnya *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMP Negeri 1 Pajangan Bantul"
                    value={masukForm.asalSekolahSmp}
                    onChange={(e) => setMasukForm({ ...masukForm, asalSekolahSmp: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  />
                </div>

                {/* Alasan Mutasi */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alasan Pindah / Mutasi</label>
                  <input
                    type="text"
                    placeholder="e.g. Ikut Pindah Tugas Orang Tua"
                    value={masukForm.alasanMutasi}
                    onChange={(e) => setMasukForm({ ...masukForm, alasanMutasi: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  />
                </div>

                {/* Dusun & Kelurahan */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dusun / Padukuhan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bibis / Kasihan"
                    value={masukForm.dusun}
                    onChange={(e) => setMasukForm({ ...masukForm, dusun: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Orang Tua (Ayah / Ibu)</label>
                  <input
                    type="text"
                    placeholder="Nama Orang Tua Siswa"
                    value={masukForm.namaAyah}
                    onChange={(e) => setMasukForm({ ...masukForm, namaAyah: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">No. HP / WA Wali</label>
                  <input
                    type="text"
                    placeholder="081234567890"
                    value={masukForm.noHp}
                    onChange={(e) => setMasukForm({ ...masukForm, noHp: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Siswa Mutasi Masuk'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* =================== TAB 2: MUTASI KELUAR =================== */
            <form onSubmit={handleSubmitKeluar} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Pencatatan siswa yang pindah ke sekolah lain. Status siswa akan diperbarui menjadi <strong className="text-amber-800">Mutasi Keluar</strong> dengan mencatat sekolah tujuan dan tanggal pindah resmi, sementara berkas Buku Induk tetap tersimpan sebagai arsip.
                </p>
              </div>

              {/* Student Selector */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Pilih Siswa Aktif yang Akan Mutasi Keluar *
                </label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari siswa berdasarkan nama, NISN, atau kelas..."
                      value={studentSearchQuery}
                      onChange={(e) => setStudentSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    />
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-44 overflow-y-auto divide-y divide-slate-100 bg-slate-50">
                    {searchedActiveStudents.map((s) => {
                      const isSelected = selectedStudentForKeluar?.id === s.id;
                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedStudentForKeluar(s)}
                          className={`p-2.5 flex items-center justify-between cursor-pointer transition ${
                            isSelected
                              ? 'bg-amber-100/70 text-amber-950 font-bold'
                              : 'hover:bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={s.fotoUrl}
                              alt={s.namaLengkap}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="text-xs">{s.namaLengkap}</div>
                              <div className="text-[10px] text-slate-400 font-normal">
                                NISN: {s.nisn} • No. Induk: {s.noUrutInduk}
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-slate-200 text-slate-800">
                            Kelas {s.kelasSekarang}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Student Card */}
              {selectedStudentForKeluar && (
                <div className="p-3 bg-amber-50/50 border border-amber-300 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider block">
                      Siswa Terpilih:
                    </span>
                    <span className="text-xs font-bold text-slate-900">
                      {selectedStudentForKeluar.namaLengkap} (Kelas {selectedStudentForKeluar.kelasSekarang})
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      NISN: {selectedStudentForKeluar.nisn} • No. Induk: {selectedStudentForKeluar.noUrutInduk}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-amber-200 text-amber-900 rounded-md">
                    Siap Diproses Mutasi
                  </span>
                </div>
              )}

              {/* Mutation Out Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tanggal Resmi Mutasi Keluar *</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={keluarForm.tanggalMutasi}
                    onChange={(e) => setKeluarForm({ ...keluarForm, tanggalMutasi: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pindah Ke Sekolah Tujuan *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SMP Negeri 1 Bantul / SMP N 1 Yogyakarta"
                    value={keluarForm.pindahKeSekolah}
                    onChange={(e) => setKeluarForm({ ...keluarForm, pindahKeSekolah: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    <span>Alasan Mutasi Keluar</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mengikuti perpindahan tugas orang tua ke luar kota"
                    value={keluarForm.alasanMutasi}
                    onChange={(e) => setKeluarForm({ ...keluarForm, alasanMutasi: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedStudentForKeluar}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white rounded-lg font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <UserMinus className="w-4 h-4" />
                  <span>{isSubmitting ? 'Memproses...' : 'Catat Mutasi Keluar'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
