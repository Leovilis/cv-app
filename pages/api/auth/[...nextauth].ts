// pages/api/auth/[...nextauth].ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

// ─── Rate limiting para login admin ──────────────────────────────────────────
// Máximo 5 intentos fallidos por IP cada 15 minutos
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const LOGIN_RATE_MAX    = 5;
const LOGIN_RATE_WINDOW = 15 * 60 * 1000; // 15 minutos

function checkLoginRateLimit(ip: string): boolean {
  const now   = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_RATE_WINDOW });
    return true;
  }
  if (entry.count >= LOGIN_RATE_MAX) return false;
  entry.count++;
  return true;
}

function getIP(req: any): string {
  return (
    req?.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
    req?.socket?.remoteAddress ||
    'unknown'
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      id:   'admin-credentials',
      name: 'Admin',
      credentials: {
        email:    { label: "Email",     type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials, req) {
        const ADMIN_EMAIL    = process.env.ADMIN_EMAIL;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
          console.error('❌ ADMIN_EMAIL o ADMIN_PASSWORD no están definidas en las variables de entorno');
          return null;
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Rate limiting por IP
        const ip = getIP(req);
        if (!checkLoginRateLimit(ip)) {
          console.warn(`⚠️ Rate limit alcanzado para IP: ${ip}`);
          throw new Error('Demasiados intentos. Esperá 15 minutos.');
        }

        if (
          credentials.email.trim() === ADMIN_EMAIL &&
          credentials.password === ADMIN_PASSWORD
        ) {
          // Login exitoso — resetear contador
          loginAttempts.delete(ip);
          return {
            id:      "admin-user",
            email:   ADMIN_EMAIL,
            name:    "Administrador",
            isAdmin: true,
          };
        }

        return null;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        (token as any).isAdmin = (user as any).isAdmin || false;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id      = token.sub;
        (session.user as any).isAdmin =
          session.user.email === process.env.ADMIN_EMAIL ||
          (token as any).isAdmin === true;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/"))     return `${baseUrl}${url}`;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug:  process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);