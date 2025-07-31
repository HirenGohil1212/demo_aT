
"use client";

import Image from 'next/image';
import Link from 'next/link';
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
    <Card className="flex flex-col overflow-hidden h-full group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block">
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              data-ai-hint={`${product.category} bottle`}
            />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <div className="flex justify-between items-center mb-2">
            <Badge variant="secondary">{product.category}</Badge>
            <span className="text-xs text-muted-foreground">{product.quantity}ml</span>
        </div>
        <Link href={`/products/${product.id}`}>
          <CardTitle className="font-headline text-xl leading-tight hover:text-primary transition-colors">
            {product.name}
          </CardTitle>
        </Link>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <p className="text-xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
        <Button size="icon" variant="outline" onClick={() => addToCart(product)} className="border-accent text-accent hover:bg-accent hover:text-accent-foreground">
          <ShoppingCart className="h-5 w-5" />
          <span className="sr-only">Add to cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
