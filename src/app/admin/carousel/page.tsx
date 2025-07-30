
"use client";

import { useState } from 'react';
import { products } from "@/lib/products";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function CarouselManagementPage() {
  const { toast } = useToast();
  // In a real app, this would be fetched and updated via an API
  const [featuredProducts, setFeaturedProducts] = useState(
    products.filter(p => p.featured).map(p => p.id)
  );

  const handleToggleFeatured = (productId: string, isFeatured: boolean) => {
    // This is a simulation of an API call.
    console.log(`Setting product ${productId} featured status to: ${isFeatured}`);
    
    setFeaturedProducts(prev => {
      if (isFeatured) {
        return [...prev, productId];
      } else {
        return prev.filter(id => id !== productId);
      }
    });

    toast({
      title: "Carousel Updated",
      description: `Product has been ${isFeatured ? 'added to' : 'removed from'} the carousel. (Simulation)`,
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center">
        <h1 className="font-headline text-3xl font-bold text-primary">Carousel Management</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Homepage Carousel</CardTitle>
          <CardDescription>
            Select which products to feature in the homepage carousel.
            For best results, use high-quality landscape images (e.g., 1200x600 pixels).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {products.map(product => (
            <div key={product.id} className="flex items-center justify-between p-4 border rounded-md">
              <div className="flex items-center gap-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={50}
                  height={50}
                  className="rounded-md object-cover aspect-square"
                  data-ai-hint={`${product.category} bottle`}
                />
                <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`featured-${product.id}`}
                  checked={featuredProducts.includes(product.id)}
                  onCheckedChange={(checked) => handleToggleFeatured(product.id, checked)}
                />
                <Label htmlFor={`featured-${product.id}`}>Featured</Label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
