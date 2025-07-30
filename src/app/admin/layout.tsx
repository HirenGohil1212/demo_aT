"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Loader2, Home } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // We only want to check for redirection after the initial loading is complete.
    if (!loading) {
      // If there's no user or the user is not an admin, redirect to login.
      if (!user || !isAdmin) {
        router.push("/login");
      }
    }
  }, [user, isAdmin, loading, router]);

  // While loading, show a full-screen spinner. This prevents content flashing
  // or premature redirects before the admin status is confirmed.
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying permissions...</p>
      </div>
    );
  }

  // If loading is finished and the user is an admin, render the layout.
  // The useEffect above will handle redirecting non-admins.
  if (user && isAdmin) {
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
        </Sidebar>
        <SidebarInset>
          <header className="flex h-12 items-center justify-between border-b px-4 lg:justify-end">
            <SidebarTrigger className="lg:hidden" />
          </header>
          <main className="p-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // If we've finished loading but don't have an admin user, we show nothing.
  // The redirect in useEffect will handle navigation.
  return null;
}
