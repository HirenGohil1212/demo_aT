
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/components/product-card';
import type { Category, Product } from '@/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type CategorySectionProps = {
  category: Category;
  products: Product[];
}

export function CategorySection({ category, products }: CategorySectionProps) {
  return (
    <div>
        <div className="text-center mb-6 md:mb-8">
          <h2 className="font-headline text-3xl md:text-5xl font-bold text-primary mb-2">
            {category.name}
          </h2>
          <Button asChild variant="link" className="text-primary hover:text-primary/90 text-md">
            <Link href={`/products?category=${encodeURIComponent(category.name)}`}>
              View All {category.name} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Carousel
          opts={{
            align: "start",
            loop: products.length > 4, // Loop only if there are enough products to scroll
          }}
          className="w-full max-w-7xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden lg:flex" />
          <CarouselNext className="hidden lg:flex" />
        </Carousel>
    </div>
  );
}
