// pages/api/auth/[...nextauth].ts
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
      id: "admin-credentials",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

        if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
          console.error(
            "❌ ADMIN_EMAIL o ADMIN_PASSWORD no están definidas en las variables de entorno",
          );
          return null;
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (
          credentials.email.trim() === ADMIN_EMAIL &&
          credentials.password === ADMIN_PASSWORD
        ) {
          return {
            id: "admin-user",
            email: ADMIN_EMAIL,
            name: "Administrador",
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
        (session.user as any).id = token.sub;
        (session.user as any).isAdmin =
          session.user.email === process.env.ADMIN_EMAIL ||
          (token as any).isAdmin === true;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return baseUrl;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

export default NextAuth(authOptions);
