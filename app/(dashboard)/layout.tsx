import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "@/app/(auth)/login/actions";
import { AlertasService } from "@/lib/services/alertas.service";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", soloAdmin: false },
  { href: "/proveedores", label: "Proveedores", soloAdmin: false },
  { href: "/productos", label: "Productos", soloAdmin: false },
  { href: "/compras", label: "Compras", soloAdmin: false },
  { href: "/inventario/movimientos", label: "Inventario", soloAdmin: false },
  { href: "/eventos", label: "Eventos", soloAdmin: false },
  { href: "/gastos", label: "Gastos", soloAdmin: true },
  { href: "/ingresos", label: "Ingresos", soloAdmin: true },
  { href: "/balance", label: "Balance", soloAdmin: true },
  { href: "/estadisticas", label: "Estadísticas", soloAdmin: true },
  { href: "/alertas", label: "Alertas", soloAdmin: false },
  { href: "/reportes", label: "Reportes", soloAdmin: false },
] as const;

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: perfil, error: perfilError } = await supabase
    .from("perfiles")
    .select("nombre_completo, rol")
    .eq("id", user.id)
    .maybeSingle();

  const esAdmin = perfil?.rol === "admin";
  const nombrePerfil = perfilError ? user.email : perfil?.nombre_completo ?? user.email;
  const rolPerfil = perfilError ? "empleado" : perfil?.rol ?? "empleado";
  const itemsVisibles = NAV_ITEMS.filter((item) => !item.soloAdmin || esAdmin);

  const alertasService = new AlertasService(supabase);
  const cantidadAlertasNoLeidas = await alertasService.contarNoLeidas().catch(() => 0);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-sky-200/50 bg-white/80 backdrop-blur-md p-4 md:flex">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-500 shadow-md">
            <span className="text-lg font-bold text-white">CC</span>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">Colorín Colorado</div>
            <div className="text-xs text-slate-500">Salón de Fiestas</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {itemsVisibles.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                item.href === "/dashboard"
                  ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-sky-50 hover:text-slate-900"
              }`}
            >
              <span>{item.label}</span>
              {item.href === "/alertas" && cantidadAlertasNoLeidas > 0 && (
                <span className="rounded-full bg-red-400 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                  {cantidadAlertasNoLeidas}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar footer */}
        <div className="mt-4 border-t border-sky-200/50 pt-4">
          <div className="flex items-center gap-2 px-2 text-xs text-slate-500">
            <div className="h-2 w-2 rounded-full bg-green-400"></div>
            Sistema activo
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-sky-200/50 bg-white/80 backdrop-blur-md px-6 py-3">
          <input
            type="search"
            placeholder="Buscar productos, proveedores, eventos..."
            className="w-80 max-w-full rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-semibold text-slate-800">{nombrePerfil}</div>
              <div className="text-xs capitalize text-slate-500">{rolPerfil}</div>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center text-white font-semibold shadow-sm">
              {nombrePerfil?.charAt(0)?.toUpperCase() ?? "U"}
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                Salir
              </button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 relative z-10">{children}</main>
      </div>
    </div>
  );
}
