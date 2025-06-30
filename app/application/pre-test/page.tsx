"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";

export default function PreTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id");

  if (!applicationId) {
    return (
      <div className="container mx-auto p-6 max-w-2xl text-center">
        <p>ID Lamaran tidak ditemukan.</p>
        <Button onClick={() => router.push("/application")} className="mt-4">
          Kembali ke Lamaran
        </Button>
      </div>
    );
  }

  const handleStartTest = () => {
    router.push(`/application/test?id=${applicationId}`);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">SOP Pengerjaan Tes Online</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <p>
              Selamat datang di halaman tes online PT Mada Wikri Tunggal. Mohon perhatikan beberapa aturan berikut sebelum memulai tes:
            </p>
            <ul>
              <li>Pastikan koneksi internet Anda stabil selama pengerjaan tes.</li>
              <li>Tes ini memiliki batas waktu. Waktu akan dimulai saat Anda menekan tombol "Kerjakan Tes Sekarang".</li>
              <li>Dilarang membuka tab baru, window baru, atau aplikasi lain selama tes berlangsung.</li>
              <li>Setiap tindakan kecurangan akan terdeteksi oleh sistem dan dapat mengakibatkan diskualifikasi.</li>
              <li>Pastikan Anda berada di lingkungan yang tenang dan kondusif untuk fokus mengerjakan tes.</li>
            </ul>
            <p className="font-semibold">
              Dengan menekan tombol "Kerjakan Tes Sekarang", Anda dianggap telah membaca, memahami, dan menyetujui semua aturan yang disebutkan di atas.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={() => router.push("/application")}>
              Kembali
            </Button>
            <Button onClick={handleStartTest}>
              Kerjakan Tes Sekarang
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
