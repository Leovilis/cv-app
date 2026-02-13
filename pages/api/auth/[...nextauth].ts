
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials, req) {
        // Credenciales de admin (cámbialas por las que prefieras)
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "sistemas@ddonpedrosrl.com";
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

        if (
          credentials?.email === ADMIN_EMAIL &&
          credentials?.password === ADMIN_PASSWORD
        ) {
          return {
            id: "admin-user",
            email: ADMIN_EMAIL,
            name: "Administrador",
            isAdmin: true,
          } as any;
        }
        
        return null;
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',   // ← ESTA LINEA ES LA SOLUCIÓN
  },

  session: {
    strategy: "jwt",
  },
  
  callbacks: {
    async redirect({ url, baseUrl }) {
    // Si es un callback relativo (lo normal)
    if (url.startsWith("/")) {
      return baseUrl + url;
    }

    // Si Google intenta volver al signin → forzamos home
    if (url.includes("/auth/signin")) {
      return baseUrl;
    }

    // Cualquier otro caso permitido
    if (new URL(url).origin === baseUrl) {
      return url;
    }

    return baseUrl;
  },
},
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
