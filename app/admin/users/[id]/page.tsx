"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useToast } from "@/components/ui/use-toast"

interface UserDetails {
  fullName: string
  email: string
  phoneNumber: string
  university: string
  major: string
  semester: string
  idCardBase64?: string
  idCardFileName?: string
  progress: {
    registration: boolean
    readSOP: boolean
    completedTest: boolean
  }
  testResult?: {
    score: number
    isPassed: boolean
    answers: Record<string, string>
    completedAt: string
  }
  createdAt: string
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<UserDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const userDocRef = doc(db, "users", params.id)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          setUser(userDoc.data() as UserDetails)
        } else {
          toast({
            variant: "destructive",
            title: "Pengguna tidak ditemukan",
            description: "Data pengguna yang Anda cari tidak ditemukan.",
          })
          router.push("/admin")
        }
      } catch (error) {
        console.error("Error fetching user details:", error)
        toast({
          variant: "destructive",
          title: "Terjadi kesalahan",
          description: "Gagal memuat data pengguna.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserDetails()
  }, [params.id, router, toast])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Pengguna Tidak Ditemukan</h1>
        </div>
        <p>Data pengguna yang Anda cari tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.fullName}</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="id-card">KTP/KTM</TabsTrigger>
          <TabsTrigger value="test-results">Hasil Tes</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
              <CardDescription>Detail informasi pribadi peserta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                  <p>{user.fullName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nomor HP</p>
                  <p>{user.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tanggal Pendaftaran</p>
                  <p>
                    {new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Informasi Akademik</CardTitle>
              <CardDescription>Detail informasi akademik peserta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Universitas</p>
                  <p>{user.university}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Jurusan</p>
                  <p>{user.major}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Semester</p>
                  <p>{user.semester}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status Progres</CardTitle>
              <CardDescription>Progres pendaftaran peserta</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  {user.progress.registration ? (
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="mr-2 h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Registrasi</p>
                    <p className="text-sm text-muted-foreground">
                      {user.progress.registration ? "Selesai" : "Belum selesai"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  {user.progress.readSOP ? (
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="mr-2 h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Baca SOP</p>
                    <p className="text-sm text-muted-foreground">
                      {user.progress.readSOP ? "Selesai" : "Belum selesai"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center">
                  {user.progress.completedTest ? (
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="mr-2 h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">Tes Online</p>
                    <p className="text-sm text-muted-foreground">
                      {user.progress.completedTest ? "Selesai" : "Belum selesai"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="id-card">
          <Card>
            <CardHeader>
              <CardTitle>KTP/KTM</CardTitle>
              <CardDescription>Dokumen identitas peserta</CardDescription>
            </CardHeader>
            <CardContent>
              {user.idCardBase64 ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="max-w-md overflow-hidden rounded-lg border">
                    {user.idCardFileName?.toLowerCase().endsWith(".pdf") ? (
                      <div className="flex h-40 items-center justify-center bg-muted p-4">
                        <p className="text-center text-muted-foreground">
                          File PDF tidak dapat ditampilkan. Silakan unduh untuk melihat.
                        </p>
                      </div>
                    ) : (
                      <img
                        src={user.idCardBase64 || "/placeholder.svg"}
                        alt="KTP/KTM"
                        className="max-h-96 w-full object-contain"
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">Nama file: {user.idCardFileName || "Dokumen KTP/KTM"}</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Create a download link for the base64 image
                      const link = document.createElement("a")
                      link.href = user.idCardBase64 as string
                      link.download = user.idCardFileName || "dokumen-identitas"
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }}
                  >
                    Unduh Dokumen
                  </Button>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-muted-foreground">Tidak ada dokumen KTP/KTM yang diunggah</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test-results">
          <Card>
            <CardHeader>
              <CardTitle>Hasil Tes</CardTitle>
              <CardDescription>Hasil tes seleksi peserta</CardDescription>
            </CardHeader>
            <CardContent>
              {user.testResult ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center justify-center space-y-2 py-6">
                    <div className="text-6xl font-bold">{user.testResult.score}%</div>
                    <p className="text-sm text-muted-foreground">
                      Tes diselesaikan pada{" "}
                      {new Date(user.testResult.completedAt).toLocaleDateString("id-ID", {
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
                      {user.testResult.isPassed ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">Lolos ke Tahap Wawancara</p>
                            <p className="text-sm text-muted-foreground">
                              Peserta telah lolos ke tahap wawancara program magang.
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <div>
                            <p className="font-medium">Belum Lolos ke Tahap Wawancara</p>
                            <p className="text-sm text-muted-foreground">
                              Peserta belum lolos ke tahap wawancara program magang.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-muted-foreground">Peserta belum menyelesaikan tes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
