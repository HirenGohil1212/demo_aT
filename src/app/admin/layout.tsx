
"use client";

import { useEffect, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Loader2, Home, ShoppingBag, Tag, GalleryHorizontal, LogOut, Settings } from "lucide-react";
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
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push("/login");
      }
    }
  }, [user, isAdmin, loading, router]);
  
  // Reset navigation loading state when route changes
  useEffect(() => {
    if (navigatingTo) {
      setNavigatingTo(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying permissions...</p>
      </div>
    );
  }
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  }

  const MobileNavLink = ({ href, children }: { href: string, children: React.ReactNode }) => {
    const isNavigating = navigatingTo === href;

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Don't do anything if we are already on this page
      if (pathname === href) {
        setIsMobileMenuOpen(false);
        return;
      }

      e.preventDefault();
      setNavigatingTo(href);

      // Navigate after a short delay to allow loader to be seen
      setTimeout(() => {
        router.push(href);
        // The drawer will close when the route changes via the other useEffect
        setIsMobileMenuOpen(false);
      }, 300); 
    };

    return (
        <Button
            asChild
            variant={pathname === href ? "default" : "ghost"}
            className="w-full justify-start text-lg h-12"
            disabled={isNavigating}
        >
            <Link href={href} onClick={handleClick}>
                {isNavigating ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                    children
                )}
            </Link>
        </Button>
    )
  }

  if (user && isAdmin) {
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2 p-2">
              <h1 className="font-headline text-2xl font-bold text-primary">
                LuxeLiquor
              </h1>
            </Link>
          </SidebarHeader>
          <SidebarContent className="mt-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin"} tooltip="Dashboard">
                  <Link href="/admin">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                 <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/banners")} tooltip="Banners">
                  <Link href="/admin/banners">
                    <GalleryHorizontal />
                    <span>Banners</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/products")} tooltip="Products">
                    <Link href="/admin/products">
                        <ShoppingBag />
                        <span>Products</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/categories")} tooltip="Categories">
                  <Link href="/admin/categories">
                    <Tag />
                    <span>Categories</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/admin/settings")} tooltip="Settings">
                  <Link href="/admin/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
           <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center justify-between border-b px-4 lg:justify-end">
             <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold hidden lg:block">Admin Dashboard</h2>
             </div>
            <SidebarTrigger className="lg:hidden" onClick={() => setIsMobileMenuOpen(true)}/>
          </header>
           <main className="p-4 sm:p-6">{children}</main>
        </SidebarInset>
         {/* Mobile Menu Sheet */}
        <Sidebar>
            <SheetContent side="left" className="md:hidden flex flex-col p-0">
                <SheetHeader className="border-b p-4">
                    <SheetTitle>
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="font-headline text-2xl font-bold text-primary">
                            LuxeLiquor
                        </Link>
                    </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-2 p-4">
                    <MobileNavLink href="/admin"><Home className="mr-2"/>Dashboard</MobileNavLink>
                    <MobileNavLink href="/admin/banners"><GalleryHorizontal className="mr-2"/>Banners</MobileNavLink>
                    <MobileNavLink href="/admin/products"><ShoppingBag className="mr-2"/>Products</MobileNavLink>
                    <MobileNavLink href="/admin/categories"><Tag className="mr-2"/>Categories</MobileNavLink>
                    <MobileNavLink href="/admin/settings"><Settings className="mr-2"/>Settings</MobileNavLink>
                </div>
                <div className="mt-auto border-t p-4">
                    <Button onClick={handleLogout} variant="outline" className="w-full justify-start">
                        <LogOut className="mr-2"/>
                        <span>Logout</span>
                    </Button>
                </div>
            </SheetContent>
        </Sidebar>
      </SidebarProvider>
    );
  }

  return null;
}
