import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Printer,
  CreditCard,
  FileSpreadsheet,
  Sparkles,
  Settings,
  Download,
  Search,
  Menu,
  X,
  ShieldCheck,
  RefreshCw,
  KeyRound,
  Lock,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { ActiveTab, SchoolProfile, Student, UserAccount } from '../types';
import { exportStudentsToCsv } from '../utils/formatters';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  schoolProfile: SchoolProfile;
  students: Student[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currentUser: UserAccount;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  isCloudConnected?: boolean;
  isSyncing?: boolean;
  lastSyncTime?: string | null;
  onOpenNewStudent: () => void;
  onOpenAiChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  schoolProfile,
  students,
  searchQuery,
  setSearchQuery,
  currentUser,
  onOpenLoginModal,
  onLogout,
  isCloudConnected = true,
  isSyncing = false,
  lastSyncTime,
  onOpenNewStudent,
  onOpenAiChat,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeCount = students.filter((s) => s.status === 'Aktif').length;

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/30';
      case 'petugas_tu':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'kepala_sekolah':
        return 'bg-amber-500/20 text-amber-300 border-amber-400/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const baseNavItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      allowed: true,
    },
    {
      id: 'buku-induk' as ActiveTab,
      label: 'Data Siswa',
      badge: activeCount,
      icon: Users,
      allowed: currentUser.permissions.canViewStudents,
    },
    {
      id: 'cetak-lembar' as ActiveTab,
      label: 'Cetak Lembar Induk',
      icon: Printer,
      allowed: currentUser.permissions.canPrintBukuInduk,
    },
    {
      id: 'kartu-pelajar' as ActiveTab,
      label: 'Kartu Pelajar',
      icon: CreditCard,
      allowed: currentUser.permissions.canPrintStudentCard,
    },
    {
      id: 'leger' as ActiveTab,
      label: 'Rekap Nilai',
      icon: FileSpreadsheet,
      allowed: currentUser.permissions.canViewStudents,
    },
    {
      id: 'ai-asisten' as ActiveTab,
      label: 'AI Asisten Siswa',
      icon: Sparkles,
      allowed: currentUser.permissions.canAccessAiAssistant,
    },
  ];

  // Menu Pengaturan & Hak Akses HANYA ditampilkan untuk role 'admin'
  const navItems = currentUser.role === 'admin'
    ? [
        ...baseNavItems,
        {
          id: 'pengaturan' as ActiveTab,
          label: 'Pengaturan & Hak Akses',
          icon: Settings,
          allowed: true,
        },
      ]
    : baseNavItems;

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden lg:flex w-64 bg-slate-900 flex-col shrink-0 fixed inset-y-0 left-0 z-30 border-r border-slate-800 print:hidden">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white text-xl shadow-md shadow-blue-900/30 shrink-0">
              B
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white font-extrabold tracking-tight text-base leading-tight truncate">
                E-BINDUK
              </span>
              <span className="text-slate-400 text-[11px] font-semibold mt-0.5 tracking-wider truncate uppercase">
                {schoolProfile.namaSekolah}
              </span>
            </div>
          </div>
        </div>

        {/* User Role Card in Sidebar */}
        <div className="p-3">
          <div className="p-3 bg-slate-800/90 border border-slate-700/80 rounded-xl">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <img
                  src={
                    currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-blue-400/50"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900"></span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-slate-100 font-bold text-xs truncate block">
                  {currentUser.name}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border ${getRoleBadgeStyle(
                      currentUser.role
                    )}`}
                  >
                    {currentUser.roleLabel}{' '}
                    {currentUser.assignedClass ? `(${currentUser.assignedClass})` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Sesi Resmi</span>
              </span>
              <span className="text-emerald-400 font-medium">Aktif</span>
            </div>
          </div>
        </div>

        {/* Cloud Status Widget in Sidebar */}
        <div className="px-3">
          <div className="p-2.5 bg-slate-800/50 border border-slate-700/60 rounded-lg flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  isSyncing
                    ? 'bg-amber-400 animate-pulse'
                    : isCloudConnected
                    ? 'bg-emerald-400'
                    : 'bg-red-400'
                }`}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-slate-200 truncate">
                  {isSyncing
                    ? 'Sinkronisasi Cloud...'
                    : isCloudConnected
                    ? 'Firestore Cloud Aktif'
                    : 'Mode Offline'}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {lastSyncTime ? `Sinkron ${lastSyncTime}` : 'Real-time sync'}
                </span>
              </div>
            </div>
            {isSyncing && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin shrink-0" />}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
            <span>Menu Utama</span>
            <span className="text-[9px] text-slate-500 font-mono">E-Binduk v2.0</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isAllowed = item.allowed;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isAllowed) {
                    setActiveTab(item.id);
                  } else {
                    onOpenLoginModal();
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                  isActive
                    ? 'text-white bg-blue-600 shadow-sm shadow-blue-900/40 font-semibold'
                    : isAllowed
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/40 cursor-pointer'
                }`}
                title={!isAllowed ? `Akses dibatasi. Klik untuk mengganti hak akses akun.` : undefined}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive
                        ? 'text-white'
                        : isAllowed
                        ? 'text-slate-400 group-hover:text-white'
                        : 'text-slate-600'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {!isAllowed && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Bottom Footer: Clean Logout Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            title="Keluar dari sesi E-Binduk dan kunci akses"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header (Only visible on small screens < lg) */}
      <header className="lg:hidden bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-20 print:hidden">
        <div className="h-14 px-4 flex items-center justify-between gap-3">
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700 cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-bold text-white text-xs">
                B
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-xs leading-tight">E-BINDUK</span>
                <span className="text-[9px] text-slate-400 font-medium truncate max-w-[160px]">{schoolProfile.namaSekolah}</span>
              </div>
            </div>
          </div>

          {/* Right Mobile Status & Quick Logout */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isSyncing ? 'bg-amber-400 animate-ping' : isCloudConnected ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
              title={isCloudConnected ? 'Firebase Aktif' : 'Offline'}
            />
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg border border-slate-800 transition"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="bg-slate-900 text-white border-t border-slate-800 px-4 py-3 space-y-2">
            <div className="p-3 bg-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={
                    currentUser.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div>
                  <div className="font-bold text-white">{currentUser.name}</div>
                  <div className="text-[10px] text-blue-400">{currentUser.roleLabel}</div>
                </div>
              </div>
              <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                Sesi Aktif
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isAllowed = item.allowed;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isAllowed) {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'text-white bg-blue-600 font-semibold'
                      : isAllowed
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!isAllowed && <Lock className="w-3 h-3 text-slate-500" />}
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </header>
    </>
  );
};
