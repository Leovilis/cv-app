// middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const isAdmin = token?.email === 'sistemas@ddonpedrosrl.com';

    console.log('Middleware - Path:', pathname);
    console.log('Middleware - Token:', token?.email);
    console.log('Middleware - IsAdmin:', isAdmin);

    // 🔥 Ruta /admin - siempre mostrar el login de admin (sin redirigir a Google)
    if (pathname === '/admin') {
      // Si ya está autenticado como admin, redirigir al panel
      if (token && isAdmin) {
        return NextResponse.redirect(new URL('/admin/panel', req.url));
      }
      // Si no está autenticado o no es admin, dejar que muestre la página /admin
      return NextResponse.next();
    }

    // Ruta /admin/panel - solo admin puede acceder
    if (pathname.startsWith('/admin/panel')) {
      if (!token || !isAdmin) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
      return NextResponse.next();
    }

    // Ruta /talentos - solo usuarios autenticados (no admin)
    if (pathname === '/talentos') {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/signin', req.url));
      }
      if (isAdmin) {
        return NextResponse.redirect(new URL('/admin/panel', req.url));
      }
      return NextResponse.next();
    }

    // Ruta /auth/signin - si ya está autenticado, redirigir según rol
    if (pathname === '/auth/signin') {
      if (token) {
        if (isAdmin) {
          return NextResponse.redirect(new URL('/admin/panel', req.url));
        } else {
          return NextResponse.redirect(new URL('/talentos', req.url));
        }
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Permitir acceso a todas las rutas, el middleware manejará las restricciones
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/talentos',
    '/auth/signin',
  ],
};