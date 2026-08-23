import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StudentListView } from './components/StudentListView';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentFormModal } from './components/StudentFormModal';
import { EditScoreModal } from './components/EditScoreModal';
import { PrintMasterSheetView } from './components/PrintMasterSheetView';
import { StudentCardView } from './components/StudentCardView';
import { LegerScoreView } from './components/LegerScoreView';
import { AiAssistantView } from './components/AiAssistantView';
import { SchoolSettingsView } from './components/SchoolSettingsView';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ToastNotification, ToastMessage } from './components/ToastNotification';
import { ActiveTab, SchoolProfile, Student, UserAccount, SemesterReport } from './types';
import {
  loadStudents,
  saveStudents,
  loadSchoolProfile,
  saveSchoolProfile,
  loadCurrentUser,
  saveCurrentUser,
  clearCurrentUser,
  cleanDummyStudents,
} from './utils/storage';
import { DEFAULT_USERS } from './data/defaultUsers';
import {
  saveStudentToFirestore,
  deleteStudentFromFirestore,
  syncAllStudentsToFirestore,
  subscribeStudentsFromFirestore,
  getStudentsFromFirestore,
  saveSchoolProfileToFirestore,
  subscribeSchoolProfileFromFirestore,
} from './utils/firebase';

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(loadSchoolProfile());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // User & Authentication State (Must log in with username and password to access)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => loadCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Cloud Sync Status
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Selected Student State for Modals & Views
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [activePrintStudent, setActivePrintStudent] = useState<Student | null>(null);

  // Edit Score Modal State
  const [scoreModalState, setScoreModalState] = useState<{
    isOpen: boolean;
    student: Student | null;
    selectedSemester: number;
  }>({
    isOpen: false,
    student: null,
    selectedSemester: 1,
  });

  const handleOpenEditScores = (student: Student, semester: number = 1) => {
    setScoreModalState({
      isOpen: true,
      student,
      selectedSemester: semester || 1,
    });
  };

  const handleSaveScore = async (studentId: string, updatedReport: SemesterReport) => {
    const targetStudent = students.find((s) => s.id === studentId);
    if (!targetStudent) return;

    const currentReports = targetStudent.semesterReports || [];
    const existingIdx = currentReports.findIndex((r) => r.semester === updatedReport.semester);
    let newReports: SemesterReport[];
    if (existingIdx >= 0) {
      newReports = currentReports.map((r, idx) => (idx === existingIdx ? updatedReport : r));
    } else {
      newReports = [...currentReports, updatedReport];
    }

    const updatedStudent: Student = {
      ...targetStudent,
      semesterReports: newReports,
      updatedAt: new Date().toISOString(),
    };

    await handleSaveStudent(updatedStudent);
    setScoreModalState({ isOpen: false, student: null, selectedSemester: 1 });
    setToastMessage({
      type: 'success',
      title: 'Nilai Rapor Berhasil Disimpan',
      message: `Nilai rapor semester ${updatedReport.semester} untuk ${updatedStudent.namaLengkap} berhasil diperbarui dan disinkronkan ke Cloud Firestore.`,
    });
  };

  // Delete Confirmation Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    student: Student | null;
    multipleStudents?: Student[];
    isDeleting: boolean;
  }>({
    isOpen: false,
    student: null,
    multipleStudents: [],
    isDeleting: false,
  });

  // Global In-App Toast Notification
  const [toastMessage, setToastMessage] = useState<ToastMessage | null>(null);

  const handleSelectUser = (user: UserAccount) => {
    setCurrentUser(user);
    saveCurrentUser(user);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    clearCurrentUser();
    setIsLoginModalOpen(false);
    setViewingStudent(null);
    setEditingStudent(null);
    setIsFormModalOpen(false);
  };

  // Initial Load & Realtime Firestore Subscription
  useEffect(() => {
    // 1. Instant load from local cache with dummy filter
    const localStudents = cleanDummyStudents(loadStudents());
    setStudents(localStudents);
    const localProfile = loadSchoolProfile();
    setSchoolProfile(localProfile);

    // 2. Realtime listener for Firestore students
    setIsSyncing(true);
    const unsubscribeStudents = subscribeStudentsFromFirestore(
      (cloudStudents) => {
        setIsCloudConnected(true);
        setIsSyncing(false);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));

        if (cloudStudents && cloudStudents.length > 0) {
          const cleanedCloud = cleanDummyStudents(cloudStudents);
          setStudents(cleanedCloud);
          saveStudents(cleanedCloud);
        } else if (localStudents.length > 0) {
          // If Firestore is empty on initial setup, seed local students to Firestore
          syncAllStudentsToFirestore(localStudents)
            .then(() => console.log('Seeded initial students to Firestore'))
            .catch((e) => console.error('Failed to seed to Firestore:', e));
        }
      },
      (error) => {
        console.warn('Firestore connection fallback to local:', error);
        setIsCloudConnected(false);
        setIsSyncing(false);
      }
    );

    // 3. Realtime listener for Firestore school profile
    const unsubscribeProfile = subscribeSchoolProfileFromFirestore(
      (cloudProfile) => {
        if (cloudProfile && cloudProfile.namaSekolah) {
          setSchoolProfile(cloudProfile);
          saveSchoolProfile(cloudProfile);
        } else if (localProfile) {
          saveSchoolProfileToFirestore(localProfile).catch(() => {});
        }
      },
      (err) => console.warn('Profile sync fallback:', err)
    );

    return () => {
      unsubscribeStudents();
      unsubscribeProfile();
    };
  }, []);

  // Save student handler (Local + Firestore)
  const handleSaveStudent = async (savedStudent: Student) => {
    // Immediate local optimistic update
    setStudents((prev) => {
      const exists = prev.some((s) => s.id === savedStudent.id);
      let updated: Student[];
      if (exists) {
        updated = prev.map((s) => (s.id === savedStudent.id ? savedStudent : s));
      } else {
        updated = [savedStudent, ...prev];
      }
      saveStudents(updated);
      return updated;
    });

    setIsFormModalOpen(false);
    setEditingStudent(null);
    if (viewingStudent && viewingStudent.id === savedStudent.id) {
      setViewingStudent(savedStudent);
    }

    // Push to Firestore Cloud Database
    try {
      setIsSyncing(true);
      await saveStudentToFirestore(savedStudent);
      setIsCloudConnected(true);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      console.error('Error saving to Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Trigger Single Student Delete Modal
  const handleDeleteStudent = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    if (!target) return;

    if (currentUser && !currentUser.permissions.canDeleteStudent) {
      setToastMessage({
        type: 'error',
        title: 'Akses Ditolak',
        message: 'Peran akun Anda tidak memiliki hak akses untuk menghapus data siswa.',
      });
      return;
    }

    setDeleteModalState({
      isOpen: true,
      student: target,
      multipleStudents: [],
      isDeleting: false,
    });
  };

  // Trigger Bulk Delete Modal
  const handleBulkDelete = (studentIds: string[]) => {
    if (!studentIds || studentIds.length === 0) return;

    if (currentUser && !currentUser.permissions.canDeleteStudent) {
      setToastMessage({
        type: 'error',
        title: 'Akses Ditolak',
        message: 'Peran akun Anda tidak memiliki hak akses untuk menghapus data siswa.',
      });
      return;
    }

    const targets = students.filter((s) => studentIds.includes(s.id));
    setDeleteModalState({
      isOpen: true,
      student: null,
      multipleStudents: targets,
      isDeleting: false,
    });
  };

  // Confirm and Execute Deletion (Local + Firestore)
  const handleConfirmDelete = async () => {
    if (deleteModalState.isDeleting) return;

    const targetStudent = deleteModalState.student;
    const multiple = deleteModalState.multipleStudents;

    setDeleteModalState((prev) => ({ ...prev, isDeleting: true }));

    try {
      if (multiple && multiple.length > 0) {
        const idsToRemove = new Set(multiple.map((s) => s.id));
        const updated = students.filter((s) => !idsToRemove.has(s.id));
        setStudents(updated);
        saveStudents(updated);

        // Delete from Firestore Cloud
        setIsSyncing(true);
        for (const st of multiple) {
          try {
            await deleteStudentFromFirestore(st.id);
          } catch (e) {
            console.error(`Error deleting student ${st.id} from Firestore:`, e);
          }
        }
        setIsCloudConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));

        setToastMessage({
          type: 'success',
          title: 'Data Berhasil Dihapus',
          message: `${multiple.length} data siswa terpilih telah dihapus dari Buku Induk & Cloud.`,
        });
      } else if (targetStudent) {
        const studentId = targetStudent.id;
        const updated = students.filter((s) => s.id !== studentId);
        setStudents(updated);
        saveStudents(updated);

        if (viewingStudent?.id === studentId) {
          setViewingStudent(null);
        }

        // Delete from Firestore Cloud
        setIsSyncing(true);
        await deleteStudentFromFirestore(studentId);
        setIsCloudConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));

        setToastMessage({
          type: 'success',
          title: 'Data Siswa Dihapus',
          message: `Data siswa "${targetStudent.namaLengkap}" berhasil dihapus dari Buku Induk & Cloud.`,
        });
      }
    } catch (err: any) {
      console.error('Error deleting from Firestore:', err);
      setToastMessage({
        type: 'error',
        title: 'Kendala Sinkronisasi Cloud',
        message: `Data lokal terhapus, namun terjadi kendala pada sinkronisasi cloud: ${err?.message || err}`,
      });
    } finally {
      setIsSyncing(false);
      setDeleteModalState({
        isOpen: false,
        student: null,
        multipleStudents: [],
        isDeleting: false,
      });
    }
  };

  // Update profile handler (Local + Firestore)
  const handleUpdateSchoolProfile = async (newProfile: SchoolProfile) => {
    setSchoolProfile(newProfile);
    saveSchoolProfile(newProfile);
    try {
      setIsSyncing(true);
      await saveSchoolProfileToFirestore(newProfile);
      setIsCloudConnected(true);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
    } catch (err) {
      console.error('Error updating profile in Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual Full Sync to Cloud
  const handleSyncToCloud = async (customStudents?: Student[]) => {
    try {
      setIsSyncing(true);
      const targetStudents = customStudents && Array.isArray(customStudents) ? customStudents : students;
      await syncAllStudentsToFirestore(targetStudents);
      await saveSchoolProfileToFirestore(schoolProfile);
      setIsCloudConnected(true);
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      console.log(`Synced ${targetStudents.length} students to Firebase Firestore.`);
    } catch (err: any) {
      console.error('Failed to sync to Firestore:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual Pull from Cloud
  const handlePullFromCloud = async () => {
    try {
      setIsSyncing(true);
      const cloudStudents = await getStudentsFromFirestore();
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
        saveStudents(cloudStudents);
        setIsCloudConnected(true);
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        setToastMessage({
          type: 'success',
          title: 'Sinkronisasi Berhasil',
          message: `Berhasil memuat ${cloudStudents.length} data siswa dari database Firebase Firestore.`,
        });
      } else {
        setToastMessage({
          type: 'info',
          title: 'Database Masih Kosong',
          message: 'Database Firebase belum memiliki data. Gunakan tombol Unggah untuk mengisi database cloud.',
        });
      }
    } catch (err: any) {
      setToastMessage({
        type: 'error',
        title: 'Gagal Menarik Data',
        message: `Gagal mengambil data dari Firebase: ${err?.message || err}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Navigation handlers
  const handleOpenNewStudent = () => {
    setEditingStudent(null);
    setIsFormModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsFormModalOpen(true);
  };

  const handlePrintMasterSheet = (student: Student) => {
    setActivePrintStudent(student);
    setActiveTab('cetak-lembar');
    setViewingStudent(null);
  };

  const handlePrintCard = (student: Student) => {
    setActivePrintStudent(student);
    setActiveTab('kartu-pelajar');
    setViewingStudent(null);
  };

  const handleAnalyzeAi = (student: Student) => {
    setActivePrintStudent(student);
    setActiveTab('ai-asisten');
    setViewingStudent(null);
  };

  // If user is not authenticated, display full LoginPage authentication gate
  if (!currentUser) {
    return (
      <LoginPage
        schoolProfile={schoolProfile}
        onLoginSuccess={handleSelectUser}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white antialiased">
      {/* Sidebar + Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        schoolProfile={schoolProfile}
        students={students}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        isCloudConnected={isCloudConnected}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onOpenNewStudent={handleOpenNewStudent}
        onOpenAiChat={() => setActiveTab('ai-asisten')}
      />

      {/* Main Content Area */}
      <main className="lg:pl-64 print:pl-0 print:m-0 flex-1 flex flex-col min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 flex-1 max-w-[1600px] print:max-w-none w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              students={students}
              schoolProfile={schoolProfile}
              setActiveTab={setActiveTab}
              onSelectStudent={(s) => setViewingStudent(s)}
              onOpenNewStudent={handleOpenNewStudent}
              onOpenAiChat={() => setActiveTab('ai-asisten')}
            />
          )}

          {activeTab === 'buku-induk' && (
            <StudentListView
              students={students}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              currentUser={currentUser}
              onSelectStudent={(s) => setViewingStudent(s)}
              onEditStudent={handleEditStudent}
              onEditScores={(s, sem) => handleOpenEditScores(s, sem || 1)}
              onDeleteStudent={handleDeleteStudent}
              onDeleteMultipleStudents={handleBulkDelete}
              onOpenNewStudent={handleOpenNewStudent}
              onPrintMasterSheet={handlePrintMasterSheet}
              onPrintCard={handlePrintCard}
              onAnalyzeAi={handleAnalyzeAi}
            />
          )}

          {activeTab === 'cetak-lembar' && (
            <PrintMasterSheetView
              students={students}
              selectedStudent={activePrintStudent}
              schoolProfile={schoolProfile}
              onBack={() => setActiveTab('buku-induk')}
              onSelectStudent={(s) => setActivePrintStudent(s)}
            />
          )}

          {activeTab === 'kartu-pelajar' && (
            <StudentCardView
              students={students}
              selectedStudent={activePrintStudent}
              schoolProfile={schoolProfile}
              onBack={() => setActiveTab('buku-induk')}
              onSelectStudent={(s) => setActivePrintStudent(s)}
            />
          )}

          {activeTab === 'leger' && (
            <LegerScoreView
              students={students}
              schoolProfile={schoolProfile}
              onSelectStudent={(s) => setViewingStudent(s)}
              onEditScores={(s, sem) => handleOpenEditScores(s, sem)}
            />
          )}

          {activeTab === 'ai-asisten' && (
            <AiAssistantView
              students={students}
              schoolProfile={schoolProfile}
              preselectedStudent={activePrintStudent}
              onSelectStudent={(s) => setViewingStudent(s)}
            />
          )}

          {activeTab === 'pengaturan' && (
            <SchoolSettingsView
              schoolProfile={schoolProfile}
              setSchoolProfile={handleUpdateSchoolProfile}
              students={students}
              setStudents={setStudents}
              currentUser={currentUser}
              onUpdateCurrentUser={setCurrentUser}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
              isCloudConnected={isCloudConnected}
              isSyncing={isSyncing}
              lastSyncTime={lastSyncTime}
              onSyncToCloud={handleSyncToCloud}
              onPullFromCloud={handlePullFromCloud}
            />
          )}
        </div>

        {/* Official Footer */}
        <footer className="bg-slate-900 text-slate-400 text-xs py-5 px-6 border-t border-slate-800 print:hidden mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-[1600px] mx-auto">
            <div>
              <span className="font-bold text-white">E-BINDUK</span> • Sistem Informasi Buku Induk Siswa Digital Resmi
              <span className="text-slate-500 block text-[11px] mt-0.5">
                {schoolProfile.namaSekolah} Bantul, D.I. Yogyakarta • Standar Kemendikbudristek RI • Didukung Cloud Firestore
              </span>
            </div>
            <div className="text-[11px] text-slate-500 text-right">
              Dikelola oleh Tim Tata Usaha & Kesiswaan • TP {schoolProfile.tahunAjaranAktif}
            </div>
          </div>
        </footer>
      </main>

      {/* Global Modals */}
      {isLoginModalOpen && (
        <LoginModal
          currentUser={currentUser}
          onSelectUser={handleSelectUser}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {viewingStudent && (
        <StudentDetailModal
          student={viewingStudent}
          schoolProfile={schoolProfile}
          currentUser={currentUser}
          onClose={() => setViewingStudent(null)}
          onEdit={(s) => {
            setViewingStudent(null);
            handleEditStudent(s);
          }}
          onEditScores={(s, sem) => {
            setViewingStudent(null);
            handleOpenEditScores(s, sem || 1);
          }}
          onPrintMasterSheet={(s) => {
            setViewingStudent(null);
            handlePrintMasterSheet(s);
          }}
          onPrintCard={(s) => {
            setViewingStudent(null);
            handlePrintCard(s);
          }}
          onAnalyzeAi={(s) => {
            setViewingStudent(null);
            handleAnalyzeAi(s);
          }}
        />
      )}

      {isFormModalOpen && (
        <StudentFormModal
          initialStudent={editingStudent}
          schoolProfile={schoolProfile}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingStudent(null);
          }}
          onSave={handleSaveStudent}
        />
      )}

      {/* Edit Academic Scores Modal */}
      {scoreModalState.isOpen && scoreModalState.student && (
        <EditScoreModal
          isOpen={scoreModalState.isOpen}
          student={scoreModalState.student}
          selectedSemester={scoreModalState.selectedSemester}
          onClose={() =>
            setScoreModalState({
              isOpen: false,
              student: null,
              selectedSemester: 1,
            })
          }
          onSaveScore={handleSaveScore}
        />
      )}

      {/* Delete Confirmation Modal (Native In-App Dialog) */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        student={deleteModalState.student}
        multipleStudents={deleteModalState.multipleStudents}
        isDeleting={deleteModalState.isDeleting}
        onClose={() =>
          setDeleteModalState({
            isOpen: false,
            student: null,
            multipleStudents: [],
            isDeleting: false,
          })
        }
        onConfirm={handleConfirmDelete}
      />

      {/* In-App Toast Feedback */}
      <ToastNotification
        toast={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
