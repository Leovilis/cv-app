// pages/index.tsx
import React from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Si está autenticado y es admin, redirigir al panel
  if (status === 'authenticated' && session?.user?.email === 'sistemas@ddonpedrosrl.com') {
    router.push('/admin/panel');
    return null;
  }

  // Si está autenticado y es usuario normal, redirigir al formulario
  if (status === 'authenticated' && session?.user?.email !== 'sistemas@ddonpedrosrl.com') {
    router.push('/talentos');
    return null;
  }

  const handleCargarCV = () => {
    router.push("/auth/signin");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-center mb-6">
          <Logo width={200} height={80} />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 text-manzur-primary">
          MANZUR
        </h1>
        <p className="text-center mb-8 tracking-wider text-black">
          ADMINISTRACIONES
        </p>
        <p className="text-center mb-6 text-gray-600">Selección de Talentos</p>

        <button
          onClick={handleCargarCV}
          className="w-full py-3 text-white font-medium rounded-lg flex items-center justify-center gap-2 bg-manzur-primary hover:bg-manzur-secondary transition-colors"
        >
          <Mail className="w-5 h-5" />
          Cargar mi CV
        </button>

        {/* <div className="mt-4 text-center">
          <a
            href="/admin"
            className="text-xs text-manzur-primary hover:underline"
          >
            Acceso Administradores
          </a>
        </div> */}

        <Footer />
      </div>
    </div>
  );
}