import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">PT Mada Wikri Tunggal</h3>
            <p className="text-sm text-muted-foreground">Program magang untuk mahasiswa baru dan berpengalaman.</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Tautan</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary">
                  Daftar
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Kontak</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: info@madawikritunggal.com</li>
              <li>Telepon: (021) 1234-5678</li>
              <li>Alamat: Jl. Contoh No. 123, Jakarta</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Sosial Media</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary">
                  Instagram
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} PT Mada Wikri Tunggal. Hak Cipta Dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
