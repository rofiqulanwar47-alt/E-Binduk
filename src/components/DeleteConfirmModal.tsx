import React from 'react';
import { AlertTriangle, Trash2, X, Loader2, UserX } from 'lucide-react';
import { Student } from '../types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  student: Student | null;
  multipleStudents?: Student[];
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  student,
  multipleStudents,
  isDeleting,
}) => {
  if (!isOpen) return null;

  const isMultiple = multipleStudents && multipleStudents.length > 0;
  const count = isMultiple ? multipleStudents.length : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden transition-all scale-in-95"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Warning */}
        <div className="bg-rose-50 p-6 border-b border-rose-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-rose-950">
              {isMultiple
                ? `Hapus ${count} Data Siswa Terpilih?`
                : 'Hapus Data Buku Induk Siswa?'}
            </h3>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              Tindakan ini permanen. Seluruh biodata, riwayat nilai rapor/leger, orang tua, dan catatan perkembangan akan dihapus dari sistem.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-4">
          {isMultiple ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 max-h-48 overflow-y-auto space-y-2 divide-y divide-slate-200/60">
              <div className="text-xs font-bold text-slate-700 pb-1 flex items-center gap-1.5">
                <UserX className="w-4 h-4 text-rose-500" />
                <span>Daftar {count} siswa yang akan dihapus:</span>
              </div>
              {multipleStudents?.map((st) => (
                <div key={st.id} className="pt-2 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-800">{st.namaLengkap}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      NISN: {st.nisn} • No. Induk: {st.noUrutInduk}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                    Kelas {st.kelasSekarang}
                  </span>
                </div>
              ))}
            </div>
          ) : student ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center gap-3.5">
              {student.pasFoto ? (
                <img
                  src={student.pasFoto}
                  alt={student.namaLengkap}
                  className="w-12 h-14 object-cover rounded-lg border border-slate-300 shrink-0"
                />
              ) : (
                <div className="w-12 h-14 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200 shrink-0">
                  {student.namaLengkap.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {student.namaLengkap}
                </h4>
                <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                  No. Induk: <strong className="text-slate-800">{student.noUrutInduk}</strong> • NISN: <strong className="text-slate-800">{student.nisn}</strong>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                    Kelas {student.kelasSekarang}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-700">
                    {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                  </span>
                </div>
              </div>
            </div>
          ) : null}

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
            <strong>Catatan Keamanan:</strong> Data yang telah dihapus akan disinkronkan secara realtime ke database cloud Firebase Firestore.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus Data...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Data Siswa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
