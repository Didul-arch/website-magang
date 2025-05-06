"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useAuth } from "@/lib/firebase/auth-provider"

interface Option {
  id: string
  text: string
  weight: number
}

interface Question {
  id: string
  text: string
  options: Option[]
}

export default function TestPage() {
  const { user } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasCompletedTest, setHasCompletedTest] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Check if user has already completed the test
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          if (userData.progress?.completedTest) {
            setHasCompletedTest(true)
            setIsLoading(false)
            return
          }
        }

        // Fetch questions
        const questionsCollection = collection(db, "questions")
        const questionsSnapshot = await getDocs(questionsCollection)

        const fetchedQuestions: Question[] = []
        questionsSnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Question, "id">
          fetchedQuestions.push({
            id: doc.id,
            ...data,
          })
        })

        setQuestions(fetchedQuestions)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Terjadi kesalahan",
          description: "Gagal memuat soal tes. Silakan coba lagi nanti.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, toast])

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const calculateScore = () => {
    let totalScore = 0
    let maxPossibleScore = 0

    questions.forEach((question) => {
      const selectedOptionId = answers[question.id]
      const selectedOption = question.options.find((option) => option.id === selectedOptionId)

      // Add the weight of the selected option to the total score
      if (selectedOption) {
        totalScore += selectedOption.weight
      }

      // Calculate max possible score by finding the highest weight option for each question
      const maxWeight = Math.max(...question.options.map((option) => option.weight))
      maxPossibleScore += maxWeight
    })

    // Convert to percentage
    const percentageScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0
    return Math.round(percentageScore)
  }

  const handleSubmit = async () => {
    if (!user) return

    // Check if all questions are answered
    const unansweredQuestions = questions.filter((q) => !answers[q.id])
    if (unansweredQuestions.length > 0) {
      toast({
        variant: "destructive",
        title: "Jawaban tidak lengkap",
        description: `Anda belum menjawab ${unansweredQuestions.length} pertanyaan. Silakan lengkapi semua jawaban.`,
      })
      return
    }

    try {
      setIsSubmitting(true)

      // Calculate score
      const score = calculateScore()
      const isPassed = score >= 70 // Threshold for passing

      // Save test results to Firestore
      const userDocRef = doc(db, "users", user.uid)

      await updateDoc(userDocRef, {
        "progress.completedTest": true,
        testResult: {
          score,
          isPassed,
          answers,
          completedAt: new Date().toISOString(),
        },
      })

      toast({
        title: "Tes berhasil diselesaikan",
        description: "Jawaban Anda telah disimpan. Silakan lihat hasil tes.",
      })

      router.push("/dashboard/results")
    } catch (error) {
      console.error("Error submitting test:", error)
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Gagal menyimpan jawaban. Silakan coba lagi.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (hasCompletedTest) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tes Online</h1>
          <p className="text-muted-foreground">Tes seleksi program magang PT Mada Wikri Tunggal</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tes Telah Diselesaikan</CardTitle>
            <CardDescription>Anda telah menyelesaikan tes seleksi online</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Anda telah menyelesaikan tes seleksi online program magang PT Mada Wikri Tunggal.</p>
            <p className="mt-2">Silakan lihat hasil tes Anda di halaman Hasil.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/results")}>Lihat Hasil</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tes Online</h1>
        <p className="text-muted-foreground">Tes seleksi program magang PT Mada Wikri Tunggal</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Petunjuk Pengerjaan</CardTitle>
          <CardDescription>Baca petunjuk berikut sebelum mengerjakan tes</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Tes terdiri dari {questions.length} soal pilihan ganda.</li>
            <li>Setiap soal memiliki bobot penilaian yang berbeda.</li>
            <li>Jawablah semua pertanyaan dengan teliti.</li>
            <li>Tidak ada batasan waktu, namun disarankan untuk menyelesaikan dalam satu sesi.</li>
            <li>Setelah mengirimkan jawaban, Anda tidak dapat mengubahnya kembali.</li>
          </ul>
        </CardContent>
      </Card>

      {questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle>Soal {index + 1}</CardTitle>
            <CardDescription>{question.text}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={answers[question.id]} onValueChange={(value) => handleAnswerChange(question.id, value)}>
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={`${question.id}-${option.id}`} />
                  <Label htmlFor={`${question.id}-${option.id}`}>{option.text}</Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Mengirim Jawaban..." : "Kirim Jawaban"}
          </Button>
          <p className="mt-2 text-sm text-muted-foreground text-center">
            Pastikan semua jawaban telah terisi sebelum mengirim
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
