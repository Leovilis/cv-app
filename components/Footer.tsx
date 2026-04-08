// components/Footer.tsx - Versión simple
import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-xs text-center text-gray-500">
          Aplicación desarrollada en conjunto por Area Sistemas y RRHH Soft de
          Manzur Administraciones.
          <br /> © {currentYear} Manzur Administraciones. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};