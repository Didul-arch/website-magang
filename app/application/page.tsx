"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import axiosInstance from "@/lib/axios";
import { useStore } from "@/lib/stores/user.store";

interface UserData {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface Vacancy {
  id: number;
  title: string;
  location: string;
}

export default function ApplicationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vacancyId = searchParams.get("vacancy");
  const user = useStore((state) => state.user);
  const [vacancy, setVacancy] = useState<Vacancy | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [portoLink, setPortoLink] = useState("");
  const [alasan, setAlasan] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vacancy info
  useEffect(() => {
    const fetchVacancy = async () => {
      if (!vacancyId) return;
      try {
        const res = await axiosInstance.get(`/api/vacancy/${Number(vacancyId)}`);
        if (res.data?.data) setVacancy(res.data.data);
      } catch {
        setVacancy(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVacancy();
  }, [vacancyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isSubmitting || !user?.internship.id || !vacancyId) return; // Prevent submission while loading or if required data is missing

    if (!cvFile || !portoLink) {
      return toast.error("Mohon upload CV dan isi link portofolio.");
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("internshipId", user.internship.id?.toString());
      formData.append("vacancyId", vacancyId);
      formData.append("cv", cvFile);
      formData.append("portfolio", portoLink);
      formData.append("reason", alasan);
      const response = await axiosInstance.post("/api/vacancy/apply", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.status?.toString()?.startsWith("2")) {
        throw new Error(response.data?.message || "Gagal mengirim lamaran");
      }
      setSubmitted(true);
      toast.success("Lamaran berhasil dikirim! Akan diarahkan ke halaman tes.");
      setTimeout(() => router.push("/application/test-redirect"), 1500);
    } catch (err) {
      console.error("Error submitting application:", err);
      if (err instanceof Error) {
        toast.error(err.message || "Terjadi kesalahan saat mengirim lamaran.");
        return;
      }
      toast.error("Terjadi kesalahan saat mengirim lamaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto max-w-xl px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-primary">Pendaftaran Magang</h1>
          <p className="text-muted-foreground md:text-lg">Lengkapi data dan dokumen berikut untuk melamar posisi magang impianmu!</p>
        </div>
        <div className="flex items-center justify-center mb-8">
          <div className="flex gap-2 items-center">
            <div className="rounded-full bg-primary text-primary-foreground w-8 h-8 flex items-center justify-center font-bold">1</div>
            <span className="font-medium text-primary">Isi Formulir</span>
            <div className="w-8 h-1 bg-primary/30 rounded mx-2" />
            <div className="rounded-full bg-muted w-8 h-8 flex items-center justify-center font-bold text-muted-foreground">2</div>
            <span className="text-muted-foreground">Tes Online</span>
          </div>
        </div>
        <Card className="shadow-xl border-2 border-primary/10">
          <CardHeader>
            <CardTitle className="text-xl">Formulir Pendaftaran Magang</CardTitle>
            <CardDescription>
              Pastikan data dan dokumen yang diunggah sudah benar sebelum mengirim lamaran.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {user && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Anda mendaftar sebagai:</span>
                  <span className="font-semibold text-primary">{user.name} ({user.email})</span>
                  <span className="text-xs text-muted-foreground">No. HP: {user.phoneNumber}</span>
                </CardContent>
              </Card>
            )}
            {vacancy && (
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="p-4 flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Lowongan yang dipilih:</span>
                  <span className="font-semibold text-primary">{vacancy.title}</span>
                  <span className="text-xs text-muted-foreground">Lokasi: {vacancy.location}</span>
                </CardContent>
              </Card>
            )}
            {submitted ? (
              <div className="text-center py-8">
                <h2 className="text-xl font-bold mb-2 text-green-600">Pendaftaran Berhasil!</h2>
                <p className="text-muted-foreground mb-4">
                  Terima kasih telah mendaftar. Anda akan diarahkan ke halaman tes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Upload CV (PDF)</label>
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={e => setCvFile(e.target.files?.[0] || null)}
                    disabled={loading || isSubmitting}
                    required
                  />
                  <span className="text-xs text-muted-foreground">File akan disimpan di folder <b>cv</b> pada bucket <b>all</b>.</span>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Link Portofolio</label>
                  <Input
                    type="url"
                    placeholder="https://website-portofolio.com"
                    value={portoLink}
                    onChange={e => setPortoLink(e.target.value)}
                    disabled={loading || isSubmitting}
                    required
                  />
                  <span className="text-xs text-muted-foreground">Masukkan link website portofolio Anda.</span>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Alasan Melamar</label>
                  <Textarea
                    value={alasan}
                    onChange={e => setAlasan(e.target.value)}
                    disabled={loading || isSubmitting}
                    required
                    placeholder="Ceritakan motivasi Anda..."
                  />
                </div>
                <CardFooter className="p-0 pt-2">
                  <Button type="submit" className="w-full" disabled={loading || isSubmitting}>
                    Kirim Lamaran
                  </Button>
                </CardFooter>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
