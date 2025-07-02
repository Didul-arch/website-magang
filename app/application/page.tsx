"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Header from "@/components/header";
import { useStore } from "@/lib/stores/user.store";
import useApi from "@/hooks/useApi"; // Import hook yang baru
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SOP_CONTENT = (
  <div
    style={{ maxHeight: 320, overflowY: "auto" }}
    className="space-y-4 text-sm leading-relaxed"
  >
    <div>
      <h3 className="font-bold text-base mb-1">Pengertian</h3>
      <p>
        Bagian dari sistem pelatihan kerja yang diselenggarakan secara terpadu
        antara pelatihan di lembaga pelatihan dengan bekerja secara langsung di
        bawah bimbingan dan pengawasan instruktur atau pekerja yang lebih
        berpengalaman di perusahaan, dalam rangka menguasai ketrampilan atau
        keahlian tertentu.
      </p>
    </div>
    <div>
      <h3 className="font-bold text-base mb-1">Tujuan</h3>
      <ul className="list-disc pl-5">
        <li>
          <b>Bagi Perusahaan:</b> Memenuhi kebutuhan tenaga kerja di perusahaan
        </li>
        <li>
          <b>Bagi Pemagang:</b>
          <ul className="list-disc pl-5">
            <li>Mendapat pelatihan kerja</li>
            <li>
              Memberi motivasi untuk menjadi calon tenaga kerja yang handal dan
              siap kerja
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div>
      <h3 className="font-bold text-base mb-1">Kebijakan</h3>
      <ul className="list-decimal pl-5">
        <li>Undang-Undang No. 13 tentang Ketenagakerjaan</li>
        <li>
          Permenaker No. 6 Tahun 2020 tentang penyelenggaraan pemagangan dalam
          negeri
        </li>
        <li>Kebutuhan Perusahaan PT Mada Wikri Tunggal</li>
      </ul>
    </div>
    <div>
      <h3 className="font-bold text-base mb-1">Prosedur</h3>
      <ol className="list-decimal pl-5 space-y-1">
        <li>Calon pemagang mengajukan permohonan magang</li>
        <li>Lolos seleksi administrasi & wawancara</li>
        <li>Menandatangani surat perjanjian magang</li>
        <li>Wajib mentaati peraturan perusahaan</li>
        <li>Waktu magang 3 bulan (dapat diperpanjang sesuai kebijakan HRD)</li>
      </ol>
    </div>
    <div>
      <h3 className="font-bold text-base mb-1">Kewajiban Perusahaan</h3>
      <ul className="list-disc pl-5">
        <li>Memberikan sertifikat setelah magang selesai</li>
        <li>Memberikan uang saku sesuai perjanjian</li>
        <li>Memberikan perlindungan dan keselamatan kerja</li>
      </ul>
    </div>
    <div>
      <h3 className="font-bold text-base mb-1">Kewajiban Peserta Magang</h3>
      <ul className="list-disc pl-5">
        <li>Mentaati tata tertib perusahaan</li>
        <li>Berpakaian rapi dan sopan</li>
        <li>Jam kerja: 08.00 - 16.00</li>
        <li>Mengikuti kegiatan perusahaan (apel pagi setiap Senin)</li>
        <li>Bekerja profesional sesuai SPO</li>
        <li>Saling menghormati sesama karyawan</li>
        <li>Memberikan kinerja terbaik sesuai standar prosedur operasional</li>
      </ul>
    </div>
    <div>
      <h3 className="font-bold text-base mb-1">Hak Peserta Magang</h3>
      <ul className="list-disc pl-5">
        <li>Mendapatkan sertifikat magang</li>
        <li>Mendapatkan uang saku sesuai perjanjian</li>
        <li>Mendapatkan perlindungan keselamatan kerja</li>
        <li>Mendapatkan bimbingan magang yang kompeten</li>
      </ul>
    </div>
  </div>
);

interface Vacancy {
  id: number;
  title: string;
  location: string;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <ApplicationComponent />
    </Suspense>
  );
}

function ApplicationComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vacancyId = searchParams.get("vacancy");
  const user = useStore((state) => state.user);

  // Gunakan useApi untuk mengambil data lowongan
  const {
    data: vacancy,
    isLoading: isLoadingVacancy,
    request: fetchVacancy,
  } = useApi<Vacancy>();

  // Gunakan useApi untuk mengirim formulir
  const { isLoading: isSubmitting, request: submitApplication } = useApi();

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [portoLink, setPortoLink] = useState("");
  const [alasan, setAlasan] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showSopModal, setShowSopModal] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<React.FormEvent | null>(
    null
  );

  // Fetch vacancy info menggunakan useApi
  useEffect(() => {
    if (vacancyId) {
      fetchVacancy(
        {
          method: "GET",
          url: `/api/vacancy/${Number(vacancyId)}`,
        },
        {
          showToastOnError: true,
          errorMessage: "Gagal memuat detail lowongan.",
        }
      );
    }
  }, [vacancyId, fetchVacancy]);

  useEffect(() => {
    console.log("showSopModal state:", showSopModal);
  }, [showSopModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called");
    if (isSubmitting || !user?.internship?.id || !vacancyId) return;

    if (!cvFile || !portoLink) {
      toast.error("Mohon unggah CV dan isi link portofolio.");
      return;
    }

    // Tampilkan modal SOP sebelum submit
    setPendingSubmit(e);
    setShowSopModal(true);
    console.log("setShowSopModal(true) dipanggil");
  };

  // Fungsi untuk submit form setelah setuju SOP
  const handleSopAgree = async () => {
    setShowSopModal(false);
    if (!pendingSubmit) return;

    // submit ulang form
    if (isSubmitting || !user?.internship?.id || !vacancyId) return;

    const formData = new FormData();
    formData.append("internshipId", user.internship.id.toString());
    formData.append("vacancyId", vacancyId);
    formData.append("cv", cvFile!);
    formData.append("portfolio", portoLink);
    formData.append("reason", alasan);

    const { data: responseData } = await submitApplication(
      {
        method: "POST",
        url: "/api/vacancy/apply",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
      {
        showToastOnSuccess: true,
        successMessage:
          "Lamaran berhasil dikirim! Anda akan diarahkan ke halaman tes.",
      }
    );

    if (responseData) {
      const applicationId = (responseData as any)?.applicationId;
      setSubmitted(true);
      setTimeout(
        () => router.push(`/application/test?id=${applicationId}`),
        2000
      );
    }
    setPendingSubmit(null);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto max-w-xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">
            Pendaftaran Magang
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Lengkapi data dan dokumen berikut untuk melamar posisi magang
            impianmu!
          </p>
        </div>
        <div className="flex items-center justify-center mb-8">
          <div className="flex gap-2 items-center">
            <div className="rounded-full bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center font-bold">
              1
            </div>
            <span className="font-medium text-primary">Isi Formulir</span>
            <div className="w-8 h-1 bg-primary/30 rounded mx-2" />
            <div className="rounded-full bg-muted w-8 h-8 flex items-center justify-center font-bold text-muted-foreground">
              2
            </div>
            <span className="text-muted-foreground">Tes Online</span>
          </div>
        </div>
        <Card className="shadow-xl border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl">
              Formulir Pendaftaran Magang
            </CardTitle>
            <CardDescription>
              Pastikan data dan dokumen yang diunggah sudah benar sebelum
              mengirim lamaran.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    Anda mendaftar sebagai:
                  </span>
                  <span className="font-semibold text-primary">
                    {user.name} ({user.email})
                  </span>
                  <span className="text-xs text-muted-foreground">
                    No. HP: {user.phoneNumber}
                  </span>
                </CardContent>
              </Card>
            )}
            {vacancy && (
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4 flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">
                    Lowongan yang dipilih:
                  </span>
                  <span className="font-semibold text-primary">
                    {vacancy.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Lokasi: {vacancy.location}
                  </span>
                </CardContent>
              </Card>
            )}
            {submitted ? (
              <div className="text-center py-8">
                <h2 className="text-xl font-bold mb-2 text-green-600">
                  Pendaftaran Berhasil!
                </h2>
                <p className="text-muted-foreground mb-4">
                  Terima kasih telah mendaftar. Anda akan diarahkan ke halaman
                  tes.
                </p>
              </div>
            ) : (
              <>
                {console.log("Form rendered")}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Upload CV (PDF)
                    </label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      disabled={isLoadingVacancy || isSubmitting}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Link Portofolio
                    </label>
                    <Input
                      type="url"
                      placeholder="https://website-portofolio.com"
                      value={portoLink}
                      onChange={(e) => setPortoLink(e.target.value)}
                      disabled={isLoadingVacancy || isSubmitting}
                      required
                    />
                    <span className="text-xs text-muted-foreground">
                      Masukkan link website portofolio Anda.
                    </span>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Alasan Melamar
                    </label>
                    <Textarea
                      value={alasan}
                      onChange={(e) => setAlasan(e.target.value)}
                      disabled={isLoadingVacancy || isSubmitting}
                      required
                      placeholder="Ceritakan motivasi Anda..."
                    />
                  </div>
                  <CardFooter className="p-0 pt-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoadingVacancy || isSubmitting}
                      onClick={() => console.log("Button clicked")}
                    >
                      {isSubmitting ? "Mengirim..." : "Kirim Lamaran"}
                    </Button>
                  </CardFooter>
                </form>
              </>
            )}
          </CardContent>
        </Card>
        <AlertDialog open={showSopModal} onOpenChange={setShowSopModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Standar Operasional Prosedur (SOP) Magang
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                {SOP_CONTENT}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleSopAgree}>
                Setuju & Kirim Lamaran
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
