
"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useUser } from '@/hooks/use-user';
import { ADMIN_UIDS } from '@/lib/admins';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Home, PackagePlus, Users, Image as ImageIcon, LayoutGrid, LogOut, Shield } from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarContent, SidebarFooter, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';


export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();
  const isAdmin = user && ADMIN_UIDS.includes(user.uid);
  const isMobile = useIsMobile();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // If loading is finished and the user is not an admin, redirect them.
    if (!loading && !isAdmin) {
      router.push('/login');
    }
  }, [user, loading, isAdmin, router]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-xl">Loading...</div>
        </div>
    )
  }

  // If we're still loading or the user is not an admin, don't render the admin layout.
  // The useEffect will handle the redirect.
  if (!isAdmin) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-xl">Checking permissions...</div>
        </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={!isMobile} onOpenChange={setSidebarOpen} open={sidebarOpen}>
        <Sidebar>
            <SidebarHeader>
                 <div className="flex items-center gap-2">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'User'} />
                        <AvatarFallback>{user?.displayName?.[0] ?? user?.email?.[0]}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                         <span className='text-sm font-semibold'>{user?.displayName ?? user?.email}</span>
                         <span className="text-xs text-muted-foreground">Administrator</span>
                     </div>
                 </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/admin">
                                <Home />
                                <span className='group-data-[collapsible=icon]:hidden'>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/admin/add-product">
                                <PackagePlus />
                                <span className='group-data-[collapsible=icon]:hidden'>Add Product</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/admin/categories">
                                <LayoutGrid />
                                <span className='group-data-[collapsible=icon]:hidden'>Categories</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                            <Link href="/admin/carousel">
                                <ImageIcon />
                                <span className='group-data-[collapsible=icon]:hidden'>Carousel</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                         <SidebarMenuButton onClick={handleSignOut}>
                            <LogOut/>
                             <span className='group-data-[collapsible=icon]:hidden'>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
        <SidebarInset>
             <header className="flex items-center justify-between p-4 bg-card border-b md:hidden">
                <Link href="/" className="font-headline text-2xl font-bold text-primary">
                  LuxeLiquor
                </Link>
                <SidebarTrigger />
             </header>
            <main className="flex-1 p-4 sm:p-8">
                 {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
