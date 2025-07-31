
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Banner } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type HomeCarouselProps = {
    banners: Banner[];
}

export function HomeCarousel({ banners }: HomeCarouselProps) {
    if (banners.length === 0) {
        return null;
    }
    
    return (
        <section className="w-full relative">
          <Carousel
            className="w-full"
            opts={{
              align: 'start',
              loop: true,
            }}
          >
            <CarouselContent>
              {banners.map((banner, index) => (
                <CarouselItem key={banner.id}>
                  <div className="relative aspect-[16/9] md:aspect-[2/1] lg:aspect-[2.5/1] w-full text-white">
                     <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        fill
                        priority={index === 0} // Prioritize loading of the first banner image
                        sizes="100vw"
                        className="object-cover brightness-50"
                        data-ai-hint={`cocktail drink`}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                         <h2 className="font-headline text-3xl sm:text-4xl md:text-6xl font-bold text-primary drop-shadow-lg mb-2 sm:mb-4">
                          {banner.title}
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl max-w-2xl mb-4 sm:mb-6 drop-shadow-md">
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
    )
}
