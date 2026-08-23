import React, { useState, useRef } from 'react';
import {
  School,
  Save,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Cloud,
  RefreshCw,
  Database,
  Server,
  Zap,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff,
  Trash2,
  PlusCircle,
  Layers,
  KeyRound,
  Lock,
  UserCheck,
  Shield,
  GraduationCap,
  Users,
  User,
  Key,
  Edit2,
  Image as ImageIcon,
  UploadCloud,
  X,
  UserPlus,
  ArrowRight,
} from 'lucide-react';
import { SchoolProfile, Student, UserAccount, UserRole } from '../types';
import {
  saveSchoolProfile,
  resetToDefaultData,
  saveStudents,
  cleanDummyStudents,
  isDummyStudent,
  loadUsersList,
  saveUsersList,
  updateUserAccount,
  updateUserPassword,
} from '../utils/storage';
import { generateStudentExcelTemplate, parseExcelStudentFile, ExcelParseResult } from '../utils/excelImporter';
import { ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, DEFAULT_USERS } from '../data/defaultUsers';
import { DEFAULT_LOGO_BANTUL, DEFAULT_LOGO_TUTWURI } from '../utils/defaultLogos';
import { OfficialKopSurat } from './OfficialKopSurat';
import firebaseConfigJson from '../../firebase-applet-config.json';

