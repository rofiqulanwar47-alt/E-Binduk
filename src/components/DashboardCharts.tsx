import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Sector,
} from 'recharts';
import {
  Users,
  Award,
  HeartHandshake,
  MapPin,
  Sparkles,
  BookOpen,
  PieChart as PieIcon,
  Filter,
} from 'lucide-react';
import { Student, SchoolProfile } from '../types';

interface DashboardChartsProps {
  students: Student[];
  schoolProfile: SchoolProfile;
}

const GENDER_COLORS = ['#3b82f6', '#ec4899']; // Laki-laki: Blue, Perempuan: Pink
const TRACK_COLORS = ['#2563eb', '#f59e0b', '#10b981', '#8b5cf6'];
const GRADE_COLORS = ['#06b6d4', '#3b82f6', '#6366f1'];
const WELFARE_COLORS = ['#10b981', '#f59e0b', '#06b6d4', '#94a3b8'];
const VILLAGE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
const RELIGION_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#06b6d4'];

const renderActiveShape = (props: any) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 8) * cos;
  const sy = cy + (outerRadius + 8) * sin;
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 16;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy - 6} dy={8} textAnchor="middle" fill="#1e293b" className="font-extrabold text-sm">
        {payload.name}
      </text>
      <text x={cx} y={cy + 14} dy={8} textAnchor="middle" fill="#64748b" className="text-xs font-semibold">
        {`${value} Siswa (${(percent * 100).toFixed(1)}%)`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 9}
        fill={fill}
      />
    </g>
  );
};

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  students,
  schoolProfile,
}) => {
  const [activeGenderIndex, setActiveGenderIndex] = useState(0);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [activeGradeIndex, setActiveGradeIndex] = useState(0);
  const [activeWelfareIndex, setActiveWelfareIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'gender' | 'track' | 'grade' | 'welfare' | 'location'>('overview');

  const activeStudents = students.filter((s) => s.status === 'Aktif');
  const totalCount = activeStudents.length || 1;

  // 1. Data Gender
  const maleCount = activeStudents.filter((s) => s.jenisKelamin === 'L').length;
  const femaleCount = activeStudents.filter((s) => s.jenisKelamin === 'P').length;
  const genderData = [
    { name: 'Laki-Laki', value: maleCount, percentage: ((maleCount / totalCount) * 100).toFixed(1) },
    { name: 'Perempuan', value: femaleCount, percentage: ((femaleCount / totalCount) * 100).toFixed(1) },
  ];

  // 2. Data Jalur Masuk PPDB
  const trackCounts: Record<string, number> = {
    'Zonasi': 0,
    'Afirmasi (KMS/KIP)': 0,
    'Prestasi': 0,
    'Perpindahan Ortu': 0,
  };
  activeStudents.forEach((s) => {
    if (s.jalurMasuk === 'Afirmasi') trackCounts['Afirmasi (KMS/KIP)']++;
    else if (s.jalurMasuk === 'Prestasi') trackCounts['Prestasi']++;
    else if (s.jalurMasuk === 'Perpindahan Tugas Orang Tua') trackCounts['Perpindahan Ortu']++;
    else trackCounts['Zonasi']++;
  });
  const trackData = Object.entries(trackCounts).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / totalCount) * 100).toFixed(1),
  }));

  // 3. Data Tingkat Kelas
  const grade7 = activeStudents.filter((s) => s.kelasSekarang?.startsWith('7')).length;
  const grade8 = activeStudents.filter((s) => s.kelasSekarang?.startsWith('8')).length;
  const grade9 = activeStudents.filter((s) => s.kelasSekarang?.startsWith('9')).length;
  const gradeData = [
    { name: 'Kelas 7 (Fase D)', value: grade7, percentage: ((grade7 / totalCount) * 100).toFixed(1) },
    { name: 'Kelas 8 (Fase D)', value: grade8, percentage: ((grade8 / totalCount) * 100).toFixed(1) },
    { name: 'Kelas 9 (Fase D)', value: grade9, percentage: ((grade9 / totalCount) * 100).toFixed(1) },
  ];

  // 4. Data Kesejahteraan Sosial
  let kipOnly = 0;
  let kmsOnly = 0;
  let bothWelfare = 0;
  let nonWelfare = 0;
  activeStudents.forEach((s) => {
    const kip = s.kesejahteraan?.penerimaKip;
    const kms = s.kesejahteraan?.penerimaKmsBantul;
    if (kip && kms) bothWelfare++;
    else if (kip) kipOnly++;
    else if (kms) kmsOnly++;
    else nonWelfare++;
  });
  const welfareData = [
    { name: 'Penerima KIP/PIP', value: kipOnly + bothWelfare, percentage: (((kipOnly + bothWelfare) / totalCount) * 100).toFixed(1) },
    { name: 'Penerima KMS Bantul', value: kmsOnly, percentage: ((kmsOnly / totalCount) * 100).toFixed(1) },
    { name: 'Siswa Reguler Mandiri', value: nonWelfare, percentage: ((nonWelfare / totalCount) * 100).toFixed(1) },
  ];

  // 5. Data Asal Kelurahan
  const villageMap: Record<string, number> = {};
  activeStudents.forEach((s) => {
    const k = s.tempatTinggal?.kelurahan || 'Lainnya';
    villageMap[k] = (villageMap[k] || 0) + 1;
  });
  const villageEntries = Object.entries(villageMap).sort((a, b) => b[1] - a[1]);
  const topVillages = villageEntries.slice(0, 5);
  const otherVillagesCount = villageEntries.slice(5).reduce((acc, curr) => acc + curr[1], 0);
  const villageData = [
    ...topVillages.map(([name, value]) => ({ name, value, percentage: ((value / totalCount) * 100).toFixed(1) })),
    ...(otherVillagesCount > 0 ? [{ name: 'Kelurahan Lainnya', value: otherVillagesCount, percentage: ((otherVillagesCount / totalCount) * 100).toFixed(1) }] : []),
  ];

  // Custom Tooltip Formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900 text-white text-xs p-2.5 rounded-lg shadow-xl border border-slate-700 z-50">
          <div className="font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.payload.fill || data.color }} />
            <span>{data.name}</span>
          </div>
          <div className="mt-1 text-slate-300">
            Jumlah: <strong className="text-white">{data.value} Siswa</strong> ({data.payload.percentage || ((data.value / totalCount) * 100).toFixed(1)}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
              <PieIcon className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Grafik Komposisi & Analitik Demografi Siswa (Pie Charts)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visualisasi proporsional data peserta didik aktif ({activeStudents.length} siswa) TP {schoolProfile.tahunAjaranAktif}.
          </p>
        </div>

        {/* Filter / Mode Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'overview' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Grafik (Bento)
          </button>
          <button
            onClick={() => setActiveTab('gender')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'gender' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gender (L/P)
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'track' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Jalur PPDB
          </button>
          <button
            onClick={() => setActiveTab('grade')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'grade' ? 'bg-white text-purple-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tingkat Kelas
          </button>
          <button
            onClick={() => setActiveTab('welfare')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'welfare' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Afirmasi & KIP
          </button>
        </div>
      </div>

      {/* OVERVIEW / BENTO 4 PIE CHARTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* 1. PIE GENDER */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Rasio Jenis Kelamin</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                {activeStudents.length} Siswa
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-200/80 space-y-1 text-xs">
              <div className="flex justify-between items-center text-blue-700 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Laki-Laki
                </span>
                <span className="font-bold">{maleCount} ({genderData[0].percentage}%)</span>
              </div>
              <div className="flex justify-between items-center text-pink-700 font-medium">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pink-500" /> Perempuan
                </span>
                <span className="font-bold">{femaleCount} ({genderData[1].percentage}%)</span>
              </div>
            </div>
          </div>

          {/* 2. PIE JALUR MASUK */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Jalur Masuk PPDB</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                4 Kategori
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={trackData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {trackData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={TRACK_COLORS[index % TRACK_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
              {trackData.map((td, idx) => (
                <div key={td.name} className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center gap-1 truncate max-w-[130px]" title={td.name}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: TRACK_COLORS[idx % TRACK_COLORS.length] }} />
                    <span className="truncate">{td.name}</span>
                  </span>
                  <span className="font-bold shrink-0">{td.value} ({td.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. PIE TINGKAT KELAS */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>Distribusi Tingkat</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Kelas 7, 8, 9
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={gradeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {gradeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={GRADE_COLORS[index % GRADE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
              {gradeData.map((gd, idx) => (
                <div key={gd.name} className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GRADE_COLORS[idx] }} />
                    <span>{gd.name}</span>
                  </span>
                  <span className="font-bold">{gd.value} ({gd.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. PIE BANTUAN SOSIAL / AFIRMASI */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Kesejahteraan Siswa</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                KIP & KMS Bantul
              </span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={welfareData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={68}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {welfareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={WELFARE_COLORS[index % WELFARE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-200/80 space-y-1 text-[11px]">
              {welfareData.map((wd, idx) => (
                <div key={wd.name} className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center gap-1 truncate max-w-[130px]" title={wd.name}>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: WELFARE_COLORS[idx] }} />
                    <span className="truncate">{wd.name}</span>
                  </span>
                  <span className="font-bold shrink-0">{wd.value} ({wd.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL VIEW: GENDER */}
      {activeTab === 'gender' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeGenderIndex}
                  activeShape={renderActiveShape}
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveGenderIndex(index)}
                >
                  {genderData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Analisis Komposisi Gender Siswa
            </h4>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-xs font-bold text-blue-900">Siswa Laki-Laki</div>
                <div className="text-xl font-black text-blue-700 mt-0.5">{maleCount} Siswa</div>
                <div className="text-[11px] text-blue-800 mt-1">{genderData[0].percentage}% dari total populasi aktif</div>
              </div>

              <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                <div className="text-xs font-bold text-pink-900">Siswa Perempuan</div>
                <div className="text-xl font-black text-pink-700 mt-0.5">{femaleCount} Siswa</div>
                <div className="text-[11px] text-pink-800 mt-1">{genderData[1].percentage}% dari total populasi aktif</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL VIEW: TRACK */}
      {activeTab === 'track' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeTrackIndex}
                  activeShape={renderActiveShape}
                  data={trackData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveTrackIndex(index)}
                >
                  {trackData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={TRACK_COLORS[index % TRACK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Rincian Jalur Penerimaan Siswa Baru
            </h4>
            <div className="space-y-2">
              {trackData.map((t, idx) => (
                <div key={t.name} className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: TRACK_COLORS[idx] }} />
                    <span className="font-semibold text-slate-800">{t.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900">{t.value}</span>
                    <span className="text-[10px] text-slate-500 ml-1">({t.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL VIEW: GRADE */}
      {activeTab === 'grade' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeGradeIndex}
                  activeShape={renderActiveShape}
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveGradeIndex(index)}
                >
                  {gradeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={GRADE_COLORS[index % GRADE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Distribusi Rombongan Belajar
            </h4>
            <div className="space-y-2">
              {gradeData.map((g, idx) => (
                <div key={g.name} className="p-3 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: GRADE_COLORS[idx] }} />
                      <span>{g.name}</span>
                    </span>
                    <span className="text-sm text-indigo-700">{g.value} Siswa</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Mencakup rombel kelas A, B, C &bull; Proporsi {g.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DETAIL VIEW: WELFARE */}
      {activeTab === 'welfare' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  activeIndex={activeWelfareIndex}
                  activeShape={renderActiveShape}
                  data={welfareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveWelfareIndex(index)}
                >
                  {welfareData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={WELFARE_COLORS[index % WELFARE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Cakupan Bantuan Sosial Siswa
            </h4>
            <div className="space-y-2">
              {welfareData.map((w, idx) => (
                <div key={w.name} className="p-3 rounded-lg bg-white border border-slate-200">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: WELFARE_COLORS[idx] }} />
                      <span>{w.name}</span>
                    </span>
                    <span className="text-sm text-emerald-700">{w.value} Siswa</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Proporsi: {w.percentage}% dari total siswa terdaftar
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
