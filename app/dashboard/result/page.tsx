"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Hourglass } from "lucide-react";

export default function ResultsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hasil Tes Seleksi</h1>
        <p className="text-muted-foreground">
          Hasil tes Anda akan ditampilkan di sini setelah periode penilaian selesai.
        </p>
      </div>

      <Card className="text-center">
        <CardHeader>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                <Hourglass className="h-10 w-10 text-blue-600" />
            </div>
          <CardTitle>Menunggu Pengumuman</CardTitle>
          <CardDescription>
            Hasil tes seleksi online sedang dalam proses penilaian.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Harap bersabar dan periksa halaman ini secara berkala untuk pembaruan.
            Pengumuman juga akan dikirimkan melalui email terdaftar Anda.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}