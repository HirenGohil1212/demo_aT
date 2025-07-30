
"use client";

import { useActionState } from "react";
import { addBanner } from "@/services/product-service";
import type { Banner, Product, Category } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

// These would normally come from the server, but for the client component
// we pass them as props or fetch them in a client-safe way.
// For this form, we'll assume they are fetched and passed in.
type BannerFormProps = {
  products: Product[];
};

function BannerForm({ products }: BannerFormProps) {
  const [error, action] = useActionState(addBanner, undefined);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  return (
     <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Banner Title</Label>
        <Input name="title" id="title" placeholder="e.g. Summer Special" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Banner Subtitle</Label>
        <Input name="subtitle" id="subtitle" placeholder="e.g. The finest spirits for the season" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Banner Image</Label>
        <div className="flex items-center gap-4">
          <div className="w-48 h-24 border rounded-md flex items-center justify-center bg-muted/30">
             {imagePreview ? (
                <Image src={imagePreview} alt="Image Preview" width={192} height={96} className="object-cover w-full h-full rounded-md" />
            ) : (
                <ImageIcon className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
           <div className="space-y-2">
            <Input 
                id="imageUrl" 
                name="imageUrl" 
                type="file" 
                required 
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
            />
             <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                Choose Image
            </Button>
            <p className="text-xs text-muted-foreground">Recommended: 1200x600px</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="productId">Link to Product</Label>
         <Select name="productId" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a product to link" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <SubmitButton />
      {error && <p className="text-sm text-destructive">{error.error}</p>}
    </form>
  )
}


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : "Add Banner"}
        </Button>
    )
}

// We need a client component to use hooks for fetching data
export default function BannersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Let's modify this to fetch from server actions instead to avoid creating new API routes
  useEffect(() => {
    async function loadData() {
        const { getProducts, getBanners } = await import('@/services/product-service');
        const [productsData, bannersData] = await Promise.all([getProducts(), getBanners()]);
        setProducts(productsData);
        setBanners(bannersData);
        setLoading(false);
    }
    loadData();
  }, [])


  const productMap = new Map(products.map((p) => [p.id, p]));

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Banner</CardTitle>
          <CardDescription>
            Create a new banner for your home page carousel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BannerForm products={products} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Banners</CardTitle>
        </CardHeader>
        <CardContent>
           {loading ? (
            <div className="flex justify-center items-center h-24">
                <Loader2 className="animate-spin" />
            </div>
           ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Linked Product</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map((banner) => {
                const product = productMap.get(banner.productId);
                return (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        width={100}
                        height={50}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell>{product?.name || "N/A"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
           )}
        </CardContent>
      </Card>
    </div>
  );
}

