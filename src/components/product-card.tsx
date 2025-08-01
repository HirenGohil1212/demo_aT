
"use client";

import Image from 'next/image';
import type { Product } from '@/types';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="flex flex-col overflow-hidden h-full group transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 border-transparent hover:border-primary/30 bg-card/80 backdrop-blur-sm">
      <CardHeader className="p-0 relative">
          <div className="aspect-square relative overflow-hidden bg-transparent">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain group-hover:scale-110 transition-transform duration-500 ease-in-out"
              data-ai-hint={`${product.category} bottle`}
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 23vw"
            />
          </div>
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-all duration-300"></div>
          <div className="absolute bottom-0 left-0 p-4 w-full">
            <Badge variant="secondary" className="mb-2 bg-black/30 border-white/20 backdrop-blur-lg">{product.category}</Badge>
            <CardTitle className="font-headline text-3xl leading-tight text-white drop-shadow-lg group-hover:text-primary transition-colors">
              {product.name}
            </CardTitle>
          </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow flex flex-col justify-end">
        <div className="flex justify-between items-baseline mb-4">
            <p className="text-2xl font-bold text-primary">INR {product.price.toFixed(2)}</p>
            <span className="text-sm text-muted-foreground">{product.quantity}ml</span>
        </div>
      </CardContent>
      <CardFooter className="p-3">
        <Button size="lg" variant="default" onClick={() => addToCart(product)} className="w-full font-bold text-lg bg-primary/90 hover:bg-primary group-hover:scale-105 transition-transform">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
