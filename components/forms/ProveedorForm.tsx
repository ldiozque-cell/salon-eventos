"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { crearProveedorAction, actualizarProveedorAction } from "@/app/(dashboard)/proveedores/actions";

interface ProveedorFormProps {
  proveedorId?: string; // presente => modo edición
  valoresIniciales?: Record<string, string | boolean | null>;
}

export function ProveedorForm({ proveedorId, valoresIniciales }: ProveedorFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(formData: FormData) {
    setError(null);
    setFieldErrors({});

    startTransition(async () => {
      const resultado = proveedorId
        ? await actualizarProveedorAction(proveedorId, formData)
        : await crearProveedorAction(formData);

      if (!resultado.ok) {
        setError(resultado.error);
        setFieldErrors(resultado.fieldErrors ?? {});
        return;
      }

      router.push(`/proveedores/${resultado.data.id}`);
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
        <Campo label="Nombre" name="nombre" defaultValue={v.nombre as string} errores={fieldErrors.nombre} required />
        <Campo label="Empresa" name="empresa" defaultValue={v.empresa as string} errores={fieldErrors.empresa} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Responsable" name="responsable" defaultValue={v.responsable as string} errores={fieldErrors.responsable} />
        <Campo label="Email" name="email" type="email" defaultValue={v.email as string} errores={fieldErrors.email} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Teléfono" name="telefono" defaultValue={v.telefono as string} errores={fieldErrors.telefono} />
        <Campo label="WhatsApp" name="whatsapp" defaultValue={v.whatsapp as string} errores={fieldErrors.whatsapp} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Campo label="Dirección" name="direccion" defaultValue={v.direccion as string} errores={fieldErrors.direccion} />
        <Campo label="Ciudad" name="ciudad" defaultValue={v.ciudad as string} errores={fieldErrors.ciudad} />
      </div>

      <Campo
        label="Horarios de atención"
        name="horarios_atencion"
        defaultValue={v.horarios_atencion as string}
        errores={fieldErrors.horarios_atencion}
      />
      <Campo
        label="Condiciones de pago"
        name="condiciones_pago"
        defaultValue={v.condiciones_pago as string}
        errores={fieldErrors.condiciones_pago}
      />

      <div>
        <label htmlFor="observaciones" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Observaciones
        </label>
        <textarea
          id="observaciones"
          name="observaciones"
          rows={3}
          defaultValue={(v.observaciones as string) ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input type="checkbox" name="activo" defaultChecked={(v.activo as boolean) ?? true} />
        Proveedor activo
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900"
      >
        {isPending ? "Guardando..." : proveedorId ? "Guardar cambios" : "Crear proveedor"}
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
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  errores?: string[];
  type?: string;
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
