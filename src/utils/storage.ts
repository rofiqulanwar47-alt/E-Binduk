import { Student, SchoolProfile, UserAccount } from '../types';
import { initialStudents } from '../data/initialStudents';
import { defaultSchoolProfile } from '../data/schoolInfo';
import { DEFAULT_USERS } from '../data/defaultUsers';

const STORAGE_KEY_STUDENTS = 'ebinduk_smpn2kasihan_students_v1';
const STORAGE_KEY_SCHOOL = 'ebinduk_smpn2kasihan_school_v1';
const STORAGE_KEY_CURRENT_USER = 'ebinduk_smpn2kasihan_auth_user_v2';
const STORAGE_KEY_USERS = 'ebinduk_smpn2kasihan_users_list_v2';

export function loadUsersList(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      saveUsersList(DEFAULT_USERS);
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure only the 3 official roles are present
      const validRoles = new Set(['admin', 'petugas_tu', 'kepala_sekolah']);
      const filtered = parsed.filter((u) => validRoles.has(u.role));
      if (filtered.length === 3) {
        // Ensure default permissions and passwords exist
        return filtered.map((u) => {
          const defaultRef = DEFAULT_USERS.find((d) => d.id === u.id || d.role === u.role) || DEFAULT_USERS[0];
          return {
            ...defaultRef,
            ...u,
            password: u.password || defaultRef.password,
            permissions: defaultRef.permissions,
          };
        });
      }
    }
    saveUsersList(DEFAULT_USERS);
    return DEFAULT_USERS;
  } catch (err) {
    console.error('Error loading users list:', err);
    return DEFAULT_USERS;
  }
}

export function saveUsersList(users: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users list to storage:', err);
  }
}

export function updateUserAccount(updatedUser: UserAccount): boolean {
  try {
    const users = loadUsersList();
    const updatedList = users.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
    saveUsersList(updatedList);

    // If current logged-in user identity is updated, update the session
    const current = loadCurrentUser();
    if (current && (current.id === updatedUser.id || current.role === updatedUser.role)) {
      saveCurrentUser({ ...current, ...updatedUser });
    }
    return true;
  } catch (err) {
    console.error('Error updating user account:', err);
    return false;
  }
}

export function updateUserPassword(userId: string, newPassword: string): boolean {
  try {
    const users = loadUsersList();
    const updated = users.map((u) => (u.id === userId ? { ...u, password: newPassword } : u));
    saveUsersList(updated);

    // If current user updated their password, update current user session as well
    const current = loadCurrentUser();
    if (current && current.id === userId) {
      saveCurrentUser({ ...current, password: newPassword });
    }
    return true;
  } catch (err) {
    console.error('Error updating user password:', err);
    return false;
  }
}

export function loadCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!raw) {
      return null;
    }
    const users = loadUsersList();
    const parsed = JSON.parse(raw);
    const matched = users.find((u) => u.id === parsed.id || u.role === parsed.role);
    if (matched) {
      return matched;
    }
    return null;
  } catch (err) {
    console.error('Error loading current user from storage:', err);
    return null;
  }
}

export function saveCurrentUser(user: UserAccount | null): void {
  try {
    if (!user) {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    }
  } catch (err) {
    console.error('Error saving current user to storage:', err);
  }
}

export function clearCurrentUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  } catch (err) {
    console.error('Error clearing current user:', err);
  }
}

export function authenticateUser(
  usernameInput: string,
  passwordInput: string
): { success: boolean; user?: UserAccount; error?: string } {
  const users = loadUsersList();
  const cleanInput = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanInput) {
    return { success: false, error: 'Silakan masukkan username atau email Anda.' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Silakan masukkan kata sandi akun.' };
  }

  // Find user by username, email, or alias
  const foundUser = users.find((u) => {
    const uName = u.username.toLowerCase();
    const uEmail = u.email.toLowerCase();
    if (uName === cleanInput || uEmail === cleanInput) return true;
    if (u.role === 'admin' && (cleanInput === 'admin' || cleanInput === 'admin.it')) return true;
    if (
      u.role === 'petugas_tu' &&
      (cleanInput === 'petugas.tu' || cleanInput === 'petugastu' || cleanInput === 'tu' || cleanInput === 'tu.bukuiduk')
    )
      return true;
    if (
      u.role === 'kepala_sekolah' &&
      (cleanInput === 'kepala.sekolah' || cleanInput === 'kepsek' || cleanInput === 'kepala')
    )
      return true;
    return false;
  });

  if (!foundUser) {
    return {
      success: false,
      error: 'Username tidak ditemukan. Pastikan Anda menggunakan username akun resmi yang terdaftar.',
    };
  }

  // Check password
  const expectedPassword = foundUser.password || 'admin123';
  if (cleanPassword !== expectedPassword) {
    return {
      success: false,
      error: 'Kata sandi salah. Silakan periksa kembali huruf besar/kecil kata sandi Anda.',
    };
  }

  return { success: true, user: foundUser };
}

// List of known sample dummy student IDs from original mock seed
const DUMMY_STUDENT_IDS = new Set([
  'std-2024-001',
  'std-2024-002',
  'std-2024-003',
  'std-2024-004',
  'std-2024-005',
  'std-2024-006',
  'std-2024-007',
  'std-2024-008',
  'std-2024-009',
  'std-2024-010',
]);

const DUMMY_NAMES = new Set([
  'Aditya Bagus Nugroho',
  'Anindya Kirana Larasati',
  'Bagus Pratama Putra',
  'Citra Dewi Maharani',
  'Dimas Arya Pangestu',
  'Eka Rahmawati',
  'Fajar Hidayat',
  'Gita Permata Sari',
  'Hendra Kurniawan',
  'Indah Puspitasari',
]);

/**
 * Check if a student record is one of the initial dummy/mock records
 */
export function isDummyStudent(student: Student): boolean {
  if (!student) return false;
  if (DUMMY_STUDENT_IDS.has(student.id)) return true;
  if (student.id.startsWith('std-2024-00') || student.id.startsWith('std-2024-010')) {
    if (DUMMY_NAMES.has(student.namaLengkap)) return true;
  }
  return false;
}

/**
 * Remove dummy student records from an array of students
 */
export function cleanDummyStudents(students: Student[]): Student[] {
  if (!Array.isArray(students)) return [];
  return students.filter((s) => !isDummyStudent(s));
}

export function loadStudents(): Student[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDENTS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Automatically purge initial sample dummy records if real data exists
      const cleaned = cleanDummyStudents(parsed);
      if (cleaned.length !== parsed.length) {
        saveStudents(cleaned);
      }
      return cleaned;
    }
    return [];
  } catch (err) {
    console.error('Error loading students from storage:', err);
    return [];
  }
}

export function saveStudents(students: Student[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
  } catch (err) {
    console.error('Error saving students to storage:', err);
  }
}

export function loadSchoolProfile(): SchoolProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SCHOOL);
    if (!raw) {
      saveSchoolProfile(defaultSchoolProfile);
      return defaultSchoolProfile;
    }
    return { ...defaultSchoolProfile, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error loading school profile:', err);
    return defaultSchoolProfile;
  }
}

export function saveSchoolProfile(profile: SchoolProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_SCHOOL, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving school profile:', err);
  }
}

export function resetToDefaultData(): void {
  localStorage.removeItem(STORAGE_KEY_STUDENTS);
  localStorage.removeItem(STORAGE_KEY_SCHOOL);
  saveStudents(initialStudents);
  saveSchoolProfile(defaultSchoolProfile);
}
