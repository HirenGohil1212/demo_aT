"use client";

import Link from 'next/link';
import { ShoppingCart, Menu, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { useUser } from '@/hooks/use-user';
import { auth } from '@/lib/firebase';
import { ADMIN_UIDS } from '@/lib/admins';
import { signOut } from 'firebase/auth';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function Header() {
  const { itemCount } = useCart();
  const { user, loading } = useUser();
  const isAdmin = user && ADMIN_UIDS.includes(user.uid);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'All Products' },
  ];
  
  const handleSignOut = async () => {
    await signOut(auth);
  };

  return (
    <header className="bg-card shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="font-headline text-2xl font-bold text-primary">
          LuxeLiquor
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-sm font-medium hover:text-primary transition-colors">
              {link.label}
            </Link>
          ))}
          {isAdmin && (
             <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-6 w-6 text-accent-foreground" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-1 bg-primary text-primary-foreground">
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>

          {!loading && isAdmin && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                      <AvatarFallback>{user.displayName?.[0] ?? user.email?.[0]}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                     <Link href="/admin" className="text-lg font-medium hover:text-primary transition-colors flex items-center gap-2">
                       <Shield className="h-5 w-5" />
                      Admin
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
