import { loginAction } from "./actions";
import { CalendarCheck } from "lucide-react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string; error?: string };
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 via-blue-50 to-brand-50">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-500 shadow-lg">
            <CalendarCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Colorín Colorado
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Salón de Fiestas Infantiles
          </p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-sky-200/50 bg-white/90 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="mb-4 text-center text-lg font-semibold text-slate-700">
            Iniciá sesión para continuar
          </h2>

          {searchParams.error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {searchParams.error}
            </div>
          ) : null}

          <form action={loginAction} className="space-y-4">
            <input type="hidden" name="redirectTo" value={searchParams.redirectTo ?? "/dashboard"} />

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@email.com"
                className="w-full rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-sky-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-brand-600 hover:to-brand-700 hover:shadow-lg active:scale-[0.98]"
            >
              Ingresar
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-slate-400">
          Sistema de gestión de eventos
        </p>
      </div>
    </div>
  );
}
