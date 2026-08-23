import React, { useState, useEffect } from 'react';
import { X, UserCheck, Key, Shield, Mail, CreditCard, Image, Save, AlertCircle } from 'lucide-react';
import { UserAccount, UserRole } from '../types';

interface UserAccountModalProps {
  isOpen: boolean;
  user: UserAccount | null;
  onClose: () => void;
  onSave: (updatedUser: UserAccount) => void;
  existingUsers: UserAccount[];
}

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
  existingUsers,
}) => {
  const [form, setForm] = useState<UserAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setForm({ ...user });
      setError(null);
    }
  }, [user]);

  if (!isOpen || !form) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Nama pengguna/pegawai tidak boleh kosong.');
      return;
    }
    if (!form.username.trim()) {
      setError('Username login tidak boleh kosong.');
      return;
    }
    if (form.username.length < 3) {
      setError('Username minimal 3 karakter.');
      return;
    }

    // Check if username is taken by another user
    const usernameTaken = existingUsers.some(
      (u) => u.id !== form.id && u.username.toLowerCase() === form.username.trim().toLowerCase()
    );
    if (usernameTaken) {
      setError(`Username "${form.username}" sudah digunakan oleh akun lain. Gunakan username berbeda.`);
      return;
    }

    if (form.password && form.password.length < 4) {
      setError('Kata sandi minimal 4 karakter.');
      return;
    }

    onSave({
      ...form,
      name: form.name.trim(),
      username: form.username.trim(),
      nip: form.nip?.trim() || '',
      jabatan: form.jabatan?.trim() || '',
      email: form.email?.trim() || '',
      password: form.password?.trim() || 'smpn2kasihan',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Edit Identitas & Akun Login Pengguna</h3>
              <p className="text-[11px] text-slate-300">
                Peran: <strong className="text-white">{form.roleLabel}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nama Lengkap */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nama Lengkap & Gelar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Dra. Hj. Sri Wahyuni, M.Pd."
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium text-slate-900"
              required
            />
            <p className="text-[10px] text-slate-500 mt-0.5">
              Nama ini akan ditampilkan pada sistem buku induk, lembar tanda tangan, dan header profil.
            </p>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Username Login <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="admin / tu.kasihan"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono font-bold text-blue-900 bg-slate-50"
                required
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Username unik untuk masuk.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kata Sandi (Password) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.password || ''}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Ketik kata sandi"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-slate-900 bg-slate-50"
                required
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Kata sandi masuk ke aplikasi.</p>
            </div>
          </div>

          {/* NIP & Jabatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                NIP / No. Identitas Pegawai
              </label>
              <input
                type="text"
                value={form.nip || ''}
                onChange={(e) => setForm({ ...form, nip: e.target.value })}
                placeholder="19800512 200801 1 012"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jabatan / Tugas Tambahan
              </label>
              <input
                type="text"
                value={form.jabatan || ''}
                onChange={(e) => setForm({ ...form, jabatan: e.target.value })}
                placeholder="Kepala Tata Usaha / Admin IT"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Email Resmi / Belajar.id
            </label>
            <div className="relative">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="nama@guru.smp.belajar.id"
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              />
            </div>
          </div>

          {/* Foto Avatar URL */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              URL Foto Profil / Avatar
            </label>
            <div className="flex items-center gap-3">
              <img
                src={form.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                alt={form.name}
                className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
              />
              <input
                type="url"
                value={form.avatarUrl || ''}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Identitas Akun</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
