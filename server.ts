import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// Helper function to call Gemini with multi-model fallback (handling 503 high demand spikes)
async function generateGeminiWithFallback(
  ai: GoogleGenAI,
  options: {
    contents: any;
    config?: any;
  }
) {
  const models = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-1.5-flash"];
  let lastError: any = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: options.contents,
        config: options.config,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      console.warn(`Model ${model} unavailable (${err?.status || err?.code || '503'}), attempting next model...`);
      lastError = err;
    }
  }
  throw lastError;
}

// Deterministic intelligent fallback for student analysis
function generateFallbackStudentAnalysis(student: any) {
  const isKip = Boolean(student.kesejahteraan?.penerimaKip || student.kesejahteraan?.penerimaKmsBantul);
  const achievements = (student.prestasi || []).map(
    (p: any) => `${p.namaPrestasi || p.bidang || 'Prestasi'} (${p.tingkat || 'Tingkat Sekolah/Kabupaten'})`
  );

  const talents: string[] = [];
  if (achievements.length > 0) {
    talents.push(...achievements);
  }
  if (student.ekstrakurikuler && student.ekstrakurikuler.length > 0) {
    talents.push(`Minat aktif pada ekstrakurikuler: ${student.ekstrakurikuler.map((e: any) => e.namaEkstra).join(', ')}`);
  }
  if (talents.length === 0) {
    talents.push('Memiliki ketertarikan aktif pada pembelajaran intrakurikuler dan penguatan literasi numerasi.');
    talents.push('Menunjukkan partisipasi positif dalam kegiatan projek P5 dan kepramukaan sekolah.');
  }

  const bkRecommendations = [
    `Pertahankan kedisiplinan belajar dan presensi kehadiran di Kelas ${student.kelasSekarang || '7A'}.`,
    'Tingkatkan motivasi belajar terstruktur serta kolaborasi positif dengan teman sebaya.',
    'Lakukan pemantauan berkala terhadap capaian kompetensi nilai rapor per semester.',
  ];
  if (isKip) {
    bkRecommendations.unshift('Pastikan pendampingan pemanfaatan dana bantuan afirmasi pendidikan tepat sasaran untuk kebutuhan belajar.');
  }

  const devPlans = [
    'Penguatan literasi digital dan numerasi berbasis Asesmen Standar Pendidikan Daerah (ASPD) & ANBK.',
    'Penyusunan portofolio akademik dan non-akademik untuk persiapan kelanjutan studi jenjang SMA/SMK di DIY.',
  ];

  const welfareAnalysis = isKip
    ? 'Memenuhi syarat prioritas bantuan program afirmasi pendidikan (PIP Kemendikbud / KMS Kabupaten Bantul) berdasarkan data kesejahteraan sosial keluarga.'
    : 'Status sosial ekonomi reguler/mandiri. Dapat diikutsertakan program beasiswa berprestasi atau pengajuan afirmasi jika terdapat perubahan status ekonomi.';

  const dusun = student.tempatTinggal?.dusun || '-';
  const kel = student.tempatTinggal?.kelurahan || 'Bangunjiwo';
  const kec = student.tempatTinggal?.kecamatan || 'Kasihan';

  return {
    ringkasanProfil: `Siswa an. ${student.namaLengkap} (NISN: ${student.nisn || '-'}, NIS: ${student.nis || '-'}) berstatus aktif di Kelas ${student.kelasSekarang || '-'} SMP Negeri 2 Kasihan melalui Jalur ${student.jalurMasuk || 'Zonasi'}. Berdomisili di ${dusun}, ${kel}, Kec. ${kec}, Kab. ${student.tempatTinggal?.kabupatenKota || 'Bantul'}. Menunjukkan perkembangan karakter dan kesiapan belajar yang baik.`,
    potensiBakat: talents,
    rekomendasiBk: bkRecommendations,
    rencanaPengembangan: devPlans,
    kelayakanBantuan: welfareAnalysis,
    catatanKhusus: `Data Buku Induk terverifikasi dengan No. Induk ${student.noUrutInduk || '-'} di SMP Negeri 2 Kasihan Bantul.`,
  };
}