interface SchoolSettingsViewProps {
  schoolProfile: SchoolProfile;
  setSchoolProfile: (profile: SchoolProfile) => void;
  students: Student[];
  setStudents: (students: Student[]) => void;
  currentUser: UserAccount;
  onUpdateCurrentUser?: (user: UserAccount) => void;
  onOpenLoginModal: () => void;
  isCloudConnected?: boolean;
  isSyncing?: boolean;
  lastSyncTime?: string | null;
  onSyncToCloud?: (customStudents?: Student[]) => void;
  onPullFromCloud?: () => void;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  schoolProfile,
  setSchoolProfile,
  students,
  setStudents,
  currentUser,
  onUpdateCurrentUser,
  onOpenLoginModal,
  isCloudConnected = true,
  isSyncing = false,
  lastSyncTime,
  onSyncToCloud,
  onPullFromCloud,
}) => {
  const [profileForm, setProfileForm] = useState<SchoolProfile>(() => ({
    ...schoolProfile,
    logoBantulUrl: schoolProfile.logoBantulUrl || DEFAULT_LOGO_BANTUL,
    logoTutwuriUrl: schoolProfile.logoTutwuriUrl || DEFAULT_LOGO_TUTWURI,
  }));
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // User Accounts & Role Management State
  const [usersList, setUsersList] = useState<UserAccount[]>(() => loadUsersList());
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});
  const [userActionSuccess, setUserActionSuccess] = useState<string | null>(null);

  // User Edit Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCreatingNewUser, setIsCreatingNewUser] = useState(false);
  const [userModalForm, setUserModalForm] = useState<UserAccount>({
    id: '',
    username: '',
    name: '',
    role: 'petugas_tu',
    roleLabel: 'Petugas TU & Wali Kelas',
    nip: '',
    jabatan: '',
    avatarUrl: '',
    password: '',
    permissions: ROLE_PERMISSIONS['petugas_tu'],
  });

  const logoBantulInputRef = useRef<HTMLInputElement>(null);
  const logoTutwuriInputRef = useRef<HTMLInputElement>(null);

  // Logo upload handlers
  const handleUploadLogoBantul = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar yang valid (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updated = { ...profileForm, logoBantulUrl: dataUrl };
      setProfileForm(updated);
      setSchoolProfile(updated);
      saveSchoolProfile(updated);
      setUserActionSuccess('Logo Kabupaten Bantul berhasil diperbarui!');
      setTimeout(() => setUserActionSuccess(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadLogoTutwuri = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih berkas gambar yang valid (PNG, JPG, SVG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updated = { ...profileForm, logoTutwuriUrl: dataUrl };
      setProfileForm(updated);
      setSchoolProfile(updated);
      saveSchoolProfile(updated);
      setUserActionSuccess('Logo Tut Wuri Handayani / Sekolah berhasil diperbarui!');
      setTimeout(() => setUserActionSuccess(null), 3500);
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogoBantul = () => {
    const updated = { ...profileForm, logoBantulUrl: DEFAULT_LOGO_BANTUL };
    setProfileForm(updated);
    setSchoolProfile(updated);
    saveSchoolProfile(updated);
    setUserActionSuccess('Logo Kabupaten Bantul dikembalikan ke default resmi!');
    setTimeout(() => setUserActionSuccess(null), 3500);
  };

  const handleResetLogoTutwuri = () => {
    const updated = { ...profileForm, logoTutwuriUrl: DEFAULT_LOGO_TUTWURI };
    setProfileForm(updated);
    setSchoolProfile(updated);
    saveSchoolProfile(updated);
    setUserActionSuccess('Logo Tut Wuri Handayani dikembalikan ke default resmi!');
    setTimeout(() => setUserActionSuccess(null), 3500);
  };

  // Toggle password display
  const handleToggleShowPassword = (userId: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Open Edit User Modal
  const handleOpenEditUser = (user: UserAccount) => {
    setIsCreatingNewUser(false);
    setUserModalForm({ ...user });
    setIsUserModalOpen(true);
  };

  // Open Create New User Modal
  const handleOpenCreateUser = () => {
    setIsCreatingNewUser(true);
    const newId = `usr-${Date.now()}`;
    setUserModalForm({
      id: newId,
      username: '',
      name: '',
      role: 'petugas_tu',
      roleLabel: 'Petugas TU & Wali Kelas',
      nip: '',
      jabatan: 'Staff Tata Usaha',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      password: '',
      permissions: ROLE_PERMISSIONS['petugas_tu'],
    });
    setIsUserModalOpen(true);
  };

  // Handle Role change in User Modal
  const handleModalRoleChange = (role: UserRole) => {
    let roleLabel = 'Petugas TU & Wali Kelas';
    if (role === 'admin') roleLabel = 'Administrator IT';
    if (role === 'kepala_sekolah') roleLabel = 'Kepala Sekolah';

    setUserModalForm((prev) => ({
      ...prev,
      role,
      roleLabel,
      permissions: ROLE_PERMISSIONS[role],
    }));
  };

  // Save User Modal Form
  const handleSaveUserModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userModalForm.name.trim() || !userModalForm.username.trim()) {
      alert('Nama pengguna dan Username wajib diisi.');
      return;
    }

    const currentList = loadUsersList();
    let updatedList: UserAccount[];

    if (isCreatingNewUser) {
      // Check username duplicate
      if (currentList.some((u) => u.username.toLowerCase() === userModalForm.username.trim().toLowerCase())) {
        alert('Username sudah digunakan oleh akun lain. Gunakan username berbeda.');
        return;
      }
      const newUser: UserAccount = {
        ...userModalForm,
        name: userModalForm.name.trim(),
        username: userModalForm.username.trim().toLowerCase(),
        password: userModalForm.password || 'smpn2kasihan',
        permissions: ROLE_PERMISSIONS[userModalForm.role],
      };
      updatedList = [...currentList, newUser];
    } else {
      // Check username duplicate excluding self
      if (
        currentList.some(
          (u) =>
            u.id !== userModalForm.id &&
            u.username.toLowerCase() === userModalForm.username.trim().toLowerCase()
        )
      ) {
        alert('Username sudah digunakan oleh akun lain. Gunakan username berbeda.');
        return;
      }
      updatedList = currentList.map((u) =>
        u.id === userModalForm.id
          ? {
              ...u,
              ...userModalForm,
              name: userModalForm.name.trim(),
              username: userModalForm.username.trim().toLowerCase(),
              permissions: ROLE_PERMISSIONS[userModalForm.role],
            }
          : u
      );
    }

    saveUsersList(updatedList);
    setUsersList(updatedList);

    // If current logged-in user was modified, update active session
    if (currentUser.id === userModalForm.id || (isCreatingNewUser && currentUser.username === userModalForm.username)) {
      const activeUpdated = updatedList.find((u) => u.id === userModalForm.id) || updatedList[0];
      if (onUpdateCurrentUser) {
        onUpdateCurrentUser(activeUpdated);
      }
      localStorage.setItem('ebinduk_smpn2kasihan_auth_user_v2', JSON.stringify(activeUpdated));
    }

    setIsUserModalOpen(false);
    setUserActionSuccess(
      isCreatingNewUser
        ? `Akun baru "${userModalForm.name}" berhasil dibuat!`
        : `Data akun "${userModalForm.name}" dan peran berhasil diperbarui!`
    );
    setTimeout(() => setUserActionSuccess(null), 4000);
  };

  // Delete User Account
  const handleDeleteUser = (userId: string) => {
    const target = usersList.find((u) => u.id === userId);
    if (!target) return;

    if (usersList.length <= 1) {
      alert('Sistem harus memiliki minimal 1 akun pengguna.');
      return;
    }

    const adminCount = usersList.filter((u) => u.role === 'admin').length;
    if (target.role === 'admin' && adminCount <= 1) {
      alert('Tidak dapat menghapus satu-satunya akun Administrator.');
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus akun pengguna "${target.name}" (${target.username})?`)) {
      const updatedList = usersList.filter((u) => u.id !== userId);
      saveUsersList(updatedList);
      setUsersList(updatedList);

      if (currentUser.id === userId && onUpdateCurrentUser) {
        onUpdateCurrentUser(updatedList[0]);
      }

      setUserActionSuccess(`Akun "${target.name}" berhasil dihapus.`);
      setTimeout(() => setUserActionSuccess(null), 3500);
    }
  };

  // Excel Import States
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelParsing, setExcelParsing] = useState<boolean>(false);
  const [excelResult, setExcelResult] = useState<ExcelParseResult | null>(null);
  const [excelImportMode, setExcelImportMode] = useState<'append' | 'replace'>('append');
  const [excelImportSuccess, setExcelImportSuccess] = useState<string | null>(null);
  const [excelDragActive, setExcelDragActive] = useState<boolean>(false);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const handleExcelDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setExcelDragActive(true);
    } else if (e.type === 'dragleave') {
      setExcelDragActive(false);
    } else if (e.type === 'drop') {
      setExcelDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleProcessExcelFile(file);
    }
  };

  const handleExcelInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessExcelFile(file);
  };

  const handleProcessExcelFile = async (file: File) => {
    setExcelFile(file);
    setExcelParsing(true);
    setExcelResult(null);
    setExcelImportSuccess(null);

    try {
      const result = await parseExcelStudentFile(file);
      setExcelResult(result);
    } catch (err: any) {
      setExcelResult({
        success: false,
        students: [],
        totalRowsRead: 0,
        errors: [err.message || 'Gagal memproses file Excel.'],
        warnings: [],
      });
    } finally {
      setExcelParsing(false);
    }
  };

  const handleConfirmExcelImport = () => {
    if (!excelResult || !excelResult.success || excelResult.students.length === 0) return;

    let updatedStudents: Student[];

    if (excelImportMode === 'replace') {
      updatedStudents = excelResult.students;
    } else {
      const existingMap = new Map<string, Student>();
      students.forEach((s) => existingMap.set(s.nisn || s.id, s));
      excelResult.students.forEach((s) => existingMap.set(s.nisn || s.id, s));
      updatedStudents = Array.from(existingMap.values());
    }

    setStudents(updatedStudents);
    saveStudents(updatedStudents);

    if (onSyncToCloud) {
      onSyncToCloud(updatedStudents);
    }

    setExcelImportSuccess(
      `Sukses mengimpor ${excelResult.students.length} siswa ke database Buku Induk! Total siswa tersimpan sekarang: ${updatedStudents.length} siswa.`
    );
    setExcelFile(null);
    setExcelResult(null);
    if (excelInputRef.current) excelInputRef.current.value = '';
    setTimeout(() => setExcelImportSuccess(null), 7000);
  };

  const handleClearExcel = () => {
    setExcelFile(null);
    setExcelResult(null);
    if (excelInputRef.current) excelInputRef.current.value = '';
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSchoolProfile(profileForm);
    saveSchoolProfile(profileForm);
    setSaveSuccess(true);
    if (onSyncToCloud) {
      onSyncToCloud();
    }
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      schoolProfile: profileForm,
      students,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `BACKUP_E_BINDUK_SMPN2KASIHAN_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.students && Array.isArray(json.students)) {
          setStudents(json.students);
          saveStudents(json.students);
        }
        if (json.schoolProfile) {
          setSchoolProfile(json.schoolProfile);
          setProfileForm(json.schoolProfile);
          saveSchoolProfile(json.schoolProfile);
        }
        alert('Database Buku Induk berhasil dipulihkan dari file cadangan!');
        setRestoreError(null);
      } catch (err: any) {
        setRestoreError('File JSON tidak valid atau format rusak.');
      }
    };
    reader.readAsText(file);
  };

  // Clean dummy initial students
  const [dummyCleanMessage, setDummyCleanMessage] = useState<string | null>(null);

  const handleCleanDummyData = () => {
    const originalCount = students.length;
    const cleaned = cleanDummyStudents(students);
    const removedCount = originalCount - cleaned.length;

    setStudents(cleaned);
    saveStudents(cleaned);

    if (onSyncToCloud) {
      onSyncToCloud(cleaned);
    }

    if (removedCount > 0) {
      setDummyCleanMessage(`Berhasil menghapus ${removedCount} data dummy bawaan awal. Kini tersimpan ${cleaned.length} siswa asli di database Buku Induk!`);
    } else {
      setDummyCleanMessage(`Database sudah bersih dari data dummy. Seluruh ${cleaned.length} siswa adalah data valid.`);
    }

    setTimeout(() => {
      setDummyCleanMessage(null);
    }, 6000);
  };

  // Reset to Factory Default
  const handleResetData = () => {
    if (
      window.confirm(
        'PERINGATAN TINGKAT TINGGI:\n\nApakah Anda benar-benar yakin ingin mengosongkan / me-reset seluruh database Buku Induk dan mengembalikannya ke data bawaan?'
      )
    ) {
      resetToDefaultData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
            <School className="w-6 h-6 text-emerald-600" />
            <span>Pengaturan & Konfigurasi Sistem E-Binduk</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manajemen identitas sekolah, peran & nama pengguna, upload logo kop surat, dan integrasi cloud database.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan & profil sekolah berhasil disimpan!</span>
          </div>
        )}
      </div>

      {/* Global Success Notification */}
      {userActionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-2.5 font-medium animate-in fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs font-semibold">{userActionSuccess}</div>
        </div>
      )}

      {/* SECTION 1: MANAJEMEN AKUN, PERAN & NAMA PENGGUNA (ADMIN RBAC) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <span>1. Manajemen Akun Pengguna & Hak Akses (Peran / Role)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                Admin Control
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Anda dapat mengubah nama pengguna, peran/hak akses (Admin IT, Petugas TU, Kepala Sekolah), NIP, jabatan, dan kata sandi.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenCreateUser}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Akun Baru</span>
            </button>

            <button
              type="button"
              onClick={onOpenLoginModal}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition flex items-center gap-1.5 shrink-0"
            >
              <KeyRound className="w-4 h-4" />
              <span>Ganti Akun Login</span>
            </button>
          </div>
        </div>

        {/* Active Session Info Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
              alt={currentUser.name}
              className="w-12 h-12 rounded-xl object-cover ring-2 ring-purple-400/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{currentUser.name}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border-purple-300'
                      : currentUser.role === 'petugas_tu'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }`}
                >
                  {currentUser.roleLabel}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Sedang Aktif
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Username: <span className="font-mono font-bold text-slate-700">{currentUser.username}</span> • NIP: {currentUser.nip || '-'} • Jabatan: {currentUser.jabatan}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 text-[11px]">
            <span
              className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                currentUser.permissions.canCreateStudent
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {currentUser.permissions.canCreateStudent ? '✓ Registrasi Siswa' : '✗ Registrasi Siswa'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                currentUser.permissions.canImportExcel
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {currentUser.permissions.canImportExcel ? '✓ Impor Excel' : '✗ Impor Excel'}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                currentUser.permissions.canEditScores
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {currentUser.permissions.canEditScores ? '✓ Edit Nilai Rapor' : '✗ Edit Nilai Rapor'}
            </span>
          </div>
        </div>

        {/* Table of Users */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nama Lengkap & NIP</th>
                <th className="py-3 px-3">Username Login</th>
                <th className="py-3 px-3">Peran / Hak Akses</th>
                <th className="py-3 px-3">Jabatan Resmi</th>
                <th className="py-3 px-3">Kata Sandi</th>
                <th className="py-3 px-4 text-right">Aksi Pengaturan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {usersList.map((usr) => {
                const isPasswordShown = showPasswordMap[usr.id] || false;
                const isCurrent = currentUser.id === usr.id;

                return (
                  <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={usr.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
                          alt={usr.name}
                          className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{usr.name}</span>
                            {isCurrent && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500" title="Akun Anda" />
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">NIP. {usr.nip || '-'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {usr.username}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md border inline-flex items-center gap-1 ${
                          usr.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : usr.role === 'petugas_tu'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {usr.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                        {usr.role === 'petugas_tu' && <FileSpreadsheet className="w-3 h-3" />}
                        {usr.role === 'kepala_sekolah' && <GraduationCap className="w-3 h-3" />}
                        <span>{usr.roleLabel}</span>
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-700 font-medium">
                      {usr.jabatan}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {isPasswordShown ? usr.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleShowPassword(usr.id)}
                          className="text-slate-400 hover:text-slate-600 p-1 rounded"
                          title={isPasswordShown ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                        >
                          {isPasswordShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(usr)}
                          className="px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors inline-flex items-center gap-1"
                          title="Ubah Peran, Nama & Kredensial Pengguna"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Ubah Peran & Nama</span>
                        </button>

                        {usersList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(usr.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Hapus Akun Pengguna"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: UPLOAD LOGO KABUPATEN BANTUL & TUT WURI HANDAYANI (KOP RESMI) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
        <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              <span>2. Upload Logo Resmi Dokumen (Logo Bantul & Logo Tut Wuri / Sekolah)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Kop Surat & Cetak
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Logo akan dicetak secara otomatis di sisi kiri (Pemerintah Kabupaten Bantul) dan sisi kanan (Tut Wuri Handayani / Logo Sekolah) pada Lembar Buku Induk, Leger Nilai, dan Laporan Bulanan.
            </p>
          </div>
        </div>

        {/* Logo Upload Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo 1: Kabupaten Bantul */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Logo Kiri: Pemerintah Kabupaten Bantul</span>
                </span>
                <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  Logo Kiri Kop
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                {/* Logo Image Preview */}
                <div className="w-24 h-24 rounded-xl border border-slate-300 bg-slate-50 p-2 flex items-center justify-center shrink-0 shadow-inner">
                  <img
                    src={profileForm.logoBantulUrl || DEFAULT_LOGO_BANTUL}
                    alt="Logo Kabupaten Bantul"
                    className="w-full h-full object-contain filter drop-shadow-2xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_BANTUL;
                    }}
                  />
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="font-bold text-slate-800 text-xs">Lambang Daerah Kabupaten Bantul</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Mendukung format PNG transparan, JPG, SVG vektor, atau WebP (Disarankan resolusi 200x200 px).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
              <input
                ref={logoBantulInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                onChange={handleUploadLogoBantul}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoBantulInputRef.current?.click()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Logo Bantul</span>
              </button>

              <button
                type="button"
                onClick={handleResetLogoBantul}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Reset ke Default Bantul
              </button>
            </div>
          </div>

          {/* Logo 2: Tut Wuri Handayani / Logo Sekolah */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Logo Kanan: Tut Wuri Handayani / Logo Sekolah</span>
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  Logo Kanan Kop
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                {/* Logo Image Preview */}
                <div className="w-24 h-24 rounded-xl border border-slate-300 bg-slate-50 p-2 flex items-center justify-center shrink-0 shadow-inner">
                  <img
                    src={profileForm.logoTutwuriUrl || DEFAULT_LOGO_TUTWURI}
                    alt="Logo Tut Wuri Handayani"
                    className="w-full h-full object-contain filter drop-shadow-2xs"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_TUTWURI;
                    }}
                  />
                </div>

                <div className="space-y-1.5 text-center sm:text-left flex-1">
                  <div className="font-bold text-slate-800 text-xs">Tut Wuri Handayani / Logo Sekolah</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Mendukung format PNG transparan, JPG, SVG vektor, atau WebP (Disarankan resolusi 200x200 px).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
              <input
                ref={logoTutwuriInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
                onChange={handleUploadLogoTutwuri}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoTutwuriInputRef.current?.click()}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload Logo Tut Wuri</span>
              </button>

              <button
                type="button"
                onClick={handleResetLogoTutwuri}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition"
              >
                Reset ke Default Tut Wuri
              </button>
            </div>
          </div>
        </div>

        {/* Live Preview Kop Surat Resmi */}
        <div className="mt-6 pt-4 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pratinjau Langsung (Live Preview) Kop Surat Dokumen Resmi:</span>
            </span>
            <span className="text-[11px] text-slate-500">Tampilan sesungguhnya saat dicetak</span>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-300 shadow-xs max-w-4xl mx-auto">
            <OfficialKopSurat schoolProfile={profileForm} />
            <div className="text-center font-sans">
              <div className="inline-block bg-slate-100 text-slate-800 font-bold text-[11px] px-3 py-1 rounded border border-slate-200 uppercase tracking-wider">
                LEMBAR BUKU INDUK SISWA / LEGER NILAI / LAPORAN BULANAN
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: PROFIL & LEGALITAS LEMBAGA SEKOLAH */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate-800">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>3. Profil & Legalitas Lembaga Sekolah</span>
          </h3>
          <span className="text-[11px] text-slate-400">Digunakan pada Kop Dokumen & Lembar Induk</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">Nama Resmi Sekolah</label>
            <input
              type="text"
              required
              value={profileForm.namaSekolah}
              onChange={(e) => setProfileForm({ ...profileForm, namaSekolah: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nomor Pokok Sekolah Nasional (NPSN)</label>
            <input
              type="text"
              required
              value={profileForm.npsn}
              onChange={(e) => setProfileForm({ ...profileForm, npsn: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">NSS / Kode Sekolah</label>
            <input
              type="text"
              value={profileForm.nss}
              onChange={(e) => setProfileForm({ ...profileForm, nss: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Peringkat Akreditasi</label>
            <input
              type="text"
              value={profileForm.akreditasi}
              onChange={(e) => setProfileForm({ ...profileForm, akreditasi: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Tahun Ajaran Aktif</label>
            <input
              type="text"
              value={profileForm.tahunAjaranAktif}
              onChange={(e) => setProfileForm({ ...profileForm, tahunAjaranAktif: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-bold text-emerald-800"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">Alamat Jalan Sekolah</label>
            <input
              type="text"
              value={profileForm.alamat}
              onChange={(e) => setProfileForm({ ...profileForm, alamat: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kelurahan / Desa</label>
            <input
              type="text"
              value={profileForm.kelurahan}
              onChange={(e) => setProfileForm({ ...profileForm, kelurahan: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kecamatan</label>
            <input
              type="text"
              value={profileForm.kecamatan}
              onChange={(e) => setProfileForm({ ...profileForm, kecamatan: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kabupaten / Kota</label>
            <input
              type="text"
              value={profileForm.kabupaten}
              onChange={(e) => setProfileForm({ ...profileForm, kabupaten: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Kode Pos</label>
            <input
              type="text"
              value={profileForm.kodePos}
              onChange={(e) => setProfileForm({ ...profileForm, kodePos: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">No. Telepon / Fax</label>
            <input
              type="text"
              value={profileForm.noTelepon || profileForm.telepon}
              onChange={(e) => setProfileForm({ ...profileForm, noTelepon: e.target.value, telepon: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Resmi</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Website Sekolah</label>
            <input
              type="text"
              value={profileForm.website}
              onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white font-mono"
            />
          </div>

          <div className="sm:col-span-3">
            <label className="font-semibold text-slate-700 block mb-1">Motto Sekolah</label>
            <input
              type="text"
              value={profileForm.motto}
              onChange={(e) => setProfileForm({ ...profileForm, motto: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg bg-white italic"
            />
          </div>
        </div>

        {/* Pejabat Penandatangan */}
        <div className="border-t border-slate-200 pt-4">
          <h4 className="font-bold text-slate-900 text-xs mb-3 uppercase tracking-wider text-emerald-800">
            Pejabat Pengesah & Penandatangan Lembar Buku Induk
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block">KEPALA SEKOLAH</span>
              <div>
                <label className="text-slate-500 block mb-0.5">Nama & Gelar Kepala Sekolah</label>
                <input
                  type="text"
                  value={profileForm.kepalaSekolah}
                  onChange={(e) => setProfileForm({ ...profileForm, kepalaSekolah: e.target.value })}
                  className="w-full p-1.5 border border-slate-300 rounded bg-white font-semibold"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-0.5">NIP Kepala Sekolah</label>
                <input
                  type="text"
                  value={profileForm.nipKepalaSekolah}
                  onChange={(e) => setProfileForm({ ...profileForm, nipKepalaSekolah: e.target.value })}
                  className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block">PENGELOLA BUKU INDUK / KEPALA TU</span>
              <div>
                <label className="text-slate-500 block mb-0.5">Nama & Gelar Pengelola TU</label>
                <input
                  type="text"
                  value={profileForm.pengelolaBukuInduk}
                  onChange={(e) => setProfileForm({ ...profileForm, pengelolaBukuInduk: e.target.value })}
                  className="w-full p-1.5 border border-slate-300 rounded bg-white font-semibold"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-0.5">NIP Pengelola</label>
                <input
                  type="text"
                  value={profileForm.nipPengelolaBukuInduk}
                  onChange={(e) => setProfileForm({ ...profileForm, nipPengelolaBukuInduk: e.target.value })}
                  className="w-full p-1.5 border border-slate-300 rounded bg-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </form>

      {/* SECTION 4: FIREBASE CLOUD DATABASE STATUS PANEL */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>4. Database Cloud Firebase Firestore</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isSyncing
                      ? 'bg-amber-100 text-amber-800'
                      : isCloudConnected
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isSyncing ? 'Menyinkronkan...' : isCloudConnected ? 'Terhubung & Aktif' : 'Offline'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Penyimpanan cloud terpusat di region <strong>asia-southeast1</strong> (Jakarta/Singapura) berkecepatan tinggi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onPullFromCloud && (
              <button
                type="button"
                onClick={onPullFromCloud}
                disabled={isSyncing}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border border-slate-300 disabled:opacity-50"
                title="Tarik pembaruan data terbaru dari Firestore"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Tarik dari Cloud</span>
              </button>
            )}

            {onSyncToCloud && (
              <button
                type="button"
                onClick={() => onSyncToCloud()}
                disabled={isSyncing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Unggah ke Cloud Sekarang</span>
              </button>
            )}
          </div>
        </div>

        {/* Database Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium block text-[11px]">Firebase Project ID</span>
            <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block truncate">
              {firebaseConfigJson.projectId}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium block text-[11px]">Firestore Database ID</span>
            <span className="font-mono font-bold text-slate-800 text-xs mt-0.5 block truncate" title={firebaseConfigJson.firestoreDatabaseId}>
              {firebaseConfigJson.firestoreDatabaseId || '(default)'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium block text-[11px]">Koleksi Utama (Collections)</span>
            <span className="font-semibold text-slate-800 text-xs mt-0.5 block">
              `students` & `schoolProfile`
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500 font-medium block text-[11px]">Sinkronisasi Terakhir</span>
            <span className="font-semibold text-emerald-700 text-xs mt-0.5 block">
              {lastSyncTime ? `${lastSyncTime} WIB` : 'Otomatis Real-time'}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 5: IMPOR DATA SISWA DARI EXCEL (SheetJS) */}
      <div id="impor-excel-section" className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5 text-xs text-slate-800">
        <div className="border-b border-slate-200 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>5. Impor Data Siswa dari Berkas Excel (.xlsx / .xls)</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                SheetJS Engine
              </span>
            </h3>
            <p className="text-slate-500 text-xs mt-0.5">
              Unggah file spreadsheet Excel (.xlsx, .xls) untuk memasukkan ratusan data siswa secara otomatis ke database Buku Induk dan sinkronisasi ke Firebase Firestore.
            </p>
          </div>

          <button
            type="button"
            onClick={generateStudentExcelTemplate}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-300 rounded-lg transition-all flex items-center gap-1.5 shrink-0 shadow-xs self-start sm:self-auto active:scale-95"
            title="Unduh format spreadsheet resmi Buku Induk SMPN 2 Kasihan"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Unduh Template Excel (.xlsx)</span>
          </button>
        </div>

        {/* Success Alert */}
        {excelImportSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-2.5 font-medium animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{excelImportSuccess}</div>
          </div>
        )}

        {/* Upload Dropzone */}
        <div
          onDragEnter={handleExcelDrop}
          onDragOver={handleExcelDrop}
          onDrop={handleExcelDrop}
          onClick={() => excelInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all ${
            excelDragActive
              ? 'border-emerald-500 bg-emerald-50/80 scale-[0.99]'
              : 'border-slate-300 bg-slate-50/60 hover:bg-emerald-50/40 hover:border-emerald-400'
          }`}
        >
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleExcelInputChange}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 border border-emerald-200 shadow-inner">
            {excelParsing ? (
              <RefreshCw className="w-6 h-6 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-6 h-6" />
            )}
          </div>

          <div className="font-bold text-slate-800 text-sm">
            {excelFile ? excelFile.name : 'Klik untuk Memilih File Excel (.xlsx / .xls) atau Tarik ke Sini'}
          </div>
          <p className="text-slate-500 text-xs mt-1">
            {excelFile
              ? `${(excelFile.size / 1024).toFixed(1)} KB • Klik untuk mengganti berkas`
              : 'Mendukung format Microsoft Excel (.xlsx, .xls) dan CSV berstandar Buku Induk Siswa'}
          </p>
        </div>

        {/* Parsing Errors & Warnings */}
        {excelResult?.errors && excelResult.errors.length > 0 && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1 text-red-700">
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>Kesalahan saat Membaca Berkas Excel:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5">
              {excelResult.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Parsed Result Preview */}
        {excelResult?.success && excelResult.students.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    {excelResult.students.length} Data Siswa Berhasil Di-parsing dari Excel
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Total baris dibaca: {excelResult.totalRowsRead} baris spreadsheet
                  </p>
                </div>
              </div>

              {/* Import Mode Selector */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold text-slate-600">Mode Impor:</label>
                <div className="flex bg-white rounded-lg border border-slate-300 p-0.5 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setExcelImportMode('append')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      excelImportMode === 'append'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tambahkan ({students.length} + {excelResult.students.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setExcelImportMode('replace')}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      excelImportMode === 'replace'
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Gantikan Semua ({excelResult.students.length})
                  </button>
                </div>
              </div>
            </div>

            {/* Confirmation Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleClearExcel}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Batal / Bersihkan</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmExcelImport}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                <span>
                  Konfirmasi & Masukkan {excelResult.students.length} Siswa ke Database
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: CADANGAN & PEMULIHAN (BACKUP / RESTORE) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-600" />
          <span>6. Cadangan & Pemulihan Data Buku Induk (Backup / Restore)</span>
        </h3>
        <p className="text-xs text-slate-500">
          Amankan seluruh catatan arsip Buku Induk siswa ({students.length} data siswa) ke dalam berkas JSON mandiri.
        </p>

        {restoreError && <p className="text-xs text-red-600 font-semibold">{restoreError}</p>}

        {dummyCleanMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{dummyCleanMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Download Backup */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-emerald-950 text-xs">Unduh Backup JSON</h4>
              <p className="text-[11px] text-emerald-800 mt-1">
                Simpan file salinan lengkap seluruh data siswa dan rapor ke komputer Anda.
              </p>
            </div>
            <button
              onClick={handleExportBackup}
              className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Cadangan ({students.length})</span>
            </button>
          </div>

          {/* Restore Backup */}
          <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-blue-950 text-xs">Pulihkan dari File Backup</h4>
              <p className="text-[11px] text-blue-800 mt-1">
                Unggah file JSON backup yang pernah Anda unduh sebelumnya.
              </p>
            </div>
            <label className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Pilih File JSON</span>
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>
          </div>

          {/* Clean Dummy Initial Records */}
          <div className="p-4 bg-amber-50/70 rounded-xl border border-amber-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1">
                <h4 className="font-bold text-amber-950 text-xs">Hapus Data Dummy Bawaan</h4>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                  Pembersihan
                </span>
              </div>
              <p className="text-[11px] text-amber-800 mt-1">
                Hapus 10 siswa sampel default aplikasi, pertahankan 384 siswa asli hasil impor Excel.
              </p>
            </div>
            <button
              onClick={handleCleanDummyData}
              className="mt-4 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bersihkan Data Dummy</span>
            </button>
          </div>

          {/* Reset Factory */}
          <div className="p-4 bg-red-50/60 rounded-xl border border-red-200 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-red-950 text-xs">Kosongkan / Reset Database</h4>
              <p className="text-[11px] text-red-800 mt-1">
                Kosongkan seluruh data cache dan mulai ulang registrasi data buku induk.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="mt-4 w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Database</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= USER EDIT / CREATE MODAL ================= */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
                  {isCreatingNewUser ? <UserPlus className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {isCreatingNewUser ? 'Tambah Akun Pengguna Baru' : 'Ubah Nama, Peran & Kredensial Pengguna'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sistem Kontrol Hak Akses (RBAC) E-Binduk SMPN 2 Kasihan
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveUserModal} className="p-6 space-y-4 text-xs">
              {/* Nama Pengguna */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Nama Lengkap / Nama Pengguna <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={userModalForm.name}
                  onChange={(e) => setUserModalForm({ ...userModalForm, name: e.target.value })}
                  placeholder="Contoh: Rofi'ul Anwar, S.Pd. atau Drs. H. Sugiyanto, M.Pd."
                  className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                />
              </div>

              {/* Peran / Hak Akses (Role) */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Pilih Peran & Hak Akses (Role) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleModalRoleChange('admin')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      userModalForm.role === 'admin'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-500/20 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Admin IT</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Super Admin</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModalRoleChange('petugas_tu')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      userModalForm.role === 'petugas_tu'
                        ? 'border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-500/20 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Petugas TU</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">TU & Wali Kelas</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleModalRoleChange('kepala_sekolah')}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      userModalForm.role === 'kepala_sekolah'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 ring-2 ring-amber-500/20 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Kepala Sekolah</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-normal mt-0.5">Supervisor</div>
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 mt-1.5 italic">
                  {ROLE_DESCRIPTIONS[userModalForm.role]}
                </p>
              </div>

              {/* Username Login */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Username Login <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userModalForm.username}
                    onChange={(e) => setUserModalForm({ ...userModalForm, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    placeholder="Contoh: tu_kasihan"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">
                    Kata Sandi (Password) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userModalForm.password}
                    onChange={(e) => setUserModalForm({ ...userModalForm, password: e.target.value })}
                    placeholder="Ketik kata sandi"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                </div>
              </div>

              {/* NIP & Jabatan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Nomor Induk Pegawai (NIP)</label>
                  <input
                    type="text"
                    value={userModalForm.nip || ''}
                    onChange={(e) => setUserModalForm({ ...userModalForm, nip: e.target.value })}
                    placeholder="19850420 201001 1 015"
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Jabatan Resmi</label>
                  <input
                    type="text"
                    value={userModalForm.jabatan}
                    onChange={(e) => setUserModalForm({ ...userModalForm, jabatan: e.target.value })}
                    placeholder="Staff Tata Usaha & Kesiswaan"
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-md shadow-purple-600/20 transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>{isCreatingNewUser ? 'Buat Akun Pengguna' : 'Simpan Perubahan Akun'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
