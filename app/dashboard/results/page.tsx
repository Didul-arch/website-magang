"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/lib/firebase/auth-provider"

interface TestResult {
  score: number
  isPassed: boolean
  completedAt: string
}

export default function ResultsPage() {
  const { user } = useAuth()
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasCompletedTest, setHasCompletedTest] = useState(false)

  useEffect(() => {
    const fetchResults = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()

          if (userData.progress?.completedTest && userData.testResult) {
            setTestResult(userData.testResult)
            setHasCompletedTest(true)
          } else {
            setHasCompletedTest(false)
          }
        }
      } catch (error) {
        console.error("Error fetching results:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [user])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!hasCompletedTest) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hasil Tes</h1>
          <p className="text-muted-foreground">Hasil tes seleksi program magang PT Mada Wikri Tunggal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tes Belum Diselesaikan</CardTitle>
            <CardDescription>Anda belum menyelesaikan tes seleksi online</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>Anda perlu menyelesaikan tes seleksi online untuk melihat hasil.</p>
            <Link href="/dashboard/test">
              <Button>
                Kerjakan Tes
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hasil Tes</h1>
        <p className="text-muted-foreground">Hasil tes seleksi program magang PT Mada Wikri Tunggal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Skor Anda</CardTitle>
          <CardDescription>Hasil tes seleksi online program magang</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-2 py-6">
            <div className="text-6xl font-bold">{testResult?.score}%</div>
            <p className="text-sm text-muted-foreground">
              Tes diselesaikan pada{" "}
              {new Date(testResult?.completedAt || "").toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              {testResult?.isPassed ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium">Lolos ke Tahap Wawancara</p>
                    <p className="text-sm text-muted-foreground">
                      Selamat! Anda telah lolos ke tahap wawancara program magang PT Mada Wikri Tunggal.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Belum Lolos ke Tahap Wawancara</p>
                    <p className="text-sm text-muted-foreground">
                      Mohon maaf, Anda belum lolos ke tahap wawancara program magang PT Mada Wikri Tunggal.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Langkah Selanjutnya</h3>
            {testResult?.isPassed ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tim kami akan menghubungi Anda melalui email atau telepon untuk menjadwalkan sesi wawancara. Silakan
                  persiapkan diri Anda dengan baik.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Persiapkan dokumen pendukung seperti CV dan portofolio (jika ada)</li>
                  <li>Pelajari lebih lanjut tentang PT Mada Wikri Tunggal</li>
                  <li>Siapkan pertanyaan yang ingin Anda tanyakan saat wawancara</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Anda dapat mencoba kembali pada periode pendaftaran berikutnya. Gunakan waktu ini untuk meningkatkan
                  keterampilan dan pengetahuan Anda.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  <li>Tingkatkan keterampilan teknis yang relevan dengan posisi magang</li>
                  <li>Ikuti kursus atau pelatihan terkait</li>
                  <li>Kembangkan proyek portofolio untuk menunjukkan kemampuan Anda</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
