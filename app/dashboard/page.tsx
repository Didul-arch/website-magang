"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/lib/firebase/auth-provider"

interface UserProgress {
  registration: boolean
  readSOP: boolean
  completedTest: boolean
}

export default function Dashboard() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<any>(null)
  const [progress, setProgress] = useState<UserProgress>({
    registration: false,
    readSOP: false,
    completedTest: false,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const data = userDoc.data()
          setUserData(data)
          setProgress(
            data.progress || {
              registration: true,
              readSOP: false,
              completedTest: false,
            },
          )
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const calculateProgressPercentage = () => {
    const steps = Object.values(progress)
    const completedSteps = steps.filter(Boolean).length
    return (completedSteps / steps.length) * 100
  }

  const getNextStep = () => {
    if (!progress.readSOP) {
      return {
        title: "Baca SOP",
        description: "Baca dan pahami SOP program magang",
        link: "/dashboard/sop",
      }
    }
    if (!progress.completedTest) {
      return {
        title: "Tes Online",
        description: "Kerjakan tes seleksi online",
        link: "/dashboard/test",
      }
    }
    return {
      title: "Lihat Hasil",
      description: "Lihat hasil tes dan status seleksi Anda",
      link: "/dashboard/results",
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const nextStep = getNextStep()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, {userData?.fullName || "Peserta"}! Pantau progres pendaftaran magang Anda.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progres Pendaftaran</CardTitle>
          <CardDescription>Selesaikan semua tahapan untuk menyelesaikan proses pendaftaran</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Progress value={calculateProgressPercentage()} className="h-2" />
              <p className="mt-2 text-sm text-muted-foreground">{Math.round(calculateProgressPercentage())}% selesai</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                {progress.registration ? (
                  <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                ) : (
                  <Circle className="mr-2 h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className={progress.registration ? "font-medium" : "text-muted-foreground"}>Registrasi</p>
                </div>
              </div>

              <div className="flex items-center">
                {progress.readSOP ? (
                  <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                ) : (
                  <Circle className="mr-2 h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className={progress.readSOP ? "font-medium" : "text-muted-foreground"}>Baca SOP</p>
                </div>
              </div>

              <div className="flex items-center">
                {progress.completedTest ? (
                  <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                ) : (
                  <Circle className="mr-2 h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <p className={progress.completedTest ? "font-medium" : "text-muted-foreground"}>Tes Online</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Langkah Selanjutnya</CardTitle>
          <CardDescription>Lanjutkan proses pendaftaran Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">{nextStep.title}</h3>
              <p className="text-sm text-muted-foreground">{nextStep.description}</p>
            </div>
            <Link href={nextStep.link}>
              <Button className="w-full sm:w-auto">
                Lanjutkan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
