"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"

const formSchema = z
  .object({
    fullName: z.string().min(3, { message: "Nama harus minimal 3 karakter" }),
    email: z.string().email({ message: "Email tidak valid" }),
    phoneNumber: z.string().regex(/^(\+62|62|0)8[1-9][0-9]{6,9}$/, { message: "Nomor telepon tidak valid" }),
    university: z.string().min(3, { message: "Nama universitas harus minimal 3 karakter" }),
    major: z.string().min(2, { message: "Jurusan harus minimal 2 karakter" }),
    semester: z.string().min(1, { message: "Semester harus dipilih" }),
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
    confirmPassword: z.string().min(6, { message: "Konfirmasi password minimal 6 karakter" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password dan konfirmasi password tidak sama",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const [idCardFile, setIdCardFile] = useState<File | null>(null)
  const [idCardBase64, setIdCardBase64] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      university: "",
      major: "",
      semester: "",
      password: "",
      confirmPassword: "",
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setIdCardFile(file)

      // Convert file to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setIdCardBase64(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!idCardBase64) {
      toast({
        variant: "destructive",
        title: "File KTP/KTM diperlukan",
        description: "Silakan unggah file KTP atau KTM Anda",
      })
      return
    }

    try {
      setIsLoading(true)

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
      const user = userCredential.user

      // Save user data to Firestore with base64 image
      await setDoc(doc(db, "users", user.uid), {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        university: values.university,
        major: values.major,
        semester: values.semester,
        idCardBase64: idCardBase64,
        idCardFileName: idCardFile?.name,
        role: "user",
        progress: {
          registration: true,
          readSOP: false,
          completedTest: false,
        },
        createdAt: new Date().toISOString(),
      })

      toast({
        title: "Pendaftaran berhasil!",
        description: "Anda telah berhasil mendaftar. Silakan login untuk melanjutkan.",
      })

      router.push("/login")
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        variant: "destructive",
        title: "Pendaftaran gagal",
        description: error.message || "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Pendaftaran Program Magang</CardTitle>
            <CardDescription>
              Isi formulir di bawah untuk mendaftar program magang PT Mada Wikri Tunggal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Masukkan nama lengkap" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="nama@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor HP</FormLabel>
                      <FormControl>
                        <Input placeholder="08xxxxxxxxxx" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Universitas</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama universitas" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="major"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jurusan</FormLabel>
                      <FormControl>
                        <Input placeholder="Jurusan" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="semester"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Semester</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih semester" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                            <SelectItem key={semester} value={semester.toString()}>
                              Semester {semester}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Unggah KTP/KTM</FormLabel>
                  <FormControl>
                    <Input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} required />
                  </FormControl>
                  <FormDescription>
                    Unggah scan atau foto KTP atau KTM Anda (format: JPG, PNG, atau PDF)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Mendaftar..." : "Daftar"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Sudah memiliki akun?{" "}
              <Link href="/login" className="text-primary underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
