// pages/x7k9m2p-admin/login.tsx
// 🔒 CAMBIÁ EL NOMBRE DE LA CARPETA POR UNA URL SECRETA
// Ejemplo: /mi-login-secreto-2024/login

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function SecretAdminLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Si ya está autenticado como admin, redirigir al panel
  useEffect(() => {
    if (status === "authenticated" && session?.user?.email === "sistemas@ddonpedrosrl.com") {
      router.replace("/admin");
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Ingresá tu email y contraseña");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signIn("admin-credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Credenciales incorrectas. Intentá de nuevo.");
      } else if (result?.ok) {
        router.push("/admin");
      }
    } catch {
      setError("Ocurrió un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
        <p className="text-center mb-6 text-gray-600">
          Acceso Administradores
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-400 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="inline w-4 h-4 mr-1" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sistemas@ddonpedrosrl.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Lock className="inline w-4 h-4 mr-1" />
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-manzur-primary pr-10"
                disabled={loading}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-white font-medium rounded-lg bg-manzur-primary hover:bg-manzur-secondary transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Ingresando..." : "Ingresar al panel"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-manzur-primary hover:text-manzur-secondary transition-colors"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}