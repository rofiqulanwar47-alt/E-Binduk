import React, { useState } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  School,
  Building2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { SchoolProfile, UserAccount } from '../types';
import { authenticateUser } from '../utils/storage';

interface LoginPageProps {
  schoolProfile: SchoolProfile;
  onLoginSuccess: (user: UserAccount) => void;
}

export function LoginPage({ schoolProfile, onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(username.trim(), password);
      if (result.success && result.user) {
        setSuccessMessage(`Autentikasi berhasil! Selamat datang, ${result.user.name}`);
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 500);
      } else {
        setErrorMessage(
          result.error || 'Username atau kata sandi tidak valid. Silakan periksa kembali kredensial Anda.'
        );
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      {/* Background Decorative Gradients & Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/25 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Subtle Header Bar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/30 border border-blue-400/40">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold tracking-tight text-white text-sm sm:text-base flex items-center gap-2">
              <span>{schoolProfile.namaSekolah}</span>
              <span className="hidden sm:inline-flex bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                E-Binduk Resmi
              </span>
            </div>
            <div className="text-slate-400 text-xs truncate">
              NPSN: <span className="font-mono text-slate-300">{schoolProfile.npsn}</span> • Akreditasi:{' '}
              <span className="text-emerald-400 font-semibold">{schoolProfile.akreditasi}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Sistem Terproteksi</span>
          </span>
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1.5 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>Bantuan</span>
          </button>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <div className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/60 relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

            {/* School Crest / Branding Header inside Card */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-600/30 border border-blue-400/30 mb-3.5">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Buku Induk Siswa
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 font-medium">
                {schoolProfile.namaSekolah}
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-[11px] text-slate-300">
                <Building2 className="w-3 h-3 text-blue-400" />
                <span>Tahun Ajaran {schoolProfile.tahunAjaranAktif}</span>
              </div>
            </div>

            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="mb-5 p-3.5 bg-rose-950/70 border border-rose-500/50 rounded-2xl text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Success Notification Alert */}
            {successMessage && (
              <div className="mb-5 p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-2xl text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-bold">{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold text-xs mb-1.5">
                  Nama Pengguna (Username / NIP)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username akun"
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-500 font-medium"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-300 font-semibold text-xs">
                    Kata Sandi (Password)
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi akun"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-500 font-medium"
                  />
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-400 hover:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span>Ingat sesi di perangkat ini</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 active:scale-[0.99] text-white font-bold rounded-2xl text-sm transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </div>
                  ) : (
                    <>
                      <span>Masuk ke Buku Induk</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-slate-400 text-xs">
              <span className="inline-flex items-center gap-1.5 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Akses terproteksi wewenang dan hak akses resmi sekolah</span>
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                <span>Bantuan Masuk Buku Induk Siswa</span>
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <p>
                Aplikasi <strong>Buku Induk Siswa SMP Negeri 2 Kasihan</strong> dapat diakses oleh civitas akademika berwenang:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-400 pl-1">
                <li><strong className="text-slate-200">Administrator IT</strong>: Pengelolaan sistem & database.</li>
                <li><strong className="text-slate-200">Petugas TU & Wali Kelas</strong>: Pengelolaan data siswa, presensi, dan nilai rapor.</li>
                <li><strong className="text-slate-200">Kepala Sekolah</strong>: Supervisi, validasi, dan laporan resmi.</li>
              </ul>
              <p className="text-slate-400 pt-1">
                Jika Anda lupa username atau kata sandi, silakan hubungi Administrator IT atau Pengelola Buku Induk SMP Negeri 2 Kasihan.
              </p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Institutional Footer */}
      <footer className="relative z-10 py-4 px-6 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-400">
        <p className="font-medium text-slate-300">
          © {new Date().getFullYear()} {schoolProfile.namaSekolah}. Dibuat oleh Rofiqul Anwar.
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          {schoolProfile.alamat}, {schoolProfile.kelurahan}, {schoolProfile.kecamatan}, {schoolProfile.kabupaten}, {schoolProfile.provinsi} {schoolProfile.kodePos} • Telp: {schoolProfile.noTelepon || schoolProfile.telepon || '-'}
        </p>
      </footer>
    </div>
  );
}
