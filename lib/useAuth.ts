
import { useSession, signIn, signOut } from 'next-auth/react';

export const useAuth = () => {
  const { data: session, status } = useSession();
  
  const loading = status === 'loading';
  const authenticated = status === 'authenticated';
  
  return {
    user: session?.user,
    loading,
    authenticated,
    isAdmin: (session?.user as any)?.isAdmin === true,
    signIn: () => signIn(),
    signOut: () => signOut({ callbackUrl: '/' }),
  };
};