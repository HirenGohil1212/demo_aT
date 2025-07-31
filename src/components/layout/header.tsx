
"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from '@/hooks/use-user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


// We can't use the server-side getSettings here, so we fetch it on the client
async function fetchSignupSetting() {
    try {
        const res = await fetch('/api/settings');
        if (!res.ok) return true; // Default to true on error
        const data = await res.json();
        return data.allowSignups;
    } catch {
        return true; // Default to true on error
    }
}


export default function Header() {
  const { itemCount } = useCart();
  const { user, isAdmin } = useUser();
  const router = useRouter();
  const [allowSignups, setAllowSignups] = useState(true);

  useEffect(() => {
    async function checkSettings() {
        const setting = await fetchSignupSetting();
        setAllowSignups(setting);
    }
    checkSettings();
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'All Products' },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  }
  
  return (
    <header className="bg-card shadow-lg sticky top-0 z-40 border-b-2 border-primary/50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-headline text-2xl md:text-3xl font-bold text-primary tracking-wider" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
          LuxeLiquor
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-base font-medium hover:text-primary transition-colors duration-300">
              {link.label}
            </Link>
          ))}
           {isAdmin && (
              <Link href="/admin" className="text-base font-medium hover:text-primary transition-colors duration-300">
                Admin
              </Link>
            )}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <Button asChild variant="outline" size="icon" className="relative border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-1 bg-primary text-primary-foreground">
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
               <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
              {allowSignups && (
                <Button asChild variant="outline">
                    <Link href="/signup">Sign Up</Link>
                </Button>
              )}
            </div>
          )}


          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col gap-6 pt-10">
                <Link href="/" className="font-headline text-2xl font-bold text-primary mb-4">
                  LuxeLiquor
                </Link>
                  {navLinks.map(link => (
                    <Link key={link.href} href={link.href} className="text-lg font-medium hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link href="/admin" className="text-lg font-medium hover:text-primary transition-colors">
                      Admin
                    </Link>
                  )}
                  <div className="flex flex-col gap-4 mt-4">
                     {user ? (
                        <Button onClick={handleLogout}>Logout</Button>
                     ) : (
                        <>
                            <Button asChild><Link href="/login">Login</Link></Button>
                            {allowSignups && (
                                <Button asChild variant="outline"><Link href="/signup">Sign Up</Link></Button>
                            )}
                        </>
                     )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
