import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    console.log(`[Middleware] Allowing API route: ${pathname}`);
    return supabaseResponse;
  }

  const publicPaths = ["/", "/login", "/register"]; 
  const isPublicPath = publicPaths.some(
    (publicPathEntry) => {
      if (publicPathEntry === "/") {
        return pathname === publicPathEntry; // Cocokkan persis untuk "/"
      }
      // Untuk path lain, cocokkan jika pathname sama persis atau dimulai dengan path publik + "/"
      return pathname === publicPathEntry || pathname.startsWith(publicPathEntry + "/");
    }
  );

  console.log(
    `[Middleware] Path: ${pathname}, User: ${
      user ? user.id : "null"
    }, IsPublicPath: ${isPublicPath}`
  );

  // Jika TIDAK ADA USER dan path yang diakses BUKAN path publik
  if (!user && !isPublicPath) {
    console.log(
      `[Middleware] No user & not a public path. Redirecting from ${pathname} to /login`
    );
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Jika ADA USER dan mencoba akses path publik yang seharusnya untuk user belum login (login/register)
  if (user && (pathname === "/login" || pathname === "/register")) {
    console.log(
      `[Middleware] User exists & trying to access login/register. Redirecting from ${pathname} to /dashboard`
    );
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard"; 
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
