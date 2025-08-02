
"use client";

import Image from 'next/image';
import type { Product } from '@/types';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="flex flex-col overflow-hidden h-full group transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 border-transparent hover:border-primary/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`} aria-label={`View details for ${product.name}`}>
          <div className="aspect-square relative overflow-hidden bg-transparent">
            <Image
              src={product.image || "https://placehold.co/600x600.png"}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-110 transition-transform duration-500 ease-in-out p-4"
              data-ai-hint={`${product.category} bottle`}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw"
            />
          </div>
        </Link>
      </CardHeader>
      
      <CardContent className="p-4 flex-grow flex flex-col justify-between">
         <div>
            <Badge variant="secondary" className="mb-2 w-fit bg-black/30 border-white/20 backdrop-blur-lg">{product.category}</Badge>
            <Link href={`/products/${product.id}`}>
              <CardTitle className="font-headline text-3xl leading-tight text-white group-hover:text-primary transition-colors">
                {product.name}
              </CardTitle>
            </Link>
         </div>
         <div className="flex justify-between items-baseline mt-2">
            <p className="text-2xl font-bold text-primary">INR {product.price.toFixed(2)}</p>
            <span className="text-sm text-muted-foreground">{product.quantity}ml</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-3 mt-auto">
        <Button size="lg" variant="default" onClick={() => addToCart(product)} className="w-full font-bold text-lg bg-primary/90 hover:bg-primary group-hover:scale-105 transition-transform">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
