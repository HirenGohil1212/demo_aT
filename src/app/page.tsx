
"use server";
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getProducts } from '@/actions/product-actions';
import { getCategories } from '@/actions/category-actions';
import { getBanners } from '@/actions/banner-actions';
import ProductCard from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const HomeCarousel = dynamic(
    () => import('./_components/home-carousel').then(mod => mod.HomeCarousel),
    { 
        ssr: false,
        loading: () => <Skeleton className="aspect-[16/9] md:aspect-[2/1] lg:aspect-[2.5/1] w-full" />
    }
);


export default async function Home() {
  const allProducts = await getProducts();
  const allCategories = await getCategories();
  const allBanners = await getBanners();

  const featuredProducts = allProducts.filter((p) => p.featured);

  return (
    <div>
      {/* Hero Carousel */}
      <HomeCarousel banners={allBanners} key={allBanners.length} />

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
          <div className="space-y-16">
            {allCategories.map((category) => {
              const categoryProducts = allProducts.filter((p) => p.category === category.name);
              if (categoryProducts.length === 0) return null;
              
              return (
                <div key={category.id} className="relative py-8 md:py-12 bg-card/50 rounded-lg shadow-xl overflow-hidden border border-primary/10">
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-background/50 z-0"></div>
                  <div className="relative z-10 px-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 max-w-7xl mx-auto">
                      {categoryProducts
                        .slice(0, 4)
                        .map((product) => (
                          <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
