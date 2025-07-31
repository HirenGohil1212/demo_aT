
"use client";

import { addBanner, deleteBanner } from "@/actions/banner-actions";
import type { Banner, Product } from "@/types";
import { Button } from "@/components/ui/button";
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
import { Loader2, Image as ImageIcon, Trash2, Upload, Link as LinkIcon } from "lucide-react";
import { useState, useRef, useTransition, useActionState, useEffect, useCallback } from "react";
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
import { Card, CardContent } from "@/components/ui/card";

function BannerForm({ products, onBannerAdded }: { products: Product[], onBannerAdded: (newBanner: Banner) => void }) {
  const [state, formAction, isPending] = useActionState(addBanner, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.success && state.banner) {
      toast({ title: "Success", description: "New banner has been added." });
      onBannerAdded(state.banner as Banner);
      formRef.current?.reset();
      setImagePreview(null);
      setImageUrl('');
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
    } else if (state?.error) {
       const errorMessages = Object.values(state.error).flat().join(" \n");
       toast({
          variant: "destructive",
          title: "Error adding banner",
          description: errorMessages,
       });
    }
  }, [state, onBannerAdded, toast]);


  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setImagePreview(URL.createObjectURL(file));

      try {
        const url = await uploadFile(file, 'banners');
        setImageUrl(url); 
        toast({ title: "Success", description: "Image uploaded successfully." });
      } catch (error) {
        console.error("Image upload failed:", error);
        toast({ variant: "destructive", title: "Upload Failed", description: "Could not upload image. Please try again." });
        setImagePreview(null);
        setImageUrl('');
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } finally {
        setIsUploading(false);
      }
    }
  };
  
  const isSubmitDisabled = isUploading || isPending || !imageUrl;

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <div className="space-y-2">
        <Label htmlFor="title">Banner Title</Label>
        <Input name="title" id="title" placeholder="e.g. Summer Special" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Banner Subtitle</Label>
        <Input name="subtitle" id="subtitle" placeholder="e.g. The finest spirits for the season" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageFile">Banner Image</Label>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-48 h-24 border rounded-md flex items-center justify-center bg-muted/30 flex-shrink-0">
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
              name="imageFile" 
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
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
       <Button type="submit" disabled={isSubmitDisabled}>
          {isPending && <Loader2 className="animate-spin mr-2" />}
          {isUploading ? "Waiting for upload..." : "Add Banner"}
      </Button>
    </form>
  )
}

function DeleteBannerButton({ bannerId, onDelete }: { bannerId: string, onDelete: () => void }) {
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteBanner(bannerId);
            if (result?.success) {
                onDelete();
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

export function BannersClient({ initialProducts, initialBanners }: { initialProducts: Product[], initialBanners: Banner[] }) {
  const [products] = useState<Product[]>(initialProducts);
  const [banners, setBanners] = useState<Banner[]>(initialBanners);

  const handleBannerAdded = useCallback((newBanner: Banner) => {
    setBanners(prevBanners => [newBanner, ...prevBanners]);
  }, []);

  const handleBannerDeleted = useCallback((deletedBannerId: string) => {
    setBanners(prevBanners => prevBanners.filter(banner => banner.id !== deletedBannerId));
  }, []);

  const productMap = new Map(products.map((p) => [p.id, p.name]));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div>
        <h3 className="text-lg font-medium mb-4">Add New Banner</h3>
        <BannerForm products={products} onBannerAdded={handleBannerAdded} />
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-4">Existing Banners</h3>
        {banners.length === 0 ? (
            <p className="text-muted-foreground text-center p-8 border rounded-md">No banners have been created yet.</p>
        ) : (
          <div className="space-y-4">
            {banners.map((banner) => (
              <Card key={banner.id}>
                <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                    <Image
                        src={banner.imageUrl}
                        alt={banner.title}
                        width={150}
                        height={75}
                        className="rounded-md object-cover aspect-[2/1] flex-shrink-0"
                    />
                    <div className="flex-grow text-center sm:text-left">
                      <p className="font-bold text-lg">{banner.title}</p>
                      <div className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                        <LinkIcon className="h-3 w-3"/>
                        <span>{productMap.get(banner.productId) || "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-center">
                      <DeleteBannerButton bannerId={banner.id} onDelete={() => handleBannerDeleted(banner.id)} />
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
