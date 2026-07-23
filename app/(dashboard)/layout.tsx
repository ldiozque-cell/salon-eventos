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
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="mb-6 px-2 text-lg font-semibold text-slate-900 dark:text-white">
          Colorín Colorado
        </div>
        <nav className="flex-1 space-y-1">
          {itemsVisibles.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <span>{item.label}</span>
              {item.href === "/alertas" && cantidadAlertasNoLeidas > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                  {cantidadAlertasNoLeidas}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
          <input
            type="search"
            placeholder="Buscar productos, proveedores, eventos..."
            className="w-80 max-w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-500 dark:border-slate-700"
          />
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="font-medium text-slate-900 dark:text-white">
                {nombrePerfil}
              </div>
              <div className="text-xs capitalize text-slate-900">{rolPerfil}</div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Salir
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
