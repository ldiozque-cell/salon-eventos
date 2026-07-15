import { ProveedorForm } from "@/components/forms/ProveedorForm";

export default function NuevoProveedorPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-slate-900 dark:text-white">Nuevo proveedor</h1>
      <ProveedorForm />
    </div>
  );
}
