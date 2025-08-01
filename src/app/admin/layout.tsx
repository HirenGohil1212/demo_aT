
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

function NavLink({ href, children, onLinkClick }: { href: string; children: React.ReactNode; onLinkClick?: () => void; }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Button asChild variant={isActive ? "secondary" : "ghost"} className="w-full justify-start" onClick={onLinkClick}>
      <Link href={href}>
        {children}
      </Link>
    </Button>
  );
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
    const router = useRouter();
    const handleLogout = async () => {
        router.push('/');
        await auth.signOut();
        if (onLinkClick) onLinkClick();
    }
    return (
        <div className="flex flex-col h-full">
            <nav className="flex-grow p-4 space-y-2 mt-4">
                <NavLink href="/admin/products" onLinkClick={onLinkClick}><ShoppingBag className="mr-2"/>Products</NavLink>
                <NavLink href="/admin/categories" onLinkClick={onLinkClick}><Tag className="mr-2"/>Categories</NavLink>
                <NavLink href="/admin/banners" onLinkClick={onLinkClick}><GalleryHorizontal className="mr-2"/>Banners</NavLink>
                <NavLink href="/admin/settings" onLinkClick={onLinkClick}><Settings className="mr-2"/>Settings</NavLink>
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
      <div className="grid md:grid-cols-[256px_1fr] flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r bg-card">
            <SidebarContent />
        </aside>
        
        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="p-0 w-72">
                <SheetHeader>
                  <SheetTitle className="sr-only">Admin Menu</SheetTitle>
                </SheetHeader>
                <SidebarContent onLinkClick={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
        </Sheet>

        <div className="flex flex-col">
            <header className="flex h-14 items-center justify-between border-b px-4 lg:px-6 bg-card">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(true)}>
                    <PanelLeft />
                    <span className="sr-only">Open Menu</span>
                </Button>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-semibold">Admin Dashboard</h2>
                </div>
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
