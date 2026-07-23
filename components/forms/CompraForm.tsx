"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrarCompraAction } from "@/app/(dashboard)/compras/actions";

interface Proveedor {
  id: string;
  nombre: string;
}

interface Producto {
  id: string;
  nombre: string;
  precio_actual: number;
}

interface ItemCompra {
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
}

export function CompraForm({ proveedores, productos }: { proveedores: Proveedor[]; productos: Producto[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ItemCompra[]>([{ producto_id: "", cantidad: 1, precio_unitario: 0 }]);

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0),
    [items]
  );

  function agregarItem() {
    setItems((prev) => [...prev, { producto_id: "", cantidad: 1, precio_unitario: 0 }]);
  }

  function quitarItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function actualizarItem(index: number, cambios: Partial<ItemCompra>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...cambios } : item)));
  }

  function seleccionarProducto(index: number, productoId: string) {
    const producto = productos.find((p) => p.id === productoId);
    actualizarItem(index, {
      producto_id: productoId,
      precio_unitario: producto?.precio_actual ?? 0,
    });
  }

  async function handleSubmit(formData: FormData) {
    setError(null);

    if (items.some((i) => !i.producto_id)) {
      setError("Todos los ítems deben tener un producto seleccionado");
      return;
    }

    formData.set("items", JSON.stringify(items));

    startTransition(async () => {
      const resultado = await registrarCompraAction(formData);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }
      router.push(`/compras/${resultado.data.id}`);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="max-w-3xl space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label>
          <input
            type="date"
            name="fecha"
            defaultValue={new Date().toISOString().slice(0, 10)}
            required
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Nº de factura</label>
          <input
            type="text"
            name="numero_factura"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Proveedor</label>
        <select
          name="proveedor_id"
          required
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
        >
          <option value="">Seleccionar proveedor...</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Ítems de la compra */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Productos comprados</label>
          <button
            type="button"
            onClick={agregarItem}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          >
            + Agregar producto
          </button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <select
                value={item.producto_id}
                onChange={(e) => seleccionarProducto(index, e.target.value)}
                required
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
              >
                <option value="">Producto...</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={item.cantidad}
                onChange={(e) => actualizarItem(index, { cantidad: Number(e.target.value) })}
                placeholder="Cant."
                className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={item.precio_unitario}
                onChange={(e) => actualizarItem(index, { precio_unitario: Number(e.target.value) })}
                placeholder="Precio unit."
                className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
              />
              <span className="w-24 text-right text-sm text-slate-500">
                ${(item.cantidad * item.precio_unitario).toFixed(2)}
              </span>
              <button
                type="button"
                onClick={() => quitarItem(index)}
                disabled={items.length === 1}
                className="text-slate-400 hover:text-red-600 disabled:opacity-30"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">IVA</label>
          <input
            type="number"
            name="iva"
            min="0"
            step="0.01"
            defaultValue={0}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Forma de pago</label>
          <select
            name="forma_pago"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          >
            <option value="">Sin especificar</option>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta_debito">Tarjeta débito</option>
            <option value="tarjeta_credito">Tarjeta crédito</option>
            <option value="mercado_pago">Mercado Pago</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Estado de pago</label>
          <select
            name="estado_pago"
            defaultValue="pendiente"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
          >
            <option value="pendiente">Pendiente</option>
            <option value="parcial">Parcial</option>
            <option value="pagado">Pagado</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Observaciones</label>
        <textarea
          name="observaciones"
          rows={2}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700"
        />
      </div>

      <div className="flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="text-sm text-slate-500">
          Subtotal: <span className="font-semibold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900"
        >
          {isPending ? "Registrando..." : "Registrar compra"}
        </button>
      </div>
    </form>
  );
}
