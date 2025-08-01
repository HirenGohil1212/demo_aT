
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { updateProduct } from "@/actions/product-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { Category, Product } from "@/types";
import { Loader2, Image as ImageIcon, Upload } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

type EditProductFormProps = {
  categories: Category[];
  product: Product;
};

export function EditProductForm({ categories, product }: EditProductFormProps) {
  const [state, formAction, isPending] = useActionState(updateProduct.bind(null, product.id), undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const [imagePreview, setImagePreview] = useState<string | null>(product.image);
  const [imageUrl, setImageUrl] = useState<string>(product.image);
  const [isUploading, setIsUploading] = useState(false);

  // NOTE: The uploadFile function in storage.ts was removed as it was Firebase-specific.
  // A new client-side upload solution will be needed.
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast({ variant: "destructive", title: "Upload Not Implemented", description: "Image uploading needs to be configured for the new backend." });
      setImagePreview(URL.createObjectURL(file));
      // In a real implementation, you would upload the file to your new backend
      // and get a URL back, then call setImageUrl(url).
    }
  };

  useEffect(() => {
    if (state?.error) {
       const errorMessages = Object.values(state.error).flat().join(" \n");
       toast({
          variant: "destructive",
          title: "Error updating product",
          description: errorMessages,
       });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" required defaultValue={product.name} />
        {state?.error?.name && <div className="text-destructive text-sm">{state.error.name[0]}</div>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (INR)</Label>
          <Input type="number" step="0.01" id="price" name="price" required defaultValue={product.price} />
          {state?.error?.price && <div className="text-destructive text-sm">{state.error.price[0]}</div>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity (ml)</Label>
          <Input type="number" id="quantity" name="quantity" placeholder="e.g. 750" required defaultValue={product.quantity} />
          {state?.error?.quantity && <div className="text-destructive text-sm">{state.error.quantity[0]}</div>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" required defaultValue={product.category}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.error?.category && <div className="text-destructive text-sm">{state.error.category[0]}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Product Image</Label>
        <div className="flex items-center gap-4">
          <div className="w-32 h-32 border rounded-md flex items-center justify-center bg-muted/30">
            {imagePreview ? (
              <Image src={imagePreview} alt="Image Preview" width={128} height={128} className="object-contain w-full h-full rounded-md" />
            ) : (
              <ImageIcon className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2 flex-grow">
             <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              {isUploading ? <><Loader2 className="animate-spin mr-2"/> Uploading...</> : <><Upload className="mr-2"/>Change Image</>}
            </Button>
            <Input 
              id="image" 
              name="imageFile"
              type="file" 
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground">Recommended: 600x600px (1:1)</p>
          </div>
        </div>
        {state?.error?.imageUrl && <div className="text-destructive text-sm">{state.error.imageUrl[0]}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required defaultValue={product.description} />
        {state?.error?.description && <div className="text-destructive text-sm">{state.error.description[0]}</div>}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="featured" name="featured" defaultChecked={product.featured} />
        <Label htmlFor="featured">Featured Product</Label>
      </div>
      
      {state?.error?._server && <div className="text-destructive text-sm">{state.error._server[0]}</div>}

      <Button type="submit" className="w-full" disabled={isPending || isUploading}>
        {isPending ? <><Loader2 className="animate-spin mr-2"/> Saving...</> : "Save Changes"}
        {isUploading && " (Waiting for upload...)"}
      </Button>
    </form>
  );
}
