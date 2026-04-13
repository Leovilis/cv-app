// pages/admin/panel/index.tsx
import React from 'react';
import { useSession } from 'next-auth/react';
import { AdminPanel } from '@/components/AdminPanel';
import { Layout } from '@/components/Layout';

export default function AdminPanelPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.email === 'sistemas@ddonpedrosrl.com';

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-manzur-primary border-t-transparent rounded-full animate-spin"/>
          <p className="text-manzur-primary text-sm font-medium">Cargando panel...</p>
        </div>
      </div>
    );
  }

  if (status !== 'authenticated' || !isAdmin) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin';
    }
    return null;
  }

  return (
    <Layout>
      <AdminPanel />
    </Layout>
  );
}