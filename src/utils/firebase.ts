import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';
import { Student, SchoolProfile } from '../types';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App safely
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with long-polling auto-detect to prevent WebChannel disconnect errors in iframes
const databaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';
export const db = (() => {
  try {
    if (databaseId && databaseId !== '(default)') {
      return initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true,
      }, databaseId);
    }
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
    });
  } catch {
    return databaseId && databaseId !== '(default)'
      ? getFirestore(app, databaseId)
      : getFirestore(app);
  }
})();

// Firestore collection references
export const STUDENTS_COLLECTION = 'students';
export const SETTINGS_COLLECTION = 'schoolProfile';
const PROFILE_DOC_ID = 'main_profile';

/**
 * Fetch all students from Firestore
 */
export async function getStudentsFromFirestore(): Promise<Student[]> {
  try {
    const studentsRef = collection(db, STUDENTS_COLLECTION);
    const q = query(studentsRef, orderBy('noUrutInduk', 'asc'));
    const snapshot = await getDocs(q);
    const results: Student[] = [];
    snapshot.forEach((docSnap) => {
      results.push(docSnap.data() as Student);
    });
    return results;
  } catch (error) {
    console.error('Error fetching students from Firestore:', error);
    throw error;
  }
}

/**
 * Save / Update a single student in Firestore
 */
export async function saveStudentToFirestore(student: Student): Promise<void> {
  try {
    const studentDocRef = doc(db, STUDENTS_COLLECTION, student.id);
    await setDoc(studentDocRef, student, { merge: true });
  } catch (error) {
    console.error('Error saving student to Firestore:', error);
    throw error;
  }
}

/**
 * Delete a student from Firestore
 */
export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  try {
    const studentDocRef = doc(db, STUDENTS_COLLECTION, studentId);
    await deleteDoc(studentDocRef);
  } catch (error) {
    console.error('Error deleting student from Firestore:', error);
    throw error;
  }
}

/**
 * Batch upload / sync all students to Firestore
 */
export async function syncAllStudentsToFirestore(students: Student[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    for (const student of students) {
      const studentDocRef = doc(db, STUDENTS_COLLECTION, student.id);
      batch.set(studentDocRef, student, { merge: true });
    }
    await batch.commit();
  } catch (error) {
    console.error('Error batch syncing students to Firestore:', error);
    throw error;
  }
}

/**
 * Real-time listener for students collection
 */
export function subscribeStudentsFromFirestore(
  onSuccess: (students: Student[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const studentsRef = collection(db, STUDENTS_COLLECTION);
  const q = query(studentsRef, orderBy('noUrutInduk', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const students: Student[] = [];
      snapshot.forEach((docSnap) => {
        students.push(docSnap.data() as Student);
      });
      onSuccess(students);
    },
    (err) => {
      console.error('Realtime students listener error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Fetch school profile from Firestore
 */
export async function getSchoolProfileFromFirestore(): Promise<SchoolProfile | null> {
  try {
    const profileDocRef = doc(db, SETTINGS_COLLECTION, PROFILE_DOC_ID);
    const snap = await getDoc(profileDocRef);
    if (snap.exists()) {
      return snap.data() as SchoolProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching school profile from Firestore:', error);
    return null;
  }
}

/**
 * Save school profile to Firestore
 */
export async function saveSchoolProfileToFirestore(profile: SchoolProfile): Promise<void> {
  try {
    const profileDocRef = doc(db, SETTINGS_COLLECTION, PROFILE_DOC_ID);
    await setDoc(profileDocRef, profile, { merge: true });
  } catch (error) {
    console.error('Error saving school profile to Firestore:', error);
    throw error;
  }
}

/**
 * Real-time listener for school profile
 */
export function subscribeSchoolProfileFromFirestore(
  onSuccess: (profile: SchoolProfile) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const profileDocRef = doc(db, SETTINGS_COLLECTION, PROFILE_DOC_ID);
  return onSnapshot(
    profileDocRef,
    (snap) => {
      if (snap.exists()) {
        onSuccess(snap.data() as SchoolProfile);
      }
    },
    (err) => {
      console.error('Realtime profile listener error:', err);
      if (onError) onError(err);
    }
  );
}
