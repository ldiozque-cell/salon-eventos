"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearProductoAction, actualizarProductoAction } from "@/app/(dashboard)/productos/actions";

interface Categoria {
  id: string;
  nombre: string;
}

interface ProductoFormProps {
  categorias: Categoria[];
  productoId?: string; // presente => modo edición
  valoresIniciales?: Record<string, string | number | null>;
}

export function ProductoForm({ categorias, productoId, valoresIniciales }: ProductoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(formData: FormData) {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const resultado = productoId
        ? await actualizarProductoAction(productoId, formData)
        : await crearProductoAction(formData);

      if (!resultado.ok) {
        setError(resultado.error);
        setFieldErrors(resultado.fieldErrors ?? {});
        return;
      }

      router.push(`/productos/${resultado.data.id}`);
      router.refresh();
    });
  }

  const v = valoresIniciales ?? {};

  return (
    <form action={handleSubmit} className="max-w-2xl space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Código interno" name="codigo_interno" defaultValue={v.codigo_interno} errores={fieldErrors.codigo_interno} required />
        <Campo label="Código de barras" name="codigo_barras" defaultValue={v.codigo_barras} errores={fieldErrors.codigo_barras} />
      </div>

      <Campo label="Nombre" name="nombre" defaultValue={v.nombre} errores={fieldErrors.nombre} required />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</label>
          <select
            name="categoria_id"
            defaultValue={(v.categoria_id as string) ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        <Campo label="Marca" name="marca" defaultValue={v.marca} errores={fieldErrors.marca} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Unidad de medida" name="unidad_medida" defaultValue={v.unidad_medida ?? "unidad"} errores={fieldErrors.unidad_medida} />
        <Campo label="Presentación" name="presentacion" defaultValue={v.presentacion} errores={fieldErrors.presentacion} />
      </div>

      <Campo
        label="Precio actual"
        name="precio_actual"
        type="number"
        step="0.01"
        defaultValue={v.precio_actual}
        errores={fieldErrors.precio_actual}
        required
      />

      <div className="grid grid-cols-3 gap-4">
        <Campo label="Stock actual" name="stock_actual" type="number" step="0.01" defaultValue={v.stock_actual ?? 0} errores={fieldErrors.stock_actual} />
        <Campo label="Stock mínimo" name="stock_minimo" type="number" step="0.01" defaultValue={v.stock_minimo ?? 0} errores={fieldErrors.stock_minimo} />
        <Campo label="Stock ideal" name="stock_ideal" type="number" step="0.01" defaultValue={v.stock_ideal ?? 0} errores={fieldErrors.stock_ideal} />
      </div>

      <Campo label="Ubicación física" name="ubicacion_fisica" defaultValue={v.ubicacion_fisica} errores={fieldErrors.ubicacion_fisica} />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
        <select
          name="estado"
          defaultValue={(v.estado as string) ?? "activo"}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900"
      >
        {isPending ? "Guardando..." : productoId ? "Guardar cambios" : "Crear producto"}
      </button>
    </form>
  );
}

function Campo({
  label,
  name,
  defaultValue,
  errores,
  type = "text",
  step,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  errores?: string[];
  type?: string;
  step?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
      />
      {errores?.map((e) => (
        <p key={e} className="mt-1 text-xs text-red-600">
          {e}
        </p>
      ))}
    </div>
  );
}
