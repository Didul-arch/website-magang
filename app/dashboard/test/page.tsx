"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SopModal from "@/components/sop-modal"; // Pastikan komponen ini ada
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { PlayCircle, CheckCircle, ArrowRight, Loader2, AlertTriangle } from "lucide-react";
import axiosInstance from "@/lib/axios";

interface TestStatus {
  hasCompletedTest: boolean;
}

export default function TestPage() {
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);
  const router = useRouter();
  const [testStatus, setTestStatus] = useState<TestStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestStatus = async () => {
      try {
        setIsLoadingStatus(true);
        setErrorStatus(null);
        const response = await axiosInstance.get<TestStatus>("/api/test-status");
        setTestStatus(response.data);
      } catch (err: any) {
        console.error("Failed to fetch test status:", err);
        setErrorStatus(err.response?.data?.message || "Gagal memuat status tes.");
      } finally {
        setIsLoadingStatus(false);
      }
    };
    fetchTestStatus();
  }, []);

  const handleOpenSopModal = () => setIsSopModalOpen(true);
  const handleCloseSopModal = () => setIsSopModalOpen(false);
  const handleAgreeSop = () => {
    setIsSopModalOpen(false);
    // Di sini idealnya Anda akan mengarahkan ke halaman pengerjaan tes yang sebenarnya
    // Untuk contoh ini, kita anggap /dashboard/test/start adalah halaman pengerjaan
    // router.push("/dashboard/test/start"); 
    alert("Navigasi ke halaman pengerjaan tes (belum diimplementasikan).");
  };

  if (isLoadingStatus) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Memeriksa status tes Anda...</p>
      </div>
    );
  }

  if (errorStatus) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle /> Terjadi Kesalahan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{errorStatus}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Silakan coba muat ulang halaman atau hubungi administrator jika masalah berlanjut.
          </p>
        </CardContent>
        <CardFooter>
            <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        </CardFooter>
      </Card>
    );
  }

  if (testStatus?.hasCompletedTest) {
    return (
      <Card className="max-w-lg mx-auto text-center shadow-lg">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Tes Telah Diselesaikan</CardTitle>
          <CardDescription>
            Anda sudah mengerjakan tes seleksi online.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Hasil tes akan diumumkan sesuai jadwal. Silakan periksa halaman "Hasil Tes" secara berkala.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/dashboard/results")} variant="outline">
            Lihat Halaman Hasil Tes
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-7 w-7 text-primary" />
            Tes Seleksi Online
          </CardTitle>
          <CardDescription>
            Kerjakan soal seleksi online. Pastikan Anda telah membaca dan memahami SOP pengerjaan tes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Tes ini bertujuan untuk mengukur kemampuan Anda. Harap kerjakan dengan jujur dan mandiri.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
            <li>Waktu pengerjaan tes terbatas.</li>
            <li>Pastikan koneksi internet Anda stabil.</li>
            <li>Dilarang membuka tab lain atau meminta bantuan selama tes.</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button size="lg" onClick={handleOpenSopModal} className="gap-1.5">
            Mulai Tes Sekarang
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      <SopModal
        isOpen={isSopModalOpen}
        onClose={handleCloseSopModal}
        onAgree={handleAgreeSop}
      />
    </>
  );
}