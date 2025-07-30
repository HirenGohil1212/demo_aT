"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Loader2, Home, Package2, Settings } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until the loading is complete before checking for user/admin status
    if (!loading) {
      if (!user) {
        // If no user, redirect to login
        router.push("/login");
      } else if (!isAdmin) {
        // If user is not an admin, redirect to home page
        router.push("/");
      }
    }
  }, [user, isAdmin, loading, router]);

  // While loading, show a spinner to prevent flicker and premature redirects
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading Admin Panel...</p>
      </div>
    );
  }

  // If loading is finished, but user is not an admin, show a message while redirecting
  if (!isAdmin) {
    return (
       <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying permissions...</p>
      </div>
    );
  }

  // If user is an admin, render the layout
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <h1 className="font-headline text-2xl font-bold text-primary">
              Admin
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin" passHref legacyBehavior>
                <SidebarMenuButton isActive={pathname === "/admin"}>
                  <Home />
                  Dashboard
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {/* Footer content if any */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center justify-between border-b px-4 lg:justify-end">
          <SidebarTrigger className="lg:hidden" />
          {/* Potentially add user profile button here */}
        </header>
        <main className="p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
