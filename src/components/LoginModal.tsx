import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  User,
  GraduationCap,
  FileSpreadsheet,
  KeyRound,
  Lock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Info,
  Eye,
  EyeOff,
  UserCheck,
  Key,
} from 'lucide-react';
import { UserAccount, UserRole } from '../types';
import { ROLE_DESCRIPTIONS, ROLE_PERMISSIONS } from '../data/defaultUsers';
import { loadUsersList, saveCurrentUser, authenticateUser } from '../utils/storage';

interface LoginModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onSelectUser: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen = true,
  onClose,
  currentUser,
  onSelectUser,
}) => {
  const [activeTab, setActiveTab] = useState<'switch_role' | 'manual_login' | 'rules_matrix'>('switch_role');
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);

  useEffect(() => {
    if (isOpen) {
      setUsersList(loadUsersList());
      setLoginError(null);
      setLoginSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginSuccess(null);

    const result = authenticateUser(usernameInput, passwordInput);
    if (!result.success || !result.user) {
      setLoginError(result.error || 'Username atau kata sandi tidak sesuai.');
      return;
    }

    const foundUser = result.user;
    onSelectUser(foundUser);
    setLoginSuccess(`Berhasil masuk sebagai ${foundUser.name} (${foundUser.roleLabel})`);
    setTimeout(() => {
      setLoginSuccess(null);
      onClose();
    }, 800);
  };

  const handleQuickSwitch = (user: UserAccount) => {
    onSelectUser(user);
    setLoginSuccess(`Hak akses berhasil dialihkan ke: ${user.name} (${user.roleLabel})`);
    setTimeout(() => {
      setLoginSuccess(null);
      onClose();
    }, 600);
  };

  const handleAutofill = (user: UserAccount) => {
    setUsernameInput(user.username);
    setPasswordInput(user.password || '');
    setActiveTab('manual_login');
    setLoginError(null);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-5 h-5 text-purple-600" />;
      case 'petugas_tu':
        return <FileSpreadsheet className="w-5 h-5 text-blue-600" />;
      case 'kepala_sekolah':
        return <GraduationCap className="w-5 h-5 text-amber-600" />;
      default:
        return <User className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight">Otentikasi & Manajemen Pengguna E-Binduk</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  3 Akun Resmi
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                SMP Negeri 2 Kasihan • Sistem Manajemen Buku Induk Siswa Digital
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Current Active User Status Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/40"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : currentUser.role === 'petugas_tu'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {currentUser.roleLabel}
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">
                NIP: {currentUser.nip || '-'} • {currentUser.jabatan}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('switch_role')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                activeTab === 'switch_role'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Pilih Pengguna
            </button>
            <button
              onClick={() => setActiveTab('manual_login')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors ${
                activeTab === 'manual_login'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Login Username & Password
            </button>
            <button
              onClick={() => setActiveTab('rules_matrix')}
              className={`px-3 py-1.5 rounded-md font-semibold text-xs transition-colors flex items-center gap-1 ${
                activeTab === 'rules_matrix'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Matriks Hak Akses</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs text-slate-700">
          {/* Notification Alerts */}
          {loginSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{loginSuccess}</span>
            </div>
          )}

          {loginError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* TAB 1: SWITCH ROLE (1-CLICK SELECTION) */}
          {activeTab === 'switch_role' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">3 Akun Pengguna Resmi SMPN 2 Kasihan</h4>
                  <p className="text-slate-500 text-xs">
                    Pilih akun pengguna di bawah ini untuk beralih peran atau melihat kredensial login:
                  </p>
                </div>
                <span className="text-[11px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-md border border-slate-200">
                  3 Akun Terdaftar
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {usersList.map((user) => {
                  const isCurrent = user.id === currentUser.id;
                  const roleDesc = ROLE_DESCRIPTIONS[user.role];

                  return (
                    <div
                      key={user.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-50/70 shadow-xs ring-1 ring-blue-400'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <img
                            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                            alt={user.name}
                            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="font-bold text-slate-900 text-xs truncate">{user.name}</h5>
                              {isCurrent && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shrink-0">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 truncate">{user.jabatan}</p>
                            <span
                              className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${roleDesc.badgeBg} ${roleDesc.badgeColor} ${roleDesc.badgeBorder}`}
                            >
                              {user.roleLabel}
                            </span>
                          </div>
                        </div>

                        {/* Username & Password Card Info */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-1 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Username:</span>
                            <span className="font-mono font-bold text-slate-800">{user.username}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">Password:</span>
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              {user.password || '••••••••'}
                            </span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {roleDesc.summary}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQuickSwitch(user)}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                        >
                          <span>Gunakan Akun</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAutofill(user)}
                          title="Isi form login dengan kredensial akun ini"
                          className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs transition flex items-center justify-center"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL LOGIN FORM */}
          {activeTab === 'manual_login' && (
            <div className="max-w-md mx-auto space-y-4 py-2">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto border border-blue-200 shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">Masuk dengan Username & Kata Sandi</h4>
                <p className="text-slate-500 text-xs">
                  Gunakan kredensial resmi dari salah satu 3 akun pengguna sekolah.
                </p>
              </div>

              <form onSubmit={handleManualLogin} className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Username / Alamat Email
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="admin / petugas.tu / kepala.sekolah"
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden font-mono"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold text-xs mb-1">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Masukkan kata sandi"
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Quick Autofill Badges */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-500 block mb-1">Pilih cepat akun untuk mengisi otomatis:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {usersList.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleAutofill(u)}
                        className="p-1.5 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-left transition-colors"
                      >
                        <div className="font-bold text-[10px] text-slate-800 truncate">{u.role === 'admin' ? 'Admin' : u.role === 'petugas_tu' ? 'Petugas TU' : 'Kepsek'}</div>
                        <div className="font-mono text-[9px] text-slate-500 truncate">{u.username}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-xs mt-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Verifikasi & Masuk ke Sistem</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: MATRIKS ATURAN & HAK AKSES (RBAC) */}
          {activeTab === 'rules_matrix' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Matriks Hak Akses 3 Peran Pengguna E-Binduk</span>
                </h4>
                <p className="text-slate-500 text-xs">
                  Hak akses Petugas TU dan Wali Kelas telah digabung untuk memudahkan pengelolaan data pokok dan nilai akademik siswa secara terpadu di SMP Negeri 2 Kasihan:
                </p>
              </div>

              {/* Matrix Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Modul & Fitur Sistem</th>
                      <th className="py-2.5 px-3 text-center text-purple-700">1. Admin IT</th>
                      <th className="py-2.5 px-3 text-center text-blue-700">2. Petugas TU & Wali Kelas</th>
                      <th className="py-2.5 px-3 text-center text-amber-700">3. Kepala Sekolah</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {[
                      { label: 'Lihat Data Siswa & Detail Lengkap', pKey: 'canViewStudents' },
                      { label: 'Pendaftaran Siswa Baru (Formulir)', pKey: 'canCreateStudent' },
                      { label: 'Ubah Data Biodata & Orang Tua', pKey: 'canEditStudent' },
                      { label: 'Hapus Data Siswa dari Buku Induk', pKey: 'canDeleteStudent' },
                      { label: 'Impor Data Massal Excel (SheetJS)', pKey: 'canImportExcel' },
                      { label: 'Ekspor Data CSV & Spreadsheet', pKey: 'canExportData' },
                      { label: 'Cetak Lembar Buku Induk (Bag. 1 & 2)', pKey: 'canPrintBukuInduk' },
                      { label: 'Cetak Kartu Tanda Pelajar (KTP-S)', pKey: 'canPrintStudentCard' },
                      { label: 'Input & Edit Rekap Nilai Rapor (Leger)', pKey: 'canEditScores' },
                      { label: 'Catatan Perkembangan & Sikap Siswa', pKey: 'canEditCounseling' },
                      { label: 'Konsultasi AI Asisten Siswa', pKey: 'canAccessAiAssistant' },
                      { label: 'Ubah Profil Legal & Pejabat Sekolah', pKey: 'canEditSchoolProfile' },
                      { label: 'Sinkronisasi Cloud Firebase Firestore', pKey: 'canSyncCloud' },
                      { label: 'Backup & Reset Total Database', pKey: 'canResetDatabase' },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-800">{row.label}</td>
                        {(['admin', 'petugas_tu', 'kepala_sekolah'] as UserRole[]).map((r) => {
                          const permitted = (ROLE_PERMISSIONS[r] as any)[row.pKey];
                          return (
                            <td key={r} className="py-2 px-3 text-center">
                              {permitted ? (
                                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Diizinkan</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-slate-400 text-[11px] bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                                  <XCircle className="w-3.5 h-3.5 text-slate-300" />
                                  <span>Dibatasi</span>
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Roles Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {Object.values(ROLE_DESCRIPTIONS).map((rd) => (
                  <div
                    key={rd.role}
                    className={`p-3.5 rounded-xl border ${rd.badgeBg} ${rd.badgeBorder} space-y-2`}
                  >
                    <div className="flex items-center gap-2">
                      {getRoleIcon(rd.role)}
                      <h5 className={`font-bold text-xs ${rd.badgeColor}`}>{rd.title}</h5>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{rd.summary}</p>
                    <div className="pt-1 border-t border-slate-200/60">
                      <div className="text-[10px] font-bold text-slate-700 mb-0.5">Tanggung Jawab Utama:</div>
                      <ul className="list-disc list-inside text-[10px] text-slate-600 space-y-0.5">
                        {rd.responsibilities.slice(0, 3).map((resp, ri) => (
                          <li key={ri}>{resp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
          <div className="text-slate-500 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Hak akses diterapkan secara otomatis pada formulir dan basis data.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
