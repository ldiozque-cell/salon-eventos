import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { AlertasRepository, type FiltrosAlertas } from "@/lib/repositories/alertas.repo";

export class AlertasService {
  private repo: AlertasRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new AlertasRepository(supabase);
  }

  async obtenerResumen(filtros: FiltrosAlertas) {
    const [alertas, eventosConSaldoPendiente] = await Promise.all([
      this.repo.listar(filtros),
      this.repo.eventosConSaldoPendienteProximos(),
    ]);
    return { alertas, eventosConSaldoPendiente };
  }

  async contarNoLeidas() {
    return this.repo.contarNoLeidas();
  }

  async marcarLeida(id: string) {
    return this.repo.marcarLeida(id);
  }

  async marcarResuelta(id: string) {
    return this.repo.marcarResuelta(id);
  }
}
