import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Award, Calendar, Briefcase, GraduationCap } from "lucide-react"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Program Magang 2024</div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Program Magang PT Mada Wikri Tunggal</h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Kembangkan karir dan keterampilan Anda melalui program magang selama 6 bulan di PT Mada Wikri Tunggal.
                Terbuka untuk mahasiswa baru dan berpengalaman.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/register">
                  <Button size="lg" className="gap-1.5">
                    Daftar Sekarang
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Login
                  </Button>
                </Link>
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

      {/* Program Details */}
      <section className="py-12 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Tentang Program Magang</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Program magang kami dirancang untuk memberikan pengalaman praktis dan pembelajaran yang berharga.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Calendar className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Durasi</h3>
              <p className="text-center text-muted-foreground">
                Program magang berlangsung selama 6 bulan dengan jadwal yang fleksibel.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Award className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Manfaat</h3>
              <p className="text-center text-muted-foreground">
                Pengalaman kerja nyata, mentoring dari profesional, dan sertifikat magang.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Briefcase className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Fasilitas</h3>
              <p className="text-center text-muted-foreground">
                Akses ke lingkungan kerja profesional, tunjangan transportasi, dan peluang karir.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Profile */}
      <section className="py-12">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">PT Mada Wikri Tunggal</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                PT Mada Wikri Tunggal adalah perusahaan terkemuka yang bergerak di bidang teknologi dan inovasi. Kami
                berkomitmen untuk mengembangkan solusi yang berkelanjutan dan berdampak positif bagi masyarakat.
              </p>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Dengan tim yang terdiri dari profesional berpengalaman dan berbakat, kami terus berinovasi untuk
                menciptakan produk dan layanan yang memenuhi kebutuhan pasar global.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="relative h-[300px] w-full rounded-lg bg-muted overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 opacity-90"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h3 className="text-2xl font-bold mb-2">Visi & Misi</h3>
                    <p className="max-w-md mx-auto">
                      Menjadi pemimpin dalam inovasi teknologi dan memberikan solusi yang memberdayakan masyarakat untuk
                      masa depan yang lebih baik.
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Siap Untuk Bergabung?</h2>
              <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Jangan lewatkan kesempatan untuk mengembangkan karir Anda bersama PT Mada Wikri Tunggal.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-1.5">
                  Daftar Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
