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
      id: 'admin-credentials',
      name: 'Admin',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        const ADMIN_EMAIL = "sistemas@ddonpedrosrl.com";
        const ADMIN_PASSWORD = "Admin123!";

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (credentials.email.trim() === ADMIN_EMAIL && credentials.password === ADMIN_PASSWORD) {
          return {
            id: "admin-user",
            email: ADMIN_EMAIL,
            name: "Administrador",
            isAdmin: true,
          };
        }
        
        return null;
      }
    }),
  ],
  
  // 🔥 IMPORTANTE: No definir pages.signIn para evitar redirección automática
  // pages: {
  //   signIn: '/auth/signin',
  // },

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
          session.user.email === "sistemas@ddonpedrosrl.com" || 
          (token as any).isAdmin === true;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      console.log('Redirect - URL:', url, 'BaseURL:', baseUrl);
      
      // Si la URL ya es absoluta y está en el mismo origen
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // Si es un callback relativo
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      
      return baseUrl;
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);