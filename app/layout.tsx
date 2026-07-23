import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Colorín Colorado Infantiles — Gestión",
  description: "Sistema integral de gestión: inventario, compras, proveedores, eventos y finanzas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
