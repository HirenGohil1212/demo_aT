
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
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // This effect runs when the loading status or user object changes.
    // If loading is finished and there's no user, or the user is not an admin, redirect.
    if (!loading && (!user || !ADMIN_UIDS.includes(user.uid))) {
      router.push('/login');
    }
  }, [user, loading, router]);


  // While loading, show a full-screen loading indicator to prevent flashing content.
  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-xl">Loading Admin Panel...</div>
        </div>
    );
  }

  // If not loading, but the user is still not valid (e.g., logged out, not an admin),
  // show the loading screen as well, as the useEffect above will handle the redirection.
  // This prevents the admin layout from briefly appearing before the redirect.
  if (!user || !ADMIN_UIDS.includes(user.uid)) {
       return (
        <div className="flex justify-center items-center h-screen">
            <div className="text-xl">Redirecting...</div>
        </div>
    );
  }

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

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
