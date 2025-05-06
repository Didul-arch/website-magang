"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, FileSpreadsheet, Users } from "lucide-react"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  university: string
  major: string
  semester: string
  idCardUrl: string
  progress: {
    registration: boolean
    readSOP: boolean
    completedTest: boolean
  }
  testResult?: {
    score: number
    isPassed: boolean
    completedAt: string
  }
  createdAt: string
}

export default function ExportPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users")
        const usersQuery = query(usersCollection, where("role", "==", "user"))
        const usersSnapshot = await getDocs(usersQuery)

        const fetchedUsers: User[] = []
        usersSnapshot.forEach((doc) => {
          fetchedUsers.push({
            id: doc.id,
            ...doc.data(),
          } as User)
        })

        setUsers(fetchedUsers)
      } catch (error) {
        console.error("Error fetching users:", error)
        toast({
          variant: "destructive",
          title: "Terjadi kesalahan",
          description: "Gagal memuat data peserta.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [toast])

  const exportToCSV = (data: any[], filename: string) => {
    // Convert object array to CSV string
    const csvRows = []

    // Get headers
    const headers = Object.keys(data[0])
    csvRows.push(headers.join(","))

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header]
        // Handle nested objects and arrays
        const escaped =
          typeof value === "object" && value !== null
            ? JSON.stringify(value).replace(/"/g, '""')
            : String(value).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvRows.push(values.join(","))
    }

    // Create and download CSV file
    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const exportAllData = () => {
    if (users.length === 0) {
      toast({
        variant: "destructive",
        title: "Tidak ada data",
        description: "Tidak ada data peserta untuk diekspor.",
      })
      return
    }

    try {
      exportToCSV(users, "peserta-magang.csv")

      toast({
        title: "Ekspor berhasil",
        description: "Data peserta berhasil diekspor ke CSV.",
      })
    } catch (error) {
      console.error("Error exporting data:", error)
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Gagal mengekspor data peserta.",
      })
    }
  }

  const exportTestResults = () => {
    const usersWithTest = users.filter((user) => user.progress.completedTest && user.testResult)

    if (usersWithTest.length === 0) {
      toast({
        variant: "destructive",
        title: "Tidak ada data",
        description: "Tidak ada data hasil tes untuk diekspor.",
      })
      return
    }

    try {
      // Prepare simplified data for export
      const exportData = usersWithTest.map((user) => ({
        fullName: user.fullName,
        email: user.email,
        university: user.university,
        major: user.major,
        score: user.testResult?.score || 0,
        isPassed: user.testResult?.isPassed ? "Ya" : "Tidak",
        completedAt: user.testResult?.completedAt || "",
      }))

      exportToCSV(exportData, "hasil-tes-magang.csv")

      toast({
        title: "Ekspor berhasil",
        description: "Data hasil tes berhasil diekspor ke CSV.",
      })
    } catch (error) {
      console.error("Error exporting test results:", error)
      toast({
        variant: "destructive",
        title: "Terjadi kesalahan",
        description: "Gagal mengekspor data hasil tes.",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Export Data</h1>
        <p className="text-muted-foreground">Ekspor data peserta program magang PT Mada Wikri Tunggal</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Semua Data</TabsTrigger>
          <TabsTrigger value="test-results">Hasil Tes</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ekspor Semua Data Peserta</CardTitle>
              <CardDescription>Ekspor semua data peserta program magang ke file CSV</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-6">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium">Data Peserta</p>
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? "Memuat..." : `${users.length} peserta terdaftar`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={exportAllData} disabled={isLoading || users.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Ekspor ke CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="test-results" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ekspor Hasil Tes</CardTitle>
              <CardDescription>Ekspor data hasil tes peserta program magang ke file CSV</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="rounded-full bg-primary/10 p-6">
                    <FileSpreadsheet className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-medium">Hasil Tes</p>
                    <p className="text-sm text-muted-foreground">
                      {isLoading
                        ? "Memuat..."
                        : `${users.filter((u) => u.progress.completedTest).length} peserta telah menyelesaikan tes`}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={exportTestResults}
                disabled={isLoading || users.filter((u) => u.progress.completedTest).length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Ekspor Hasil Tes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
