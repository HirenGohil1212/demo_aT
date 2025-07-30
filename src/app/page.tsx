"use server";
import Image from 'next/image';
import Link from 'next/link';
import { getProducts, getCategories } from '@/services/product-service';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ArrowRight } from 'lucide-react';

export default async function Home() {
  const allProducts = await getProducts();
  const allCategories = await getCategories();

  const featuredProducts = allProducts.filter((p) => p.featured);

  return (
    <div>
      {/* Hero Carousel */}
      <section className="w-full">
        <Carousel
          className="w-full"
          opts={{
            align: 'start',
            loop: true,
          }}
        >
          <CarouselContent>
            {featuredProducts.map((product) => (
              <CarouselItem key={product.id}>
                <div className="relative h-[60vh] w-full text-white">
                   <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover brightness-50"
                      data-ai-hint={`${product.category} bottle`}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                       <h2 className="font-headline text-4xl md:text-6xl font-bold text-primary drop-shadow-lg mb-4">
                        {product.name}
                      </h2>
                      <p className="text-lg md:text-xl max-w-2xl mb-6 drop-shadow-md">
                        {product.description.split('.')[0]}.
                      </p>
                      <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href={`/products/${product.id}`}>
                          Discover More
                        </Link>
                      </Button>
                    </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex left-4 text-primary" />
          <CarouselNext className="hidden sm:flex right-4 text-primary" />
        </Carousel>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Products Grid */}
        <section className="mb-16">
           <h2 className="font-headline text-3xl font-bold mb-8 text-center text-primary">
              Featured Spirits
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
               {featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </section>

        {/* Products by Category */}
        <section>
          {allCategories.map((category) => (
            <div key={category.id} className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline text-3xl font-bold text-primary">
                  {category.name}
                </h2>
                <Button asChild variant="link" className="text-primary">
                  <Link href={`/products?category=${category.name}`}>
                    View All <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {allProducts
                  .filter((p) => p.category === category.name)
                  .slice(0, 4)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
