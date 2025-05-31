"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerFormSchema } from "@/lib/schemas";
import axiosInstance from "@/lib/axios";
import { toast } from "react-toastify";
import { Msg } from "@/components/toastify";
import { Loader2 } from "lucide-react";

interface Position {
  id: number;
  name: string;
  description: string;
}

interface Vacancy {
  id: number;
  title: string;
  description: string;
  thumbnail?: string | null;
  location: string;
  status: string;
  startDate: string;
  endDate: string;
  position?: Position | null;
}

interface VacancyApiResponse {
  message: string;
  data: Vacancy[];
}

export default function RegisterPage() {
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardBase64, setIdCardBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isFetchingVacancies, setIsFetchingVacancies] = useState(true);
  const [fetchVacanciesError, setFetchVacanciesError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      university: "",
      major: "",
      semester: undefined,
      password: "",
      confirmPassword: "",
      vacancyId: undefined,
    },
  });

  useEffect(() => {
    const fetchOpenVacancies = async () => {
      setIsFetchingVacancies(true);
      setFetchVacanciesError(null);
      try {
        const response = await axiosInstance.get<VacancyApiResponse>("api/vacancy");

        if (response.data && response.data.data) {
          setVacancies(response.data.data.filter(v => v.status === "OPEN"));
        } else {
          const errMsg = response.data?.message || "Gagal memuat lowongan";
          setFetchVacanciesError(errMsg);
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan"
        setFetchVacanciesError(errorMessage);
        toast.error(Msg, { data: { title: "Error", description: errorMessage } });
      } finally {
        setIsFetchingVacancies(false);
      }
    };

    fetchOpenVacancies();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIdCardFile(file);

      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setIdCardBase64(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof registerFormSchema>) => {
    try {
      setIsSubmitting(true);

      const response = await axiosInstance.post("/api/auth/register", {
        ...values,
        idCard: idCardBase64,
      });

      if (response.status !== 200) {
        throw new Error("Registration failed");
      }

      toast(Msg, {
        data: {
          title: "Pendaftaran berhasil",
          description:
            "Silakan cek email Anda untuk mengkonfirmasi pendaftaran.",
        },
      });
      router.push("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(Msg, {
        data: {
          title: "Pendaftaran gagal",
          description: "Terjadi kesalahan saat mendaftar. Silakan coba lagi.",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Pendaftaran Program Magang</CardTitle>
              <CardDescription>
                Isi formulir di bawah untuk mendaftar program magang PT Mada
                Wikri Tunggal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {/* Field untuk memilih Vacancy */}
                  <FormField
                    control={form.control}
                    name="vacancyId" // Pastikan nama ini sesuai dengan skema Zod
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lowongan yang Diminati</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))} // Konversi ke number
                          defaultValue={field.value?.toString()}
                          disabled={isFetchingVacancies}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={isFetchingVacancies ? "Memuat lowongan..." : "Pilih lowongan"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isFetchingVacancies ? (
                              <div className="flex items-center justify-center p-4">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Memuat...
                              </div>
                            ) : fetchVacanciesError ? (
                              <div className="p-4 text-center text-sm text-destructive">
                                {fetchVacanciesError}
                              </div>
                            ) : vacancies.length > 0 ? (
                              vacancies.map((vacancy) => (
                                <SelectItem
                                  key={vacancy.id}
                                  value={vacancy.id.toString()} // Value SelectItem harus string
                                >
                                  {vacancy.title} ({vacancy.position?.title || 'Posisi Umum'}) - {vacancy.location}
                                </SelectItem>
                              ))
                            ) : (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                Tidak ada lowongan yang tersedia saat ini.
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masukkan nama lengkap"
                            {...field}
                          />
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
                          <Input
                            type="email"
                            placeholder="nama@example.com"
                            {...field}
                          />
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
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          defaultValue={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih semester" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                              <SelectItem
                                key={semester}
                                value={semester.toString()}
                              >
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
                      <Input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        required
                      />
                    </FormControl>
                    <FormDescription>
                      Unggah scan atau foto KTP atau KTM Anda (format: JPG, PNG,
                      atau PDF)
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
                          <Input
                            type="password"
                            placeholder="******"
                            {...field}
                          />
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
                          <Input
                            type="password"
                            placeholder="******"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSubmitting || isFetchingVacancies}>
                    {isSubmitting ? "Mendaftar..." : "Daftar"}
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
    </>
  );
}
