
"use client";

import { addBanner, deleteBanner, getBanners } from "@/actions/banner-actions";
import { getProducts } from "@/actions/product-actions";
import type { Banner, Product } from "@/types";
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
import { Loader2, Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { useState, useRef, useEffect, useTransition, useActionState } from "react";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/storage";


function BannerForm({ products, onBannerAdded }: { products: Product[], onBannerAdded: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const [state, formAction, isPending] = useActionState(addBanner, undefined);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setImagePreview(URL.createObjectURL(file)); // Show preview immediately

      try {
        const url = await uploadFile(file, 'banners');
        setImageUrl(url); // Set the URL for form submission
        toast({ title: "Success", description: "Image uploaded successfully." });
      } catch (error) {
        console.error("Image upload failed:", error);
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload image. Please try again." });
        setImagePreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // Reset file input
        }
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  useEffect(() => {
    if (!state) return;
    if (state.success) {
      toast({ title: "Success", description: "New banner has been added." });
      onBannerAdded();
      formRef.current?.reset();
      setImagePreview(null);
      setImageUrl('');
    } else if (state.error) {
       const errorMessages = Object.values(state.error).flat().join(" \n");
       toast({
          variant: "destructive",
          title: "Error adding banner",
          description: errorMessages,
       });
    }
  }, [state, onBannerAdded, toast]);


  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <div className="space-y-2">
        <Label htmlFor="title">Banner Title</Label>
        <Input name="title" id="title" placeholder="e.g. Summer Special" required />
        {state?.error?.title && <p className="text-sm text-destructive mt-1">{state.error.title[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Banner Subtitle</Label>
        <Input name="subtitle" id="subtitle" placeholder="e.g. The finest spirits for the season" required />
        {state?.error?.subtitle && <p className="text-sm text-destructive mt-1">{state.error.subtitle[0]}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageFile">Banner Image</Label>
        <div className="flex items-center gap-4">
          <div className="w-48 h-24 border rounded-md flex items-center justify-center bg-muted/30">
            {imagePreview ? (
              <Image src={imagePreview} alt="Image Preview" width={192} height={96} className="object-cover w-full h-full rounded-md" />
            ) : (
              <ImageIcon className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2 flex-grow">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? <><Loader2 className="animate-spin mr-2"/> Uploading...</> : <><Upload className="mr-2"/>Select Image</>}
            </Button>
            <Input
              id="imageFile"
              name="imageFile" // Name is not used for submission, just for the ref
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">Recommended: 1200x600px</p>
          </div>
        </div>
        {state?.error?.imageUrl && <p className="text-sm text-destructive mt-1">{state.error.imageUrl[0]}</p>}
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
        {state?.error?.productId && <p className="text-sm text-destructive mt-1">{state.error.productId[0]}</p>}
      </div>
       <Button type="submit" disabled={isPending || isUploading || !imageUrl}>
          {isPending ? <><Loader2 className="animate-spin mr-2" /> Adding Banner...</> : "Add Banner"}
          {isUploading && " (Waiting for upload...)"}
      </Button>
      {state?.error?._server && <p className="text-sm text-destructive mt-2">{state.error._server[0]}</p>}
    </form>
  )
}


function DeleteBannerButton({ bannerId, onDelete }: { bannerId: string, onDelete: (id: string) => void }) {
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteBanner(bannerId);
            if (result?.success) {
                onDelete(bannerId);
            }
            setIsDialogOpen(false);
        });
    }

    return (
      <>
        <Button
            variant="destructive"
            size="icon"
            onClick={() => setIsDialogOpen(true)}
            disabled={isPending}
        >
            {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
        </Button>
         <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the banner
                        and its image from the server.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                        {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
     </>
    )
}


export default function BannersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
      setLoading(true);
      try {
        const [bannersData, productsData] = await Promise.all([
          getBanners(),
          getProducts(),
        ]);
        setBanners(bannersData);
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to load page data:", error);
      } finally {
        setLoading(false);
      }
  }

  useEffect(() => {
    loadData();
  }, [])

  const handleBannerDeleted = (deletedBannerId: string) => {
    setBanners(prevBanners => prevBanners.filter(banner => banner.id !== deletedBannerId));
  }


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
          <BannerForm products={products} onBannerAdded={loadData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Banners</CardTitle>
        </CardHeader>
        <CardContent>
           {loading && <div className="flex justify-center items-center p-8"><Loader2 className="animate-spin" /></div>}
           {!loading && banners.length === 0 && <p className="text-muted-foreground text-center">No banners have been created yet.</p>}
           {!loading && banners.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Linked Product</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="text-right">
                       <DeleteBannerButton bannerId={banner.id} onDelete={handleBannerDeleted} />
                    </TableCell>
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
