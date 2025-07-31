
"use client";

import { useEffect, type ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { Loader2, Home, ShoppingBag, Tag, GalleryHorizontal, LogOut, Settings, PanelLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Button asChild variant={isActive ? "secondary" : "ghost"} className="w-full justify-start">
      <Link href={href}>
        {children}
      </Link>
    </Button>
  );
}

function MobileNavLink({ href, children, closeSheet }: { href: string, children: React.ReactNode, closeSheet: () => void }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Button asChild variant={isActive ? "default" : "ghost"} className="w-full justify-start text-lg h-12" onClick={closeSheet}>
        <Link href={href}>
            {children}
        </Link>
    </Button>
  )
}

function SidebarContent() {
    const handleLogout = async () => {
        await auth.signOut();
    }
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b">
                 <h1 className="font-headline text-2xl font-bold text-primary">
                    Admin
                </h1>
            </div>
            <nav className="flex-grow p-4 space-y-2">
                <NavLink href="/admin/products"><ShoppingBag className="mr-2"/>Products</NavLink>
                <NavLink href="/admin/categories"><Tag className="mr-2"/>Categories</NavLink>
                <NavLink href="/admin/banners"><GalleryHorizontal className="mr-2"/>Banners</NavLink>
                <NavLink href="/admin/settings"><Settings className="mr-2"/>Settings</NavLink>
            </nav>
            <div className="p-4 border-t">
                <Button onClick={handleLogout} variant="outline" className="w-full justify-start">
                    <LogOut className="mr-2"/>
                    Logout
                </Button>
            </div>
        </div>
    )
}


export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push("/login");
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying permissions...</p>
      </div>
    );
  }

  if (user && isAdmin) {
    return (
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r bg-card">
            <SidebarContent />
        </aside>
        
        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="p-0 w-72">
                <SidebarContent />
            </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col">
            <header className="flex h-14 items-center justify-between border-b px-4 lg:justify-end bg-card">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                    <PanelLeft />
                    <span className="sr-only">Open Menu</span>
                </Button>
                <h2 className="text-xl font-semibold hidden lg:block">Admin Dashboard</h2>
            </header>
            <main className="p-4 sm:p-6 flex-1">
                {children}
            </main>
        </div>
      </div>
    );
  }

  return null;
}
