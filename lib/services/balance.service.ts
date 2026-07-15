import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { BalanceRepository } from "@/lib/repositories/balance.repo";

export class BalanceService {
  private repo: BalanceRepository;

  constructor(supabase: SupabaseClient<Database>) {
    this.repo = new BalanceRepository(supabase);
  }

  async obtenerResumenCompleto() {
    const [evolucionMensual, comparacionMensual, balanceAnual] = await Promise.all([
      this.repo.evolucionMensual(),
      this.repo.comparacionMensual(),
      this.repo.balanceAnual(),
    ]);
    return { evolucionMensual, comparacionMensual, balanceAnual };
  }
}
