"use client";

import React, { useContext } from "react";
import { AuthContext } from "@/lib/utils/supabase/provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  FileText,
  CheckCircle,
  ArrowRight,
  UserCircle,
  Loader2,
} from "lucide-react";
import { useStore } from "@/lib/stores/user.store";

export default function DashboardWelcomePage() {
  const userData = useStore((state) => state.user);
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  // window.location.reload();

  // console.log("tes1")
  // console.log(user)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Memuat sesi Anda...</p>
      </div>
    );
  }

  // console.log("tes2")
  // console.log(user)

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
        <UserCircle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold">Sesi Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-4">
          Anda tidak sedang login. Silakan login untuk mengakses dashboard.
        </p>
        <Button onClick={() => router.push("/login")}>Ke Halaman Login</Button>
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || user.email || "Tamu";

  return (
    <div className="space-y-8 py-6">
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl border-none">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            Selamat Datang, {userData?.name}!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Gunakan navigasi di samping untuk mengakses halaman tes atau melihat
            hasil Anda nanti. Pastikan Anda selalu memantau informasi terbaru
            terkait proses seleksi.
          </p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Tes Online
            </CardTitle>
            <CardDescription>
              Akses halaman untuk mengerjakan tes seleksi online.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.push("/dashboard/test")}
              className="w-full"
            >
              Kerjakan Tes <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Hasil Tes
            </CardTitle>
            <CardDescription>
              Lihat hasil tes Anda setelah periode penilaian selesai.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.push("/dashboard/results")}
              className="w-full"
              variant="outline"
            >
              Lihat Hasil <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Penting</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Pengumuman kelulusan akan dilakukan setelah periode pendaftaran dan
            seleksi berakhir. Harap periksa email Anda secara berkala dan
            halaman "Hasil Tes" untuk pembaruan. Semoga berhasil!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
