"use client";

import { ReactNode } from 'react';
import { useUser } from '@/hooks/use-user';
import { ADMIN_UIDS } from '@/lib/admins';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, PackagePlus, Users } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-xl">Loading...</div>
        </div>
    )
  }

  const isAdmin = user && ADMIN_UIDS.includes(user.uid);

  if (!isAdmin) {
    router.push('/'); // Or a dedicated "unauthorized" page
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-card border-r p-4 flex-col hidden md:flex">
        <h2 className="font-headline text-2xl font-bold text-primary mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-2">
            <Link href="/admin" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                <Home className="h-5 w-5" />
                <span>Dashboard</span>
            </Link>
            <Link href="/admin/add-product" className="flex items-center gap-2 p-2 rounded-md hover:bg-accent">
                <PackagePlus className="h-5 w-5" />
                <span>Add Product</span>
            </Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-muted/40">
        {children}
      </main>
    </div>
  );
}
