
"use server";

import { getBanners } from "@/actions/banner-actions";
import { getProducts } from "@/actions/product-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BannersClient } from "./_components/banners-client";


export default async function BannersPage() {
  const [initialBanners, initialProducts] = await Promise.all([
    getBanners(),
    getProducts(),
  ]);

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Banners</CardTitle>
          <CardDescription>
            Create, view, and delete banners for your home page carousel.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <BannersClient initialBanners={initialBanners} initialProducts={initialProducts} />
        </CardContent>
      </Card>
    </div>
  );
}
