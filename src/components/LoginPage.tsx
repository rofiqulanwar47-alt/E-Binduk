import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  School,
  ArrowRight,
  Sparkles,
  Info,
  Key,
} from 'lucide-react';
import { SchoolProfile, UserAccount } from '../types';
import { authenticateUser, loadUsersList } from '../utils/storage';
import { ROLE_DESCRIPTIONS } from '../data/defaultUsers';

interface LoginPageProps {
  schoolProfile: SchoolProfile;
  onLoginSuccess: (user: UserAccount) => void;
}

export function LoginPage({ schoolProfile, onLoginSuccess }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);

  useEffect(() => {
    setUsersList(loadUsersList());
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(username, password);
      if (result.success && result.user) {
        setSuccessMessage(`Login berhasil! Selamat datang, ${result.user.name}`);
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 600);
      } else {
        setErrorMessage(result.error || 'Autentikasi gagal. Silakan periksa kembali username dan kata sandi Anda.');
        setIsLoading(false);
      }
    }, 350);
  };

  const handleSelectQuickUser = (u: UserAccount) => {
    setUsername(u.username);
    setPassword(u.password || 'admin123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden font-sans">
      {/* Background Decor Elements */}
      <div className="absolute inset-0 bg-radial from-blue-900/30 via-slate-900/90 to-slate-950 pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-600/30 border border-blue-400/30">
            B
          </div>
          <div>
            <div className="font-extrabold tracking-tight text-white text-sm sm:text-base flex items-center gap-2">
              <span>E-BINDUK</span>
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                Sistem Buku Induk Resmi
              </span>
            </div>
            <div className="text-slate-400 text-xs truncate">
              {schoolProfile.namaSekolah || 'SMP Negeri 2 Kasihan'} • NPSN: {schoolProfile.npsn || '20400344'}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Otentikasi Terproteksi RBAC</span>
          </span>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left / Main Card: Login Form */}
          <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Masuk ke Buku Induk</h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Silakan masukkan username dan kata sandi akun Anda
                  </p>
                </div>
              </div>

              {/* Error Alert Box */}
              {errorMessage && (
                <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}

              {/* Success Alert Box */}
              {successMessage && (
                <div className="mb-5 p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-semibold">{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-semibold text-xs mb-1.5">
                    Username / Nama Akun
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Masukkan username (contoh: admin / petugastu)"
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-500 font-mono"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
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
                      placeholder="Masukkan kata sandi"
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-500"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-1 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Memverifikasi Akun...</span>
                      </div>
                    ) : (
                      <>
                        <span>Masuk ke Sistem E-Binduk</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700/60 text-center text-slate-400 text-xs flex items-center justify-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Akses dibatasi sesuai wewenang dan hak akses resmi sekolah.</span>
            </div>
          </div>

          {/* Right Card: Quick Accounts Helper & School Info */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* Quick Fill Card */}
            <div className="bg-slate-800/80 border border-slate-700/80 backdrop-blur-md rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>3 Akun Resmi Terdaftar</span>
                </h3>
                <span className="text-[10px] text-slate-400">Klik untuk isi cepat:</span>
              </div>

              <div className="space-y-2">
                {usersList.map((usr) => {
                  const isSelected = username === usr.username;
                  const roleDesc = ROLE_DESCRIPTIONS[usr.role];

                  return (
                    <div
                      key={usr.id}
                      onClick={() => handleSelectQuickUser(usr)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500/80 ring-1 ring-blue-400/40'
                          : 'bg-slate-900/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-900/90'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={usr.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={usr.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-600 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-white truncate">{usr.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{usr.roleLabel}</div>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold ${
                            isSelected
                              ? 'bg-blue-500 text-white border-blue-400'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {usr.username}
                        </span>
                      </div>
                      
                      <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Kata sandi:</span>
                        <span className="font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/50">
                          {usr.password || '••••••••'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* School Profile Summary Card */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-xs space-y-2 text-slate-300">
              <div className="flex items-center gap-2 font-bold text-white text-xs">
                <School className="w-4 h-4 text-blue-400" />
                <span>{schoolProfile.namaSekolah || 'SMP Negeri 2 Kasihan'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {schoolProfile.alamat || 'Jalan Bantul Km 6,5 Nyemengan, Tirtonirmolo, Kasihan, Bantul, D.I. Yogyakarta 55181'}
              </p>
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                <span>Tahun Ajaran: {schoolProfile.tahunAjaranAktif || '2024/2025'}</span>
                <span>Akreditasi: {schoolProfile.akreditasi || 'A (Unggul)'}</span>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 px-6 border-t border-slate-800/80 bg-slate-950/60 text-center text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} {schoolProfile.namaSekolah || 'SMP Negeri 2 Kasihan'}. Seluruh Hak Cipta Dilindungi.
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5">
          Sistem Informasi Buku Induk Siswa Elektronik Terstandarisasi Permendikbud RI
        </p>
      </footer>
    </div>
  );
}
