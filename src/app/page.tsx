import Image from 'next/image';
import Link from 'next/link';
import { products, categories } from '@/lib/products';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function Home() {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Carousel */}
      <section className="mb-12">
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
                <div className="p-1">
                  <Card className="overflow-hidden">
                    <CardContent className="flex flex-col md:flex-row items-center justify-center p-0">
                      <div className="md:w-1/2 h-64 md:h-96 w-full relative">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                          data-ai-hint={`${product.category} bottle`}
                        />
                      </div>
                      <div className="md:w-1/2 p-8 text-center md:text-left">
                        <h2 className="font-headline text-3xl md:text-5xl font-bold text-primary mb-4">
                          {product.name}
                        </h2>
                        <p className="text-lg mb-6">
                          {product.description.split('.')[0]}.
                        </p>
                        <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                          <Link href={`/products/${product.id}`}>
                            Discover More
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </section>

      {/* Products by Category */}
      <section>
        {categories.map((category) => (
          <div key={category} className="mb-12">
            <h2 className="font-headline text-3xl font-bold mb-6 text-center text-primary">
              {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products
                .filter((p) => p.category === category)
                .slice(0, 4)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
