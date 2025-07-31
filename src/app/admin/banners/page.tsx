
"use client";

import { useActionState } from "react";
import { addBanner, deleteBanner } from "@/actions/banner-actions";
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
import { Loader2, Image as ImageIcon, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState, useRef, useEffect, useTransition } from "react";
import Image from "next/image";
import { getProducts } from "@/actions/product-actions";
import { getBanners } from "@/actions/banner-actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";


function BannerForm({ products, onBannerAdded }: { products: Product[], onBannerAdded: () => void }) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();


  const [error, action, isPending] = useActionState(async (prevState: unknown, formData: FormData) => {
    // Manually set imageUrl on formData before calling the action
    formData.set('imageUrl', imageUrl);
    const result = await addBanner(prevState, formData);
    if (result?.success) {
        onBannerAdded();
        formRef.current?.reset();
        setImagePreview(null);
        setImageUrl("");
    }
    return result;
  }, undefined);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setIsUploading(true);

      try {
        const storageRef = ref(storage, `banners/${uuidv4()}-${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        setImageUrl(downloadURL);
      } catch (uploadError: any) {
        console.error("Image upload failed:", uploadError);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: "There was a problem uploading your image. Please try again."
        })
        setImagePreview(null);
        setImageUrl("");
      } finally {
        setIsUploading(false);
      }
    } else {
        setImagePreview(null);
        setImageUrl("");
    }
  };

  return (
     <form ref={formRef} action={action} className="space-y-4">
      {/* Hidden input to hold the uploaded image URL */}
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
        <div className="flex items-center gap-4">
          <div className="w-48 h-24 border rounded-md flex items-center justify-center bg-muted/30">
             {imagePreview ? (
                <Image src={imagePreview} alt="Image Preview" width={192} height={96} className="object-cover w-full h-full rounded-md" />
            ) : (
                <ImageIcon className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
           <div className="space-y-2 flex-grow">
            <Input 
                id="imageFile" 
                name="imageFile" 
                type="file" 
                required 
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
                disabled={isUploading}
            />
             <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Choose Image"}
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
      <SubmitButton isUploading={isUploading} isPending={isPending} />
      {error && 'error' in error && <p className="text-sm text-destructive">{error.error as string}</p>}
    </form>
  )
}


function SubmitButton({ isUploading, isPending }: { isUploading: boolean, isPending: boolean }) {
    const isDisabled = isUploading || isPending;
    return (
        <Button type="submit" disabled={isDisabled}>
            {isUploading 
                ? <><Loader2 className="animate-spin mr-2" /> Uploading...</>
                : isPending 
                ? <><Loader2 className="animate-spin mr-2" /> Adding Banner...</>
                : "Add Banner"
            }
        </Button>
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
      const [bannersData, productsData] = await Promise.all([
        getBanners(),
        getProducts(),
      ]);
      setBanners(bannersData);
      setProducts(productsData);
      setLoading(false);
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
