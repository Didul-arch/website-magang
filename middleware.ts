import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/utils/supabase/middleware'; // Pastikan path ini benar

export async function middleware(request: NextRequest) {

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua path request kecuali yang dimulai dengan:
     * - api (rute API)
     * - _next/static (file statis)
     * - _next/image (file optimasi gambar)
     * - favicon.ico (file favicon)
     * - /login (halaman login itu sendiri)
     * - /register (halaman register itu sendiri)
     * - /auth (jika ada rute publik di bawah /auth)
     * Anda mungkin ingin secara eksplisit menyertakan /dashboard dan turunannya
     * atau mengecualikan halaman publik lainnya.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|register|auth).*)',
  ],
};