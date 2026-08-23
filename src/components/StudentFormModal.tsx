import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Sparkles,
  User,
  MapPin,
  Activity,
  GraduationCap,
  Users,
  HeartHandshake,
  BookOpen,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Student, SchoolProfile, Religion, BloodType, Gender, AdmissionTrack, StudentStatus } from '../types';
import { calculateAge } from '../utils/formatters';

interface StudentFormModalProps {
  initialStudent: Student | null; // null = new student
  schoolProfile: SchoolProfile;
  onClose: () => void;
  onSave: (student: Student) => void;
}

export const StudentFormModal: React.FC<StudentFormModalProps> = ({
  initialStudent,
  schoolProfile,
  onClose,
  onSave,
}) => {
  const isEditing = !!initialStudent;

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    noUrutInduk: '',
    nis: '',
    nisn: '',
    nik: '',
    noKk: '',
    namaLengkap: '',
    namaPanggilan: '',
    jenisKelamin: 'L',
    tempatLahir: 'Bantul',
    tanggalLahir: '2011-01-01',
    agama: 'Islam',
    kewarganegaraan: 'WNI',
    anakKe: 1,
    jumlahSaudaraKandung: 1,
    jumlahSaudaraTiri: 0,
    jumlahSaudaraAngkat: 0,
    statusDalamKeluarga: 'Anak Kandung',
    bahasaSehariHari: 'Bahasa Indonesia, Jawa',
    fotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
    tahunMasuk: '2024',
    tanggalDiterima: '2024-07-15',
    diterimaDiKelas: '7A',
    jalurMasuk: 'Zonasi',
    status: 'Aktif',
    kelasSekarang: '7A',
    tahunAjaran: schoolProfile.tahunAjaranAktif || '2024/2025',
    tempatTinggal: {
      alamatLengkap: '',
      rt: '01',
      rw: '01',
      dusun: 'Bibis',
      kelurahan: 'Bangunjiwo',
      kecamatan: 'Kasihan',
      kabupatenKota: 'Bantul',
      provinsi: 'D.I. Yogyakarta',
      kodePos: '55184',
      tinggalBersama: 'Orang Tua',
      transportasi: 'Sepeda',
      jarakKeSekolahKm: 1.5,
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
      asalSdMi: 'SD Negeri Bibis',
      kabupatenSdMi: 'Bantul',
      noPesertaUjianSd: '',
      noIjazahSd: '',
      tanggalIjazahSd: '2024-06-15',
      nilaiKelulusanSd: 85.0,
      lamaBelajarTahun: 6,
    },
    dataOrangTua: {
      namaAyah: '',
      nikAyah: '',
      tempatLahirAyah: 'Bantul',
      tanggalLahirAyah: '1975-01-01',
      agamaAyah: 'Islam',
      pendidikanAyah: 'SMA / Sederajat',
      pekerjaanAyah: 'Wiraswasta',
      penghasilanAyah: 'Rp 2.500.000 - Rp 4.000.000',
      noHpAyah: '',
      statusAyah: 'Masih Hidup',
      namaIbu: '',
      nikIbu: '',
      tempatLahirIbu: 'Bantul',
      tanggalLahirIbu: '1978-01-01',
      agamaIbu: 'Islam',
      pendidikanIbu: 'SMA / Sederajat',
      pekerjaanIbu: 'Ibu Rumah Tangga',
      penghasilanIbu: 'Tidak Berpenghasilan',
      noHpIbu: '',
      statusIbu: 'Masih Hidup',
    },
    kesejahteraan: {
      penerimaKip: false,
      noKip: '',
      penerimaPkh: false,
      penerimaKmsBantul: false,
      layakPip: false,
    },
    semesterReports: [],
    ekstrakurikuler: [
      { id: 'ek-def-1', nama: 'Pramuka Penggalang', predikat: 'Baik', keterangan: 'Wajib' },
    ],
    prestasi: [],
    catatanPerkembangan: [],
  });

  // Raw text parser state for AI
  const [rawBioText, setRawBioText] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => {
    if (initialStudent) {
      setFormData(initialStudent);
    } else {
      // Auto generate sample NIS/Induk
      const randomInduk = `2024/${String(Math.floor(Math.random() * 800) + 100).padStart(3, '0')}`;
      const randomNis = `12${Math.floor(Math.random() * 800) + 100}`;
      const randomNisn = `011${Math.floor(Math.random() * 8999999) + 1000000}`;
      setFormData((prev) => ({
        ...prev,
        noUrutInduk: randomInduk,
        nis: randomNis,
        nisn: randomNisn,
      }));
    }
  }, [initialStudent]);

  // AI Paste Parser trigger
  const handleAiParse = async () => {
    if (!rawBioText.trim()) return;
    setIsAiParsing(true);
    setAiError(null);

    try {
      const res = await fetch('/api/ai/parse-biodata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: rawBioText }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const parsed = json.data;
        setFormData((prev) => ({
          ...prev,
          namaLengkap: parsed.namaLengkap || prev.namaLengkap,
          namaPanggilan: parsed.namaPanggilan || prev.namaPanggilan,
          nisn: parsed.nisn || prev.nisn,
          nis: parsed.nis || prev.nis,
          nik: parsed.nik || prev.nik,
          noKk: parsed.noKk || prev.noKk,
          jenisKelamin: parsed.jenisKelamin || prev.jenisKelamin,
          tempatLahir: parsed.tempatLahir || prev.tempatLahir,
          tanggalLahir: parsed.tanggalLahir || prev.tanggalLahir,
          agama: (parsed.agama as Religion) || prev.agama,
          kewarganegaraan: parsed.kewarganegaraan || prev.kewarganegaraan || 'WNI',
          kelasSekarang: parsed.kelasSekarang || prev.kelasSekarang,
          diterimaDiKelas: parsed.diterimaDiKelas || parsed.kelasSekarang || prev.diterimaDiKelas,
          tahunMasuk: parsed.tahunMasuk || prev.tahunMasuk || '2024',
          tanggalDiterima: parsed.tanggalDiterima || prev.tanggalDiterima || '2024-07-15',
          jalurMasuk: (parsed.jalurMasuk as AdmissionTrack) || prev.jalurMasuk,
          status: (parsed.status as StudentStatus) || prev.status || 'Aktif',
          catatanPenerimaan: parsed.catatanPenerimaan || prev.catatanPenerimaan,
          tempatTinggal: {
            ...prev.tempatTinggal!,
            alamatLengkap: parsed.alamatLengkap || prev.tempatTinggal?.alamatLengkap || '',
            dusun: parsed.dusun || prev.tempatTinggal?.dusun || '',
            kelurahan: parsed.kelurahan || prev.tempatTinggal?.kelurahan || '',
            kecamatan: parsed.kecamatan || prev.tempatTinggal?.kecamatan || '',
            kabupatenKota: parsed.kabupatenKota || prev.tempatTinggal?.kabupatenKota || '',
            kodePos: parsed.kodePos || prev.tempatTinggal?.kodePos || '',
          },
          jasmani: {
            ...prev.jasmani!,
            golonganDarah: (parsed.golonganDarah as BloodType) || prev.jasmani?.golonganDarah || 'O',
            tinggiBadanCm: Number(parsed.tinggiBadan) || prev.jasmani?.tinggiBadanCm || 155,
            beratBadanKg: Number(parsed.beratBadan) || prev.jasmani?.beratBadanKg || 45,
          },
          pendidikanSebelumnya: {
            ...prev.pendidikanSebelumnya!,
            asalSdMi: parsed.asalSdMi || prev.pendidikanSebelumnya?.asalSdMi || '',
            noIjazahSd: parsed.noIjazahSd || prev.pendidikanSebelumnya?.noIjazahSd || '',
          },
          dataOrangTua: {
            ...prev.dataOrangTua!,
            namaAyah: parsed.namaAyah || prev.dataOrangTua?.namaAyah || '',
            nikAyah: parsed.nikAyah || prev.dataOrangTua?.nikAyah || '',
            pekerjaanAyah: parsed.pekerjaanAyah || prev.dataOrangTua?.pekerjaanAyah || '',
            noHpAyah: parsed.noHpAyah || prev.dataOrangTua?.noHpAyah || '',
            namaIbu: parsed.namaIbu || prev.dataOrangTua?.namaIbu || '',
            nikIbu: parsed.nikIbu || prev.dataOrangTua?.nikIbu || '',
            pekerjaanIbu: parsed.pekerjaanIbu || prev.dataOrangTua?.pekerjaanIbu || '',
            noHpIbu: parsed.noHpIbu || prev.dataOrangTua?.noHpIbu || '',
          },
        }));
        setShowAiModal(false);
      } else {
        setAiError(json.error || 'Gagal mengekstrak teks dengan AI.');
      }
    } catch (err: any) {
      setAiError(err?.message || 'Terjadi kesalahan koneksi server.');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap || !formData.nisn) {
      alert('Mohon lengkapi Nama Lengkap dan NISN Siswa.');
      return;
    }

    const studentToSave: Student = {
      id: initialStudent?.id || `std-${Date.now()}`,
      noUrutInduk: formData.noUrutInduk || `2024/${Math.floor(Math.random() * 900) + 100}`,
      nis: formData.nis || `12${Math.floor(Math.random() * 900) + 100}`,
      nisn: formData.nisn || '',
      nik: formData.nik || '',
      noKk: formData.noKk || '',
      namaLengkap: formData.namaLengkap || '',
      namaPanggilan: formData.namaPanggilan || '',
      jenisKelamin: (formData.jenisKelamin as Gender) || 'L',
      tempatLahir: formData.tempatLahir || 'Bantul',
      tanggalLahir: formData.tanggalLahir || '2011-01-01',
      agama: (formData.agama as Religion) || 'Islam',
      kewarganegaraan: (formData.kewarganegaraan as 'WNI' | 'WNA') || 'WNI',
      anakKe: Number(formData.anakKe) || 1,
      jumlahSaudaraKandung: Number(formData.jumlahSaudaraKandung) || 0,
      jumlahSaudaraTiri: Number(formData.jumlahSaudaraTiri) || 0,
      jumlahSaudaraAngkat: Number(formData.jumlahSaudaraAngkat) || 0,
      statusDalamKeluarga: formData.statusDalamKeluarga || 'Anak Kandung',
      bahasaSehariHari: formData.bahasaSehariHari || 'Bahasa Indonesia, Jawa',
      fotoUrl: formData.fotoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
      tempatTinggal: formData.tempatTinggal!,
      jasmani: formData.jasmani!,
      pendidikanSebelumnya: formData.pendidikanSebelumnya!,
      dataOrangTua: formData.dataOrangTua!,
      kesejahteraan: formData.kesejahteraan!,
      tahunMasuk: formData.tahunMasuk || '2024',
      tanggalDiterima: formData.tanggalDiterima || '2024-07-15',
      diterimaDiKelas: formData.diterimaDiKelas || formData.kelasSekarang || '7A',
      jalurMasuk: (formData.jalurMasuk as AdmissionTrack) || 'Zonasi',
      status: (formData.status as StudentStatus) || 'Aktif',
      kelasSekarang: formData.kelasSekarang || '7A',
      catatanPenerimaan: formData.catatanPenerimaan || 'Siswa Baru Kelas VII',
      tahunAjaran: formData.tahunAjaran || schoolProfile.tahunAjaranAktif,
      semesterReports: formData.semesterReports || [],
      ekstrakurikuler: formData.ekstrakurikuler || [],
      prestasi: formData.prestasi || [],
      catatanPerkembangan: formData.catatanPerkembangan || [],
      createdAt: initialStudent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(studentToSave);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-700 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {isEditing ? `Edit Buku Induk: ${formData.namaLengkap}` : 'Registrasi & Entri Buku Induk Siswa Baru'}
            </h2>
            <p className="text-xs text-emerald-200">
              Formulir Standar Buku Induk Siswa Nasional Kemendikbudristek • SMP N 2 Kasihan
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>AI Auto-Fill dari Teks</span>
            </button>

            <button onClick={onClose} className="p-1 text-slate-300 hover:text-white rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Quick Paste Modal Sub-drawer */}
        {showAiModal && (
          <div className="p-4 bg-emerald-950 text-white border-b border-emerald-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>AI OCR / Parser Teks Biodata Siswa</span>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-xs text-slate-400 hover:text-white">
                ✕ Tutup
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Tempel teks biodata mentah siswa (dari formulir pendaftaran, pesan WhatsApp, Dapodik, atau berkas ijazah). AI Gemini akan mengekstrak otomatis ke formulir Buku Induk.
            </p>
            <textarea
              rows={4}
              placeholder="Contoh: Nama: Rizky Pratama, NISN: 0108998822, TTL: Bantul 15 April 2011, Alamat: RT 03 Bibis Bangunjiwo Kasihan Bantul, Ayah: Joko Santoso..."
              value={rawBioText}
              onChange={(e) => setRawBioText(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-900 border border-emerald-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
            />
            {aiError && <p className="text-xs text-red-400">{aiError}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-3 py-1.5 rounded text-xs bg-slate-800 text-slate-300"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleAiParse}
                disabled={isAiParsing || !rawBioText.trim()}
                className="px-4 py-1.5 rounded text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 disabled:opacity-50"
              >
                {isAiParsing ? 'Mengekstrak dengan Gemini AI...' : 'Ekstrak & Terapkan ke Form'}
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs text-slate-800">
          {/* SECTION A: IDENTITAS PESERTA DIDIK */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-emerald-600" />
              <span>A. IDENTITAS PESERTA DIDIK</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">No. Induk (No. Register) *</label>
                <input
                  type="text"
                  required
                  value={formData.noUrutInduk || ''}
                  onChange={(e) => setFormData({ ...formData, noUrutInduk: e.target.value })}
                  placeholder="e.g. 2024/001"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">NISN (10 Digit) *</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={formData.nisn || ''}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  placeholder="010xxxxxxx"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">NIK (16 Digit KTP/KK)</label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.nik || ''}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                  placeholder="340203xxxxxxx"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Kartu Keluarga (No. KK)</label>
                <input
                  type="text"
                  maxLength={16}
                  value={formData.noKk || ''}
                  onChange={(e) => setFormData({ ...formData, noKk: e.target.value })}
                  placeholder="340203xxxxxxx"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">NIS Sekolah</label>
                <input
                  type="text"
                  value={formData.nis || ''}
                  onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                  placeholder="124xx"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Siswa *</label>
                <input
                  type="text"
                  required
                  value={formData.namaLengkap || ''}
                  onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                  placeholder="Nama lengkap sesuai akta kelahiran"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900 uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Panggilan</label>
                <input
                  type="text"
                  value={formData.namaPanggilan || ''}
                  onChange={(e) => setFormData({ ...formData, namaPanggilan: e.target.value })}
                  placeholder="Nama panggilan"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin</label>
                <select
                  value={formData.jenisKelamin}
                  onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as Gender })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tempat Lahir</label>
                <input
                  type="text"
                  value={formData.tempatLahir || ''}
                  onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                  placeholder="Kab/Kota Lahir"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tanggal Lahir</label>
                <input
                  type="date"
                  value={formData.tanggalLahir || ''}
                  onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Agama</label>
                <select
                  value={formData.agama}
                  onChange={(e) => setFormData({ ...formData, agama: e.target.value as Religion })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kewarganegaraan</label>
                <select
                  value={formData.kewarganegaraan || 'WNI'}
                  onChange={(e) => setFormData({ ...formData, kewarganegaraan: e.target.value as any })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="WNI">WNI</option>
                  <option value="WNA">WNA</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Anak Ke- / Jml Saudara</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    value={formData.anakKe || 1}
                    onChange={(e) => setFormData({ ...formData, anakKe: Number(e.target.value) })}
                    className="w-16 p-2 border border-slate-300 rounded-lg bg-white"
                  />
                  <span className="text-slate-400">dari</span>
                  <input
                    type="number"
                    min={0}
                    value={formData.jumlahSaudaraKandung || 0}
                    onChange={(e) => setFormData({ ...formData, jumlahSaudaraKandung: Number(e.target.value) })}
                    className="w-16 p-2 border border-slate-300 rounded-lg bg-white"
                  />
                  <span className="text-slate-400 text-[10px]">saudara</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bahasa Sehari-hari</label>
                <input
                  type="text"
                  value={formData.bahasaSehariHari || ''}
                  onChange={(e) => setFormData({ ...formData, bahasaSehariHari: e.target.value })}
                  placeholder="Bahasa Indonesia, Jawa"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              {/* Foto Siswa: URL & Upload File Langsung */}
              <div className="sm:col-span-2 space-y-2">
                <label className="font-semibold text-slate-700 block mb-1">
                  Pas Foto Resmi Siswa (3x4)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-18 rounded-lg border border-slate-300 bg-white p-1 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={formData.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                      alt="Pas Foto"
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="text"
                      value={formData.fotoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
                      placeholder="https://... atau pilih berkas foto dari komputer"
                      className="w-full p-2 border border-slate-300 rounded-lg bg-white text-xs font-mono"
                    />
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md border border-slate-300 cursor-pointer transition text-[11px] inline-flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Upload Berkas Foto (.jpg / .png)</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setFormData({ ...formData, fotoUrl: event.target?.result as string });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION B: ALAMAT & TEMPAT TINGGAL */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>B. TEMPAT TINGGAL & TRANSPORTASI</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Alamat Lengkap Jalan / RT / RW</label>
                <input
                  type="text"
                  value={formData.tempatTinggal?.alamatLengkap || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tempatTinggal: { ...formData.tempatTinggal!, alamatLengkap: e.target.value },
                    })
                  }
                  placeholder="e.g. RT 03 RW 02 Dusun Bibis Kulon"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">RT / RW</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="RT"
                    value={formData.tempatTinggal?.rt || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tempatTinggal: { ...formData.tempatTinggal!, rt: e.target.value },
                      })
                    }
                    className="w-1/2 p-2 border border-slate-300 rounded-lg bg-white text-center font-mono"
                  />
                  <input
                    type="text"
                    placeholder="RW"
                    value={formData.tempatTinggal?.rw || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tempatTinggal: { ...formData.tempatTinggal!, rw: e.target.value },
                      })
                    }
                    className="w-1/2 p-2 border border-slate-300 rounded-lg bg-white text-center font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Dusun / Kampung</label>
                <input
                  type="text"
                  value={formData.tempatTinggal?.dusun || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tempatTinggal: { ...formData.tempatTinggal!, dusun: e.target.value },
                    })
                  }
                  placeholder="e.g. Bibis / Kalipucang / Gendeng"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kelurahan / Desa</label>
                <input
                  type="text"
                  value={formData.tempatTinggal?.kelurahan || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tempatTinggal: { ...formData.tempatTinggal!, kelurahan: e.target.value },
                    })
                  }
                  placeholder="e.g. Bangunjiwo / Tamantirto"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={formData.tempatTinggal?.kecamatan || 'Kasihan'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tempatTinggal: { ...formData.tempatTinggal!, kecamatan: e.target.value },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kabupaten / Kota</label>
                <input
                  type="text"
                  value={formData.tempatTinggal?.kabupatenKota || 'Bantul'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tempatTinggal: { ...formData.tempatTinggal!, kabupatenKota: e.target.value },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kode Pos</label>
                <input
                  type="text"
                  value={formData.tempatTinggal?.kodePos || '55184'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tempatTinggal: { ...formData.tempatTinggal!, kodePos: e.target.value },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tinggal Bersama</label>
                <input
                  type="text"
                  value={formData.tempatTinggal?.tinggalBersama || 'Orang Tua'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tempatTinggal: { ...formData.tempatTinggal!, tinggalBersama: e.target.value },
                    })
                  }
                  placeholder="Orang Tua / Wali / Asrama"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Transportasi</label>
                <select
                  value={formData.tempatTinggal?.transportasi}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tempatTinggal: { ...formData.tempatTinggal!, transportasi: e.target.value as any },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Jalan Kaki">Jalan Kaki</option>
                  <option value="Sepeda">Sepeda</option>
                  <option value="Sepeda Motor">Sepeda Motor</option>
                  <option value="Antar Jemput">Antar Jemput</option>
                  <option value="Angkutan Umum">Angkutan Umum</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Jarak ke Sekolah (km)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tempatTinggal?.jarakKeSekolahKm || 1.0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tempatTinggal: { ...formData.tempatTinggal!, jarakKeSekolahKm: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION C: KEADAAN JASMANI & KESEHATAN */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>C. KEADAAN JASMANI & KESEHATAN</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Golongan Darah</label>
                <select
                  value={formData.jasmani?.golonganDarah || 'O'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jasmani: { ...formData.jasmani!, golonganDarah: e.target.value as BloodType },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                  <option value="-">- (Belum Diketahui)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  value={formData.jasmani?.tinggiBadanCm || 150}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jasmani: { ...formData.jasmani!, tinggiBadanCm: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Berat Badan (kg)</label>
                <input
                  type="number"
                  value={formData.jasmani?.beratBadanKg || 45}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jasmani: { ...formData.jasmani!, beratBadanKg: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Riwayat Penyakit</label>
                <input
                  type="text"
                  value={formData.jasmani?.riwayatPenyakit || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jasmani: { ...formData.jasmani!, riwayatPenyakit: e.target.value },
                    })
                  }
                  placeholder="Tidak ada / Asma / dll"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION D: PENDIDIKAN SEBELUMNYA & BANTUAN SOSIAL */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>D. KETERANGAN PENDIDIKAN SEBELUMNYA (SD/MI) & BANTUAN SOSIAL</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Asal SD / MI</label>
                <input
                  type="text"
                  value={formData.pendidikanSebelumnya?.asalSdMi || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pendidikanSebelumnya: { ...formData.pendidikanSebelumnya!, asalSdMi: e.target.value },
                    })
                  }
                  placeholder="e.g. SD Negeri Bibis"
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kabupaten/Kota Asal SD</label>
                <input
                  type="text"
                  value={formData.pendidikanSebelumnya?.kabupatenSdMi || 'Bantul'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pendidikanSebelumnya: { ...formData.pendidikanSebelumnya!, kabupatenSdMi: e.target.value },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nomor Ijazah SD</label>
                <input
                  type="text"
                  value={formData.pendidikanSebelumnya?.noIjazahSd || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pendidikanSebelumnya: { ...formData.pendidikanSebelumnya!, noIjazahSd: e.target.value },
                    })
                  }
                  placeholder="DN-04/..."
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tanggal Ijazah SD</label>
                <input
                  type="date"
                  value={formData.pendidikanSebelumnya?.tanggalIjazahSd || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pendidikanSebelumnya: { ...formData.pendidikanSebelumnya!, tanggalIjazahSd: e.target.value },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nilai Rata-rata Ijazah SD</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.pendidikanSebelumnya?.nilaiKelulusanSd || 85.0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pendidikanSebelumnya: { ...formData.pendidikanSebelumnya!, nilaiKelulusanSd: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lama Belajar di SD (Tahun)</label>
                <input
                  type="number"
                  value={formData.pendidikanSebelumnya?.lamaBelajarTahun || 6}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pendidikanSebelumnya: { ...formData.pendidikanSebelumnya!, lamaBelajarTahun: Number(e.target.value) },
                    })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="penerimaKip"
                  checked={formData.kesejahteraan?.penerimaKip || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kesejahteraan: { ...formData.kesejahteraan!, penerimaKip: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <label htmlFor="penerimaKip" className="font-semibold text-slate-700 cursor-pointer">
                  Penerima KIP / PIP Kemendikbud
                </label>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="penerimaKms"
                  checked={formData.kesejahteraan?.penerimaKmsBantul || false}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      kesejahteraan: { ...formData.kesejahteraan!, penerimaKmsBantul: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded text-emerald-600"
                />
                <label htmlFor="penerimaKms" className="font-semibold text-slate-700 cursor-pointer">
                  Penerima KMS Kabupaten Bantul
                </label>
              </div>
            </div>
          </div>

          {/* SECTION E: DATA ORANG TUA KANDUNG */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>E. KETERANGAN ORANG TUA KANDUNG & WALI</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ayah */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
                <div className="font-bold text-emerald-800 text-xs uppercase border-b pb-1">Identitas Ayah Kandung</div>
                <div>
                  <label className="text-slate-600 block mb-1">Nama Lengkap Ayah</label>
                  <input
                    type="text"
                    value={formData.dataOrangTua?.namaAyah || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dataOrangTua: { ...formData.dataOrangTua!, namaAyah: e.target.value },
                      })
                    }
                    className="w-full p-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">NIK Ayah</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={formData.dataOrangTua?.nikAyah || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataOrangTua: { ...formData.dataOrangTua!, nikAyah: e.target.value },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Pekerjaan Ayah</label>
                    <input
                      type="text"
                      value={formData.dataOrangTua?.pekerjaanAyah || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataOrangTua: { ...formData.dataOrangTua!, pekerjaanAyah: e.target.value },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">Penghasilan Ayah</label>
                    <input
                      type="text"
                      value={formData.dataOrangTua?.penghasilanAyah || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataOrangTua: { ...formData.dataOrangTua!, penghasilanAyah: e.target.value },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">No. HP / WA</label>
                    <input
                      type="text"
                      value={formData.dataOrangTua?.noHpAyah || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataOrangTua: { ...formData.dataOrangTua!, noHpAyah: e.target.value },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Ibu */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
                <div className="font-bold text-pink-800 text-xs uppercase border-b pb-1">Identitas Ibu Kandung</div>
                <div>
                  <label className="text-slate-600 block mb-1">Nama Lengkap Ibu</label>
                  <input
                    type="text"
                    value={formData.dataOrangTua?.namaIbu || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dataOrangTua: { ...formData.dataOrangTua!, namaIbu: e.target.value },
                      })
                    }
                    className="w-full p-1.5 border border-slate-300 rounded"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">NIK Ibu</label>
                    <input
                      type="text"
                      maxLength={16}
                      value={formData.dataOrangTua?.nikIbu || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataOrangTua: { ...formData.dataOrangTua!, nikIbu: e.target.value },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Pekerjaan Ibu</label>
                    <input
                      type="text"
                      value={formData.dataOrangTua?.pekerjaanIbu || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataOrangTua: { ...formData.dataOrangTua!, pekerjaanIbu: e.target.value },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-600 block mb-1">Penghasilan Ibu</label>
                    <input
                      type="text"
                      value={formData.dataOrangTua?.penghasilanIbu || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataOrangTua: { ...formData.dataOrangTua!, penghasilanIbu: e.target.value },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">No. HP / WA</label>
                    <input
                      type="text"
                      value={formData.dataOrangTua?.noHpIbu || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          dataOrangTua: { ...formData.dataOrangTua!, noHpIbu: e.target.value },
                        })
                      }
                      className="w-full p-1.5 border border-slate-300 rounded font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION F: DATA PENERIMAAN PESERTA DIDIK DI SEKOLAH (SMP NEGERI 2 KASIHAN) */}
          <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-300 space-y-4">
            <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2 border-b border-emerald-300 pb-2">
              <BookOpen className="w-4 h-4 text-emerald-700" />
              <span>F. DATA PENERIMAAN PESERTA DIDIK DI SEKOLAH (SMP NEGERI 2 KASIHAN)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Tanggal Diterima Masuk *</label>
                <input
                  type="date"
                  required
                  value={formData.tanggalDiterima || ''}
                  onChange={(e) => setFormData({ ...formData, tanggalDiterima: e.target.value })}
                  className="w-full p-2 border border-emerald-300 rounded-lg bg-white font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Tahun Masuk / Ajaran *</label>
                <input
                  type="text"
                  required
                  value={formData.tahunMasuk || '2024'}
                  onChange={(e) => setFormData({ ...formData, tahunMasuk: e.target.value })}
                  placeholder="2024 atau 2024/2025"
                  className="w-full p-2 border border-emerald-300 rounded-lg bg-white font-semibold text-emerald-950"
                />
              </div>

              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Diterima di Kelas Awal *</label>
                <select
                  value={formData.diterimaDiKelas || '7A'}
                  onChange={(e) => setFormData({ ...formData, diterimaDiKelas: e.target.value })}
                  className="w-full p-2 border border-emerald-300 rounded-lg bg-white font-bold"
                >
                  <option value="7A">7A</option>
                  <option value="7B">7B</option>
                  <option value="7C">7C</option>
                  <option value="7D">7D</option>
                  <option value="8A">8A</option>
                  <option value="8B">8B</option>
                  <option value="8C">8C</option>
                  <option value="8D">8D</option>
                  <option value="9A">9A</option>
                  <option value="9B">9B</option>
                  <option value="9C">9C</option>
                  <option value="9D">9D</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Kelas Sekarang (Rombel)</label>
                <select
                  value={formData.kelasSekarang || '7A'}
                  onChange={(e) => setFormData({ ...formData, kelasSekarang: e.target.value })}
                  className="w-full p-2 border border-emerald-300 rounded-lg bg-white font-bold text-emerald-900"
                >
                  <option value="7A">7A</option>
                  <option value="7B">7B</option>
                  <option value="7C">7C</option>
                  <option value="7D">7D</option>
                  <option value="8A">8A</option>
                  <option value="8B">8B</option>
                  <option value="8C">8C</option>
                  <option value="8D">8D</option>
                  <option value="9A">9A</option>
                  <option value="9B">9B</option>
                  <option value="9C">9C</option>
                  <option value="9D">9D</option>
                  <option value="Alumni">Alumni</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Jalur Masuk PPDB</label>
                <select
                  value={formData.jalurMasuk || 'Zonasi'}
                  onChange={(e) => setFormData({ ...formData, jalurMasuk: e.target.value as AdmissionTrack })}
                  className="w-full p-2 border border-emerald-300 rounded-lg bg-white font-medium"
                >
                  <option value="Zonasi">Zonasi</option>
                  <option value="Afirmasi">Afirmasi (KMS Bantul / KIP)</option>
                  <option value="Prestasi">Prestasi</option>
                  <option value="Perpindahan Tugas Orang Tua">Perpindahan Tugas Orang Tua</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-emerald-950 block mb-1">Status Peserta Didik</label>
                <select
                  value={formData.status || 'Aktif'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as StudentStatus })}
                  className="w-full p-2 border border-emerald-300 rounded-lg bg-white font-bold text-emerald-900"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Mutasi Masuk">Mutasi Masuk (Pindahan Masuk)</option>
                  <option value="Mutasi Keluar">Mutasi Keluar (Pindah Sekolah)</option>
                  <option value="Lulus">Lulus</option>
                  <option value="Keluar">Keluar / DO</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-emerald-950 block mb-1">Catatan / Status Penerimaan</label>
                <input
                  type="text"
                  value={formData.catatanPenerimaan || ''}
                  onChange={(e) => setFormData({ ...formData, catatanPenerimaan: e.target.value })}
                  placeholder="e.g. Siswa Baru Kelas VII / Pindahan Masuk Dari SMP..."
                  className="w-full p-2 border border-emerald-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Simpan Perubahan' : 'Simpan ke Buku Induk'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
