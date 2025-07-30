"use server";
import { getProducts, addBanner, getBanners } from "@/services/product-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import Image from "next/image";
import type { Banner, Product } from "@/types";

// Helper function to create a lookup map for products
function createProductMap(products: Product[]): Map<string, Product> {
  return new Map(products.map((p) => [p.id, p]));
}

export default async function BannersPage() {
  const products = await getProducts();
  const banners = await getBanners();
  const productMap = createProductMap(products);

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
          <form action={addBanner} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Banner Title</Label>
              <Input name="title" id="title" placeholder="e.g. Summer Special" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Banner Subtitle</Label>
              <Input name="subtitle" id="subtitle" placeholder="e.g. The finest spirits for the season" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input name="imageUrl" id="imageUrl" placeholder="https://placehold.co/1200x600.png" required type="url" />
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
            <Button type="submit">Add Banner</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Banners</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
}