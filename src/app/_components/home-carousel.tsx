
"use client";

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Autoplay from "embla-carousel-autoplay";
import type { Banner } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

type HomeCarouselProps = {
    banners: Banner[];
}

export function HomeCarousel({ banners }: HomeCarouselProps) {
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0);
    
    const plugin = React.useRef(
        Autoplay({ delay: 4000, stopOnInteraction: true })
    );

    React.useEffect(() => {
        if (!api) return;

        setCurrent(api.selectedScrollSnap());
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap());
        });
        api.on("reInit", () => {
            setCurrent(api.selectedScrollSnap());
        });
    }, [api]);
    
    if (banners.length === 0) {
        return null;
    }
    
    return (
        <section className="w-full relative">
          <Carousel
            setApi={setApi}
            className="w-full"
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {banners.map((banner, index) => (
                <CarouselItem key={banner.id}>
                  <div className="relative aspect-[16/9] md:aspect-[2/1] lg:aspect-[2.5/1] w-full">
                     <Image
                        src={banner.imageUrl}
                        alt={banner.title || 'Banner image'}
                        fill
                        priority={index === 0}
                        sizes="100vw"
                        className="object-cover"
                        data-ai-hint={`cocktail drink`}
                      />
                      {/*
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"/>
                      <div className="absolute inset-0 flex flex-col items-start justify-end text-left p-6 sm:p-8 md:p-12 text-white">
                        <h2 
                            className={cn(
                                "font-headline text-4xl sm:text-6xl md:text-7xl font-bold text-primary drop-shadow-2xl tracking-tight mb-2 sm:mb-4 transition-all duration-700 ease-out",
                                current === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            )}
                        >
                            {banner.title}
                        </h2>
                        <p 
                            className={cn(
                                "text-lg sm:text-xl md:text-2xl max-w-2xl mb-6 sm:mb-8 drop-shadow-xl font-light tracking-wider transition-all duration-700 ease-out delay-200",
                                current === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                            )}
                        >
                            {banner.subtitle}
                        </p>
                      </div>
                      */}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex left-4 text-white bg-black/30 hover:bg-primary hover:text-primary-foreground border-white/50" />
            <CarouselNext className="hidden sm:flex right-4 text-white bg-black/30 hover:bg-primary hover:text-primary-foreground border-white/50" />
          </Carousel>
        </section>
    )
}
