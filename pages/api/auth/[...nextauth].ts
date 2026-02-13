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
        // HARDCODED para debugging en producción
        const ADMIN_EMAIL = "sistemas@ddonpedrosrl.com";
        const ADMIN_PASSWORD = "Admin123!";

        console.log('=== AUTHORIZE DEBUG ===');
        console.log('Input email:', credentials?.email);
        console.log('Input password length:', credentials?.password?.length);
        console.log('ENV ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
        console.log('ENV exists:', !!process.env.ADMIN_PASSWORD);

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        // Comparación con trim para evitar espacios
        const emailMatch = credentials.email.trim() === ADMIN_EMAIL;
        const passwordMatch = credentials.password === ADMIN_PASSWORD;

        console.log('Email match:', emailMatch);
        console.log('Password match:', passwordMatch);

        if (emailMatch && passwordMatch) {
          console.log('✅ Credentials valid - returning user');
          return {
            id: "admin-user",
            email: ADMIN_EMAIL,
            name: "Administrador",
            isAdmin: true,
          } as any;
        }
        
        console.log('❌ Invalid credentials');
        return null;
      }
    }),
  ],
  
  pages: {
    signIn: '/auth/signin',
  },

  session: {
    strategy: "jwt",
  },
  
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('=== SIGN IN CALLBACK ===');
      console.log('User:', user?.email);
      console.log('Provider:', account?.provider);
      return true;
    },

    async jwt({ token, user, account }) {
      console.log('=== JWT CALLBACK ===');
      if (user) {
        console.log('Adding user to token:', user.email);
        token.id = user.id;
        (token as any).isAdmin = (user as any).isAdmin || false;
      }
      return token;
    },

    async session({ session, token }) {
      console.log('=== SESSION CALLBACK ===');
      if (session.user) {
        (session.user as any).id = token.sub!;
        (session.user as any).isAdmin = 
          session.user.email === "sistemas@ddonpedrosrl.com" || 
          (token as any).isAdmin === true;
        
        console.log('Session user:', session.user.email);
        console.log('Is admin:', (session.user as any).isAdmin);
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log('=== REDIRECT CALLBACK ===');
      console.log('URL:', url);
      console.log('BaseURL:', baseUrl);

      // Si es un callback relativo
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
  debug: true, // Activar debug en producción temporalmente
};

export default NextAuth(authOptions);