'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function RootRedirector({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const hasLoggedIn = sessionStorage.getItem('hasLoggedIn');

    if (!hasLoggedIn && pathname !== '/login' && pathname !== '/register') {
      router.replace('/login');
    }
  }, [pathname]);

  return children;
}
