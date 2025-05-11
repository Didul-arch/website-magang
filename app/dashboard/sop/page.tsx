"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";

export default function SOPPage() {
  // const { user } = useAuth()
  const [hasRead, setHasRead] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyRead, setAlreadyRead] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // useEffect(() => {
  //   const checkUserProgress = async () => {
  //     if (!user) return

  //     try {
  //       const userDocRef = doc(db, "users", user.uid)
  //       const userDoc = await getDoc(userDocRef)

  //       if (userDoc.exists()) {
  //         const userData = userDoc.data()
  //         if (userData.progress?.readSOP) {
  //           setAlreadyRead(true)
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error checking user progress:", error)
  //     }
  //   }

  //   checkUserProgress()
  // }, [user])

  // const handleConfirmRead = async () => {
  //   if (!user) return

  //   try {
  //     setIsSubmitting(true)
  //     const userDocRef = doc(db, "users", user.uid)

  //     await updateDoc(userDocRef, {
  //       "progress.readSOP": true,
  //     })

  //     toast({
  //       title: "SOP telah dibaca",
  //       description: "Status Anda telah diperbarui.",
  //     })

  //     router.push("/dashboard")
  //   } catch (error) {
  //     console.error("Error updating user progress:", error)
  //     toast({
  //       variant: "destructive",
  //       title: "Terjadi kesalahan",
  //       description: "Gagal memperbarui status. Silakan coba lagi.",
  //     })
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Standar Operasional Prosedur
        </h1>
        <p className="text-muted-foreground">
          Baca dan pahami SOP program magang PT Mada Wikri Tunggal
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SOP Program Magang</CardTitle>
          <CardDescription>
            Dokumen ini berisi informasi penting tentang program magang
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-md border p-4">
            <div className="prose max-w-none dark:prose-invert">
              <h2>Standar Operasional Prosedur (SOP) Program Magang</h2>

              <h3>1. Ketentuan Umum</h3>
              <p>
                Program magang PT Mada Wikri Tunggal berlangsung selama 6 bulan
                dengan jam kerja Senin-Jumat, 09.00-17.00 WIB. Peserta magang
                diharapkan untuk mematuhi semua peraturan perusahaan selama
                mengikuti program.
              </p>

              <h3>2. Hak dan Kewajiban</h3>
              <p>
                <strong>Hak Peserta Magang:</strong>
              </p>
              <ul>
                <li>Mendapatkan bimbingan dari mentor yang ditunjuk</li>
                <li>
                  Memperoleh sertifikat magang setelah menyelesaikan program
                </li>
                <li>Mendapatkan tunjangan transportasi sesuai ketentuan</li>
                <li>
                  Menggunakan fasilitas perusahaan sesuai dengan izin yang
                  diberikan
                </li>
              </ul>

              <p>
                <strong>Kewajiban Peserta Magang:</strong>
              </p>
              <ul>
                <li>Mematuhi jam kerja yang telah ditentukan</li>
                <li>
                  Menyelesaikan tugas yang diberikan dengan baik dan tepat waktu
                </li>
                <li>Menjaga kerahasiaan informasi perusahaan</li>
                <li>
                  Berpakaian rapi dan sopan selama berada di lingkungan
                  perusahaan
                </li>
                <li>Mengikuti evaluasi berkala yang dijadwalkan</li>
              </ul>

              <h3>3. Proses Seleksi</h3>
              <p>Proses seleksi program magang terdiri dari beberapa tahap:</p>
              <ol>
                <li>Pendaftaran online dan verifikasi dokumen</li>
                <li>Tes seleksi online</li>
                <li>Wawancara dengan tim HR dan departemen terkait</li>
                <li>Pengumuman hasil seleksi</li>
              </ol>

              <h3>4. Evaluasi dan Penilaian</h3>
              <p>Peserta magang akan dievaluasi berdasarkan:</p>
              <ul>
                <li>Kualitas pekerjaan (40%)</li>
                <li>Kedisiplinan dan kehadiran (20%)</li>
                <li>Kemampuan bekerja dalam tim (20%)</li>
                <li>Inisiatif dan kreativitas (20%)</li>
              </ul>

              <h3>5. Penghentian Program</h3>
              <p>Program magang dapat dihentikan sebelum masa berakhir jika:</p>
              <ul>
                <li>Peserta melanggar peraturan perusahaan secara serius</li>
                <li>
                  Peserta tidak hadir tanpa keterangan selama 3 hari
                  berturut-turut
                </li>
                <li>
                  Peserta mengundurkan diri dengan pemberitahuan minimal 2
                  minggu sebelumnya
                </li>
              </ul>

              <h3>6. Sertifikasi</h3>
              <p>
                Sertifikat magang akan diberikan kepada peserta yang telah
                menyelesaikan program dengan baik. Sertifikat ini mencakup
                informasi tentang durasi magang, departemen, dan kompetensi yang
                telah dikuasai.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start space-y-4">
          {!alreadyRead ? (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={hasRead}
                  onCheckedChange={(checked) => setHasRead(checked as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Saya telah membaca dan memahami SOP Program Magang PT Mada
                  Wikri Tunggal
                </label>
              </div>
              {/* <Button onClick={handleConfirmRead} disabled={!hasRead || isSubmitting}>
                {isSubmitting ? "Memproses..." : "Konfirmasi Telah Membaca"}
              </Button> */}
            </>
          ) : (
            <div className="rounded-md bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400">
              <p>Anda telah membaca dan memahami SOP Program Magang.</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
