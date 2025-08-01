
"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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

function AuthCta() {
    const { user } = useUser();
    const router = useRouter();
    const [allowSignups, setAllowSignups] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        async function checkSettings() {
            const setting = await fetchSignupSetting();
            setAllowSignups(setting);
        }
        checkSettings();
    }, []);

    const handleLogout = async () => {
        await auth.signOut();
        router.push('/');
    }

    if (!isClient) {
        return null;
    }
    
    if (user) {
        return (
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
        )
    }

    return null;
}


export default function Header() {
  const { itemCount } = useCart();
  const { user, isAdmin } = useUser();
  const router = useRouter();
  const [allowSignups, setAllowSignups] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const MobileNavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium hover:text-primary transition-colors">
        {children}
    </Link>
  )
  
  return (
    <header className="bg-card shadow-lg sticky top-0 z-40 border-b-2 border-primary/50">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        
        {/* Desktop Logo & Nav */}
        <div className="hidden md:flex flex-1 justify-start">
             <Link href="/" className="font-headline text-2xl md:text-3xl font-bold text-primary tracking-wider" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                LuxeLiquor
            </Link>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 justify-center">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className="relative font-headline text-lg group text-foreground/80 hover:text-foreground transition-colors duration-300"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
            </Link>
          ))}
           {isAdmin && (
              <Link 
                href="/admin" 
                className="relative font-headline text-lg group text-foreground/80 hover:text-foreground transition-colors duration-300"
              >
                Admin
                 <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center"></span>
              </Link>
            )}
        </nav>

        {/* Mobile Header: Drawer on Left, Logo Centered, Cart on Right */}
        <div className="md:hidden flex-1 flex justify-start">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader>
                        {/* <SheetTitle>Navigation</SheetTitle> */}
                        <SheetTitle asChild>
                          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="font-headline text-2xl font-bold text-primary text-left">
                            LuxeLiquor
                          </Link>
                        </SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col gap-6 pt-8">
                    {navLinks.map(link => (
                        <MobileNavLink key={link.href} href={link.href}>
                        {link.label}
                        </MobileNavLink>
                    ))}
                    {isAdmin && (
                        <MobileNavLink href="/admin">
                        Admin
                        </MobileNavLink>
                    )}
                    <div className="flex flex-col gap-4 mt-4 border-t pt-6">
                        {user ? (
                        <>
                            <p className="text-sm text-center text-muted-foreground">{user.email}</p>
                            <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout</Button>
                        </>
                        ) : (
                            <>
                                {/* Signup button removed from here */}
                            </>
                        )}
                    </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>

        <div className="flex-1 flex justify-center md:hidden">
            <Link href="/" className="font-headline text-2xl font-bold text-primary tracking-wider" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
                LuxeLiquor
            </Link>
        </div>


        <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
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

          <div className="hidden md:flex items-center gap-2">
            <AuthCta />
          </div>

        </div>
      </div>
    </header>
  );
}
