import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getFirestore } from '@/lib/firebase';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  

  providers: [
    // Login con Google (para usuarios normales)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    // Login con Email/Password (para admin)
    CredentialsProvider({
      id: 'credentials',
      name: 'Email y Contraseña',
      credentials: {
        email: { 
          label: "Email", 
          type: "email", 
          placeholder: "admin@ddonpedrosrl.com" 
        },
        password: { 
          label: "Contraseña", 
          type: "password" 
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email y contraseña son requeridos');
        }

        try {
          const db = getFirestore();
          
          // Buscar usuario en la colección 'admins'
          const userDoc = await db.collection('admins').doc(credentials.email).get();
          
          if (!userDoc.exists) {
            throw new Error('Usuario no encontrado');
          }

          const userData = userDoc.data();
          
          // Verificar contraseña
          const isValidPassword = await bcrypt.compare(
            credentials.password, 
            userData?.password || ''
          );
          
          if (!isValidPassword) {
            throw new Error('Contraseña incorrecta');
          }

          // Retornar usuario autenticado
          return {
            id: credentials.email,
            email: credentials.email,
            name: userData?.name || 'Admin',
            image: userData?.image || null,
          };
        } catch (error) {
          console.error('Error en autenticación:', error);
          throw new Error('Error al autenticar');
        }
      }
    })
  ],
  
  pages: {
    signIn: '/auth/signin', // Página personalizada de login
  },
  
  // callbacks: {
  //   async session({ session, token }) {
  //     if (session.user) {
  //       session.user.email = token.email;
  //     }
  //     return session;
  //   },
  //   async jwt({ token, user }) {
  //     if (user) {
  //       token.email = user.email;
  //     }
  //     return token;
  //   },
  // },
  callbacks: {
  async jwt({ token, account, profile }) {
    // primera vez que el usuario inicia sesión
    if (account && profile) {
      token.id = profile.sub;
      token.email = profile.email;
      token.name = profile.name;
      // token.picture = profile.picture;
    }
    return token;
  },

  async session({ session, token }) {
    if (session.user) {
      session.user.id = token.id as string;
      session.user.email = token.email as string;
      session.user.name = token.name as string;
      session.user.image = token.picture as string;
    }
    return session;
  },
},
  
  session: {
    strategy: 'jwt',
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);