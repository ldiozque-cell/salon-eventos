import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rutas que solo puede ver el rol "admin"
const RUTAS_SOLO_ADMIN = [
  "/balance",
  "/gastos",
  "/ingresos",
  "/estadisticas",
  "/configuracion",
];

const RUTAS_PUBLICAS = ["/login"];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return response;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options });
        },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.warn("[middleware] getUser error:", userError.message);
    }

    const path = request.nextUrl.pathname;
    const esRutaPublica = RUTAS_PUBLICAS.some((r) => path.startsWith(r));

    // No autenticado intentando entrar a una ruta privada -> a login
    if (!user && !esRutaPublica) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", path);
      return NextResponse.redirect(url);
    }

    // Autenticado intentando ir a /login -> al dashboard
    if (user && esRutaPublica) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // Verificación de rol para rutas exclusivas de admin
    if (user && RUTAS_SOLO_ADMIN.some((r) => path.startsWith(r))) {
      const { data: perfil, error: perfilError } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .maybeSingle();

      if (perfilError) {
        console.warn("[middleware] perfil error:", perfilError.message);
      }

      if (perfil?.rol !== "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        url.searchParams.set("error", "sin_permiso");
        return NextResponse.redirect(url);
      }
    }

    return response;
  } catch (error) {
    console.error("[middleware] Invocation failed:", error);
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Aplica el middleware a todo excepto assets estáticos y la API de
     * Next.js internals, para no interferir con imágenes, fuentes, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
