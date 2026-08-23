import React from 'react';
import { SchoolProfile } from '../types';
import { DEFAULT_LOGO_BANTUL, DEFAULT_LOGO_TUTWURI } from '../utils/defaultLogos';

interface OfficialKopSuratProps {
  schoolProfile: SchoolProfile;
  subTitle?: string;
  className?: string;
}

export const OfficialKopSurat: React.FC<OfficialKopSuratProps> = ({
  schoolProfile,
  subTitle,
  className = '',
}) => {
  const logoBantul = schoolProfile.logoBantulUrl || DEFAULT_LOGO_BANTUL;
  const logoTutwuri = schoolProfile.logoTutwuriUrl || DEFAULT_LOGO_TUTWURI;
  const kabupatenName = schoolProfile.kabupaten || 'Bantul';

  return (
    <div className={`border-b-4 border-double border-slate-900 pb-3 mb-4 text-center font-sans ${className}`}>
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* LOGO KIRI: PEMKAB BANTUL */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0 p-0.5">
          <img
            src={logoBantul}
            alt={`Logo Kabupaten ${kabupatenName}`}
            className="w-full h-full max-h-16 sm:max-h-20 object-contain filter drop-shadow-2xs print:drop-shadow-none"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_BANTUL;
            }}
          />
        </div>

        {/* TEKS IDENTITAS KOP RESMI */}
        <div className="flex-1 px-1 sm:px-3 text-center">
          <h4 className="text-[11px] sm:text-xs uppercase tracking-wider font-bold text-slate-800 leading-tight">
            Pemerintah Kabupaten {kabupatenName}
          </h4>
          <h3 className="text-xs sm:text-[13px] uppercase tracking-wider font-bold text-slate-900 leading-tight">
            Dinas Pendidikan Kepemudaan dan Olahraga
          </h3>
          <h2 className="text-base sm:text-lg lg:text-xl font-extrabold uppercase tracking-wide text-slate-950 mt-0.5 leading-tight">
            {schoolProfile.namaSekolah || 'SMP NEGERI 2 KASIHAN'}
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-700 mt-0.5 leading-tight">
            {schoolProfile.alamat}, Kel. {schoolProfile.kelurahan}, Kec. {schoolProfile.kecamatan}, {schoolProfile.kabupaten}, D.I. Yogyakarta {schoolProfile.kodePos}
          </p>
          <p className="text-[9px] sm:text-[10px] text-slate-600 leading-tight">
            NPSN: {schoolProfile.npsn} &bull; NSS: {schoolProfile.nss || '-'} &bull; Akreditasi: {schoolProfile.akreditasi || 'A'} &bull; Email: {schoolProfile.email}
          </p>
          {subTitle && (
            <p className="text-[10px] font-bold text-emerald-800 mt-0.5 uppercase tracking-wider">
              {subTitle}
            </p>
          )}
        </div>

        {/* LOGO KANAN: TUT WURI HANDAYANI / LOGO SEKOLAH */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center shrink-0 p-0.5">
          <img
            src={logoTutwuri}
            alt="Logo Tut Wuri Handayani / Sekolah"
            className="w-full h-full max-h-16 sm:max-h-20 object-contain filter drop-shadow-2xs print:drop-shadow-none"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_TUTWURI;
            }}
          />
        </div>
      </div>
    </div>
  );
};
