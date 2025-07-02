"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useStore } from "@/lib/stores/user.store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Header from "@/components/header";
import useApi from "@/hooks/useApi"; // Menggunakan hook yang sudah direfaktor
import {
  ArrowRight,
  Award,
  Calendar,
  Briefcase,
  GraduationCap,
  MapPin,
  Search,
  Filter,
  Users,
  Clock,
} from "lucide-react";

interface Vacancy {
  id: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  thumbnail?: string;
  position?: {
    title: string;
  };
}

export default function Home() {
  const [searchTitle, setSearchTitle] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [checkingVacancyId, setCheckingVacancyId] = useState<number | null>(
    null
  );

  const router = useRouter();
  const user = useStore((state) => state.user);

  // Hook untuk mengambil daftar lowongan
  const {
    data: vacancies,
    isLoading: isLoadingVacancies,
    request: fetchVacanciesApi,
  } = useApi<Vacancy[]>();

  // Hook untuk memeriksa status lamaran
  const { isLoading: isCheckingStatus, request: checkStatusApi } = useApi();

  // Fungsi untuk mengambil lowongan dengan filter
  const fetchVacancies = useCallback(
    (filters = {}) => {
      fetchVacanciesApi({
        method: "POST",
        url: "/api/vacancy/list",
        data: filters,
      });
    },
    [fetchVacanciesApi]
  );

  // Mengambil data lowongan saat komponen pertama kali dimuat
  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  const handleSearch = () => {
    const filters: any = {};
    if (searchTitle) filters.title = searchTitle;
    if (searchLocation) filters.location = searchLocation;
    fetchVacancies(filters);
  };

  const handleApplyClick = async (vacancyId: number) => {
    if (!user) {
      toast.error("Silakan login terlebih dahulu untuk melamar.");
      router.push("/login");
      return;
    }

    setCheckingVacancyId(vacancyId);

    await checkStatusApi(
      {
        method: "GET",
        url: `/api/application/status?vacancyId=${vacancyId}`,
      },
      {
        showToastOnError: true, // Tampilkan toast jika ada error
        onSuccess: (data) => {
          const { status, applicationId } = data as any;
          if (status === "PENDING_TEST") {
            toast.info("Anda sudah melamar, mengarahkan ke halaman tes.");
            router.push(`/application/test?id=${applicationId}`);
          } else if (status === "COMPLETED") {
            toast.success("Anda sudah menyelesaikan tes untuk lowongan ini.");
          } else {
            // NOT_APPLIED
            router.push(`/application?vacancy=${vacancyId}`);
          }
        },
        onError: () => {
          // Toast error sudah ditangani oleh hook, bisa tambahkan logic lain jika perlu
        },
      }
    );

    setCheckingVacancyId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Program Magang 2025
                </div>
                <h1 className="text-4xl font-bold mb-4">
                  Selamat Datang di Website Magang PT Mada Wikri Tunggal
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Temukan dan daftar program magang sesuai minat dan keahlianmu.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button
                    size="lg"
                    className="gap-1.5"
                    onClick={() => {
                      document
                        .getElementById("vacancies")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Lihat Lowongan
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative h-[350px] w-[350px] rounded-lg bg-muted overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-90"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GraduationCap className="h-32 w-32 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vacancies Section */}
        <section id="vacancies" className="py-12 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Lowongan Magang Tersedia
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Pilih posisi magang yang sesuai dengan minat dan keahlian Anda
                </p>
              </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari berdasarkan judul..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Cari berdasarkan lokasi..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} className="gap-2">
                <Filter className="h-4 w-4" />
                Cari
              </Button>
            </div>

            {/* Vacancy Cards */}
            {isLoadingVacancies ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-3 bg-muted rounded"></div>
                        <div className="h-3 bg-muted rounded w-5/6"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : vacancies && vacancies.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {vacancies.map((vacancy) => (
                  <Card
                    key={vacancy.id}
                    className="group flex flex-col hover:shadow-lg transition-all duration-200 border-0 shadow-md"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="secondary" className="mb-2">
                          {vacancy.position?.title || "Internship"}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          OPEN
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {vacancy.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4" />
                        {vacancy.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {vacancy.description}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 mt-auto flex flex-col items-start gap-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Mulai: {formatDate(vacancy.startDate)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Selesai: {formatDate(vacancy.endDate)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        className="w-full group-hover:bg-primary/90 transition-colors gap-2"
                        onClick={() => handleApplyClick(vacancy.id)}
                        disabled={
                          isCheckingStatus && checkingVacancyId === vacancy.id
                        }
                      >
                        <Users className="h-4 w-4" />
                        {isCheckingStatus && checkingVacancyId === vacancy.id
                          ? "Memeriksa..."
                          : "Daftar Sekarang"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Tidak ada lowongan ditemukan
                </h3>
                <p className="text-muted-foreground mb-4">
                  Coba ubah kata kunci pencarian atau filter lokasi
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTitle("");
                    setSearchLocation("");
                    fetchVacancies();
                  }}
                >
                  Reset Pencarian
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Program Details */}
        <section className="py-12">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Tentang Program Magang
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Program magang kami dirancang untuk memberikan pengalaman
                  praktis dan pembelajaran yang berharga.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Calendar className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Durasi</h3>
                <p className="text-center text-muted-foreground">
                  Program magang berlangsung selama 6 bulan dengan jadwal yang
                  fleksibel.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Award className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Manfaat</h3>
                <p className="text-center text-muted-foreground">
                  Pengalaman kerja nyata, mentoring dari profesional, dan
                  sertifikat magang.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <Briefcase className="h-12 w-12 text-primary" />
                <h3 className="text-xl font-bold">Fasilitas</h3>
                <p className="text-center text-muted-foreground">
                  Akses ke lingkungan kerja profesional, tunjangan transportasi,
                  dan peluang karir.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Company Profile */}
        <section className="py-12 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  PT Mada Wikri Tunggal
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  PT Mada Wikri Tunggal adalah perusahaan terkemuka yang
                  bergerak di bidang teknologi dan inovasi. Kami berkomitmen
                  untuk mengembangkan solusi yang berkelanjutan dan berdampak
                  positif bagi masyarakat.
                </p>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Dengan tim yang terdiri dari profesional berpengalaman dan
                  berbakat, kami terus berinovasi untuk menciptakan produk dan
                  layanan yang memenuhi kebutuhan pasar global.
                </p>
              </div>
              <div className="flex justify-center">
                <div className="relative h-[300px] w-full rounded-lg bg-muted overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-90"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2">Visi & Misi</h3>
                      <p className="max-w-md mx-auto">
                        Menjadi pemimpin dalam inovasi teknologi dan memberikan
                        solusi yang memberdayakan masyarakat untuk masa depan
                        yang lebih baik.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                  Siap Untuk Bergabung?
                </h2>
                <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Jangan lewatkan kesempatan untuk mengembangkan karir Anda
                  bersama PT Mada Wikri Tunggal.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-1.5"
                  onClick={() => {
                    document
                      .getElementById("vacancies")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Lihat Lowongan
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
