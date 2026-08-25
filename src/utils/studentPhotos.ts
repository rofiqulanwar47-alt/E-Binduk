import { Gender } from '../types';

/**
 * Curated list of realistic student dummy pass photos
 */
export const DUMMY_MALE_STUDENT_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1480429370139-e0132c086e2a?auto=format&fit=crop&q=80&w=300',
];

export const DUMMY_FEMALE_STUDENT_PHOTOS: string[] = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
];

/**
 * Generates a stable numeric hash from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Returns a deterministic dummy photo URL based on student gender and seed (name/id/nisn)
 */
export function getDefaultStudentPhoto(gender?: Gender | string, seed?: string | number): string {
  const isFemale =
    gender === 'P' ||
    gender === 'Perempuan' ||
    gender === 'Wanita' ||
    gender === 'female' ||
    gender === 'F';

  const photoList = isFemale ? DUMMY_FEMALE_STUDENT_PHOTOS : DUMMY_MALE_STUDENT_PHOTOS;

  if (seed !== undefined && seed !== null && seed !== '') {
    const numericSeed = typeof seed === 'number' ? Math.abs(seed) : hashString(String(seed));
    const index = numericSeed % photoList.length;
    return photoList[index];
  }

  // Fallback to first in list
  return photoList[0];
}

/**
 * Check if a URL is an existing non-empty photo or if we should provide a default
 */
export function getStudentPhoto(student?: {
  fotoUrl?: string;
  jenisKelamin?: Gender | string;
  id?: string;
  namaLengkap?: string;
  nisn?: string;
  noUrutInduk?: string;
}): string {
  if (!student) {
    return DUMMY_MALE_STUDENT_PHOTOS[0];
  }

  const url = student.fotoUrl?.trim();
  if (url && url.length > 5 && (url.startsWith('http') || url.startsWith('data:image') || url.startsWith('/'))) {
    return url;
  }

  const seed = student.nisn || student.noUrutInduk || student.namaLengkap || student.id || 'default';
  return getDefaultStudentPhoto(student.jenisKelamin, seed);
}

/**
 * Get available dummy photos for gallery selector
 */
export function getStudentPhotoGallery(gender?: Gender | string): string[] {
  const isFemale =
    gender === 'P' ||
    gender === 'Perempuan' ||
    gender === 'Wanita' ||
    gender === 'female' ||
    gender === 'F';

  return isFemale ? DUMMY_FEMALE_STUDENT_PHOTOS : DUMMY_MALE_STUDENT_PHOTOS;
}
