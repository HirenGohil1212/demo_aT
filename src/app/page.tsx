
"use server";
import Image from 'next/image';
import Link from 'next/link';
import { getProducts } from '@/actions/product-actions';
import { getCategories } from '@/actions/category-actions';
import { getBanners } from '@/actions/banner-actions';
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
  const allBanners = await getBanners();

  const featuredProducts = allProducts.filter((p) => p.featured);

  return (
    <div>
      {/* Hero Carousel */}
      {allBanners.length > 0 && (
        <section className="w-full relative">
          <Carousel
            className="w-full"
            opts={{
              align: 'start',
              loop: true,
            }}
          >
            <CarouselContent>
              {allBanners.map((banner) => (
                <CarouselItem key={banner.id}>
                  <div className="relative h-[60vh] md:h-[70vh] w-full text-white">
                     <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        priority
                        className="object-cover brightness-50"
                        data-ai-hint={`cocktail drink`}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                         <h2 className="font-headline text-4xl md:text-6xl font-bold text-primary drop-shadow-lg mb-4">
                          {banner.title}
                        </h2>
                        <p className="text-lg md:text-xl max-w-2xl mb-6 drop-shadow-md">
                          {banner.subtitle}
                        </p>
                        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Link href={`/products/${banner.productId}`}>
                            Discover More
                          </Link>
                        </Button>
                      </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </section>
      )}

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Featured Products Grid */}
        {featuredProducts.length > 0 && (
          <section className="mb-12 md:mb-16">
            <h2 className="font-headline text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-primary">
                Featured Spirits
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                 {featuredProducts.slice(0, 4).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
              </div>
          </section>
        )}

        {/* Products by Category */}
        <section>
          {allCategories.map((category) => {
            const categoryProducts = allProducts.filter((p) => p.category === category.name);
            if (categoryProducts.length === 0) return null;
            
            return (
              <div key={category.id} className="mb-12 md:mb-16">
                <div className="flex justify-between items-center mb-4 md:mb-6">
                  <h2 className="font-headline text-2xl md:text-3xl font-bold text-primary">
                    {category.name}
                  </h2>
                  <Button asChild variant="link" className="text-primary hover:text-primary/90">
                    <Link href={`/products?category=${category.name}`}>
                      View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                  {categoryProducts
                    .slice(0, 4)
                    .map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                </div>
              </div>
            )
          })}
        </section>
      </div>
    </div>
  );
}