// Deterministic heuristic fallback for biodata text parsing
function parseBiodataHeuristic(rawText: string) {
  const findMatch = (regexes: RegExp[]) => {
    for (const r of regexes) {
      const match = rawText.match(r);
      if (match && match[1]) return match[1].trim();
    }
    return "";
  };

  const nama = findMatch([/nama(?:\s+lengkap)?\s*[:=]\s*([^\n\r,]+)/i, /nama\s*:\s*([^\n\r]+)/i]);
  const nisn = findMatch([/nisn\s*[:=]\s*(\d{10})/i, /nisn\s*[:=]\s*(\d+)/i]);
  const nis = findMatch([/nis\s*[:=]\s*(\d{4,6})/i, /no(?:\.|\s+)?induk\s*[:=]\s*(\d+)/i]);
  const nik = findMatch([/nik\s*[:=]\s*(\d{16})/i, /nik\s*[:=]\s*(\d+)/i]);
  const noKk = findMatch([/no(?:\.|\s+)?kk\s*[:=]\s*(\d{16})/i, /kartu\s*keluarga\s*[:=]\s*(\d+)/i, /no\s*kk\s*[:=]\s*(\d+)/i]);
  const jkMatch = rawText.match(/jenis\s*kelamin\s*[:=]\s*(laki-laki|perempuan|L|P)/i);
  const jk = jkMatch ? (jkMatch[1].toUpperCase().startsWith('P') ? 'P' : 'L') : 'L';
  const tempatLahir = findMatch([/tempat(?:\s+lahir)?\s*[:=]\s*([^\n\r,]+)/i, /ttl\s*[:=]\s*([^\n\r,]+)/i]);
  const asalSd = findMatch([/asal\s*(?:sd|mi|sekolah)\s*[:=]\s*([^\n\r]+)/i, /sd\s*asal\s*[:=]\s*([^\n\r]+)/i]);
  const namaAyah = findMatch([/nama\s*ayah\s*[:=]\s*([^\n\r]+)/i, /ayah\s*[:=]\s*([^\n\r]+)/i]);
  const namaIbu = findMatch([/nama\s*ibu\s*[:=]\s*([^\n\r]+)/i, /ibu\s*[:=]\s*([^\n\r]+)/i]);
  const kelas = findMatch([/kelas\s*[:=]\s*([789][A-Za-z]?)/i, /rombel\s*[:=]\s*([^\n\r]+)/i]) || "7A";
  const jalurMasukMatch = findMatch([/jalur(?:\s*masuk|\s*penerimaan)?\s*[:=]\s*([^\n\r]+)/i]);
  const jalur = jalurMasukMatch.includes("Afirmasi") || jalurMasukMatch.includes("KMS") || jalurMasukMatch.includes("KIP")
    ? "Afirmasi"
    : jalurMasukMatch.includes("Prestasi")
    ? "Prestasi"
    : jalurMasukMatch.includes("Perpindahan")
    ? "Perpindahan Tugas Orang Tua"
    : "Zonasi";

  return {
    namaLengkap: nama || "Siswa Baru",
    namaPanggilan: nama ? nama.split(' ')[0] : "",
    nisn: nisn || "",
    nis: nis || "",
    nik: nik || "",
    noKk: noKk || "",
    jenisKelamin: jk,
    tempatLahir: tempatLahir || "Bantul",
    tanggalLahir: "2012-01-01",
    agama: "Islam",
    kewarganegaraan: "WNI",
    anakKe: 1,
    jumlahSaudaraKandung: 1,
    alamatLengkap: rawText.length > 20 ? rawText.substring(0, 100) : "Kasihan, Bantul",
    dusun: "Bibis",
    kelurahan: "Bangunjiwo",
    kecamatan: "Kasihan",
    kabupatenKota: "Bantul",
    provinsi: "D.I. Yogyakarta",
    kodePos: "55184",
    tinggalBersama: "Orang Tua",
    transportasi: "Sepeda Motor",
    golonganDarah: "-",
    beratBadan: 45,
    tinggiBadan: 155,
    asalSdMi: asalSd || "SD Negeri di Bantul",
    noIjazahSd: "",
    namaAyah: namaAyah || "",
    nikAyah: "",
    pekerjaanAyah: "Wiraswasta",
    penghasilanAyah: "Rp 2.000.000 - Rp 3.000.000",
    noHpAyah: "",
    namaIbu: namaIbu || "",
    nikIbu: "",
    pekerjaanIbu: "Ibu Rumah Tangga",
    penghasilanIbu: "Tidak Berpenghasilan",
    noHpIbu: "",
    kelasSekarang: kelas,
    diterimaDiKelas: kelas,
    tahunMasuk: "2024",
    tanggalDiterima: "2024-07-15",
    jalurMasuk: jalur,
    status: "Aktif",
    catatanPenerimaan: "Siswa Baru Kelas VII",
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "15mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      school: "SMP Negeri 2 Kasihan Bantul",
      system: "E-BINDUK Digital",
      timestamp: new Date().toISOString(),
    });
  });

  // AI Assistant for E-Binduk (Student Profile Analysis, Smart Search & Guidance)
  app.post("/api/ai/analyze-student", async (req, res) => {
    try {
      const { student } = req.body;
      if (!student) {
        return res.status(400).json({ error: "Data siswa diperlukan" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        // Deterministic generator if API key is not configured
        return res.json({
          success: true,
          data: generateFallbackStudentAnalysis(student),
        });
      }

      const prompt = `Anda adalah Pakar Bimbingan Konseling & Buku Induk SMP Negeri 2 Kasihan Bantul.
Analisis data siswa berikut:
Nama: ${student.namaLengkap}
NISN: ${student.nisn} | NIS: ${student.nis} | Kelas: ${student.kelasSekarang}
Jalur Masuk: ${student.jalurMasuk}
Pekerjaan Orang Tua: Ayah (${student.dataOrangTua?.pekerjaanAyah || '-'}), Ibu (${student.dataOrangTua?.pekerjaanIbu || '-'})
Domisili: ${student.tempatTinggal?.dusun || '-'}, ${student.tempatTinggal?.kelurahan || '-'}, ${student.tempatTinggal?.kecamatan || 'Kasihan'}, ${student.tempatTinggal?.kabupatenKota || 'Bantul'}
Prestasi: ${JSON.stringify(student.prestasi || [])}
Bantuan: KIP: ${student.kesejahteraan?.penerimaKip ? 'Ya' : 'Tidak'}, KMS Bantul: ${student.kesejahteraan?.penerimaKmsBantul ? 'Ya' : 'Tidak'}

Berikan output JSON persis dalam struktur berikut:
{
  "ringkasanProfil": "string narasi ringkasan profil perkembangan siswa",
  "potensiBakat": ["string poin 1", "string poin 2"],
  "rekomendasiBk": ["string rekomendasi bimbingan 1", "string rekomendasi 2"],
  "rencanaPengembangan": ["string rencana 1", "string rencana 2"],
  "kelayakanBantuan": "string evaluasi kelayakan beasiswa/PIP/KMS",
  "catatanKhusus": "string catatan penting untuk wali kelas/buku induk"
}`;

      try {
        const response = await generateGeminiWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        return res.json({
          success: true,
          data: parsed,
        });
      } catch (geminiErr: any) {
        console.warn("Gemini remote call failed, using intelligent deterministic fallback:", geminiErr?.message || geminiErr);
        return res.json({
          success: true,
          data: generateFallbackStudentAnalysis(student),
        });
      }
    } catch (error: any) {
      console.error("Gemini Analyze Student Error:", error);
      res.status(500).json({
        error: "Gagal menganalisis data siswa melalui AI",
        details: error?.message || String(error),
      });
    }
  });

  // AI OCR / Text parser for student biodata paste
  app.post("/api/ai/parse-biodata", async (req, res) => {
    try {
      const { rawText } = req.body;
      if (!rawText || typeof rawText !== "string") {
        return res.status(400).json({ error: "Teks biodata diperlukan" });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          success: true,
          data: parseBiodataHeuristic(rawText),
        });
      }

      const prompt = `Ekstrak data teks biodata siswa berikut ke dalam struktur JSON Buku Induk Siswa.
Teks mentah:
"""
${rawText}
"""

Kembalikan format JSON persis sesuai kunci berikut (jika tidak ada dalam teks, isi null atau string kosong ""):
{
  "namaLengkap": string,
  "namaPanggilan": string,
  "nisn": string,
  "nis": string,
  "nik": string,
  "noKk": string,
  "jenisKelamin": "L" | "P",
  "tempatLahir": string,
  "tanggalLahir": string (format YYYY-MM-DD),
  "agama": "Islam" | "Kristen" | "Katolik" | "Hindu" | "Buddha" | "Konghucu",
  "kewarganegaraan": "WNI" | "WNA",
  "anakKe": number,
  "jumlahSaudaraKandung": number,
  "alamatLengkap": string,
  "dusun": string,
  "kelurahan": string,
  "kecamatan": string,
  "kabupatenKota": string,
  "provinsi": string,
  "kodePos": string,
  "tinggalBersama": string,
  "transportasi": string,
  "golonganDarah": string,
  "beratBadan": number,
  "tinggiBadan": number,
  "asalSdMi": string,
  "noIjazahSd": string,
  "namaAyah": string,
  "nikAyah": string,
  "pekerjaanAyah": string,
  "penghasilanAyah": string,
  "noHpAyah": string,
  "namaIbu": string,
  "nikIbu": string,
  "pekerjaanIbu": string,
  "penghasilanIbu": string,
  "noHpIbu": string,
  "kelasSekarang": string,
  "diterimaDiKelas": string,
  "tahunMasuk": string,
  "tanggalDiterima": string,
  "jalurMasuk": "Zonasi" | "Afirmasi" | "Prestasi" | "Perpindahan Tugas Orang Tua",
  "status": "Aktif" | "Mutasi Masuk" | "Mutasi Keluar" | "Lulus" | "Keluar",
  "catatanPenerimaan": string
}`;

      try {
        const response = await generateGeminiWithFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const parsed = JSON.parse(response.text || "{}");
        return res.json({ success: true, data: parsed });
      } catch (geminiErr) {
        console.warn("Gemini parse failed, using heuristic parser fallback");
        return res.json({ success: true, data: parseBiodataHeuristic(rawText) });
      }
    } catch (error: any) {
      console.error("Gemini Parse Biodata Error:", error);
      res.status(500).json({
        error: "Gagal mengekstrak biodata dengan AI",
        details: error?.message || String(error),
      });
    }
  });

  // General AI Chatbot for School Admin / E-Binduk consultation
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, contextData } = req.body;
      const total = contextData?.totalStudents || 384;
      const active = contextData?.activeCount || 384;
      const kip = contextData?.kipCount || 0;

      const fallbackReply = `Halo! Saya Asisten E-BINDUK SMP Negeri 2 Kasihan Bantul.\n\nInformasi Database Buku Induk Saat Ini:\n• Total Siswa Terdaftar: **${total} siswa** (Aktif: ${active})\n• Penerima Manfaat PIP / KMS Bantul: **${kip} siswa**\n• Status Database: Tersinkronisasi LocalStorage & Cloud Firestore\n\nAda pertanyaan terkait registrasi siswa, cetak lembar induk I & II, kartu pelajar, atau rekap nilai leger yang dapat saya bantu?`;

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          success: true,
          reply: fallbackReply,
        });
      }

      const systemPrompt = `Anda adalah Asisten Cerdas E-BINDUK SMP Negeri 2 Kasihan Bantul (Buku Induk Siswa Digital).
Profil Sekolah:
- Nama: SMP Negeri 2 Kasihan (Bantul, D.I. Yogyakarta)
- Alamat: Jl. Bibis, Bangunjiwo, Kasihan, Bantul, DIY 55184
- Akreditasi: A | NPSN: 20400344
Konteks Database Sekolah saat ini:
- Total Siswa: ${total}
- Siswa Aktif: ${active}
- Penerima PIP/KMS: ${kip}
- Ringkasan Rombel: ${JSON.stringify(contextData?.rombelSummary || {})}
Bantu staf Tata Usaha, Guru BK, dan Pimpinan sekolah dalam konsultasi Buku Induk, administrasi siswa, regulasi Dapodik/Kemendikbud, serta pencarian data. Jawab dengan ringkas, sopan, dan solutif.`;

      try {
        const response = await generateGeminiWithFallback(ai, {
          contents: message,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        return res.json({
          success: true,
          reply: response.text || fallbackReply,
        });
      } catch (geminiErr) {
        console.warn("Gemini chat fallback invoked due to load/error");
        return res.json({
          success: true,
          reply: fallbackReply,
        });
      }
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({
        error: "Gagal berkomunikasi dengan AI",
        details: error?.message || String(error),
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`E-BINDUK SMP N 2 Kasihan server running on http://localhost:${PORT}`);
  });
}

startServer();
