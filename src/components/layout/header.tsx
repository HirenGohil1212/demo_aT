
"use client";

import Link from 'next/link';
import { ShoppingCart, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Header() {
  const { itemCount } = useCart();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'All Products' },
  ];
  
  return (
    <header className="bg-card shadow-lg sticky top-0 z-40 border-b-2 border-primary/50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="font-headline text-3xl font-bold text-primary tracking-wider" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>
          LuxeLiquor
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link key={link.href} href={link.href} className="text-base font-medium hover:text-primary transition-colors duration-300">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" className="relative border-accent text-accent hover:bg-accent hover:text-accent-foreground">
            <Link href="/cart">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-1 bg-primary text-primary-foreground">
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>

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
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
