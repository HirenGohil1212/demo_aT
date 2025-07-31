
"use client";

import { useTransition } from "react";
import { addProduct } from "@/actions/product-actions";
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
import type { Category } from "@/types";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/storage";


type ProductFormProps = {
  categories: Category[];
};


export function ProductForm({ categories }: ProductFormProps) {
  const [isSubmitting, startSubmitting] = useTransition();
  const [error, setError] = useState<Record<string, string[]> | { serverError: string[] } | null>(null);
  
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setImagePreview(URL.createObjectURL(file));
      
      try {
        const downloadURL = await uploadFile(file, 'products');
        setImageUrl(downloadURL);
      } catch (uploadError: any) {
        console.error("Upload failed:", uploadError);
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: uploadError.message || "There was a problem with the upload. Please try again."
        });
        setImagePreview(null);
        setImageUrl("");
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSubmit = async (formData: FormData) => {
    formData.set('imageUrl', imageUrl);
    startSubmitting(async () => {
      const result = await addProduct(null, formData);
      if (result) { // addProduct redirects on success, so we only handle errors
        setError(result);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" required />
        {error && 'name' in error && <div className="text-destructive text-sm">{error.name[0]}</div>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="price">Price (INR)</Label>
            <Input type="number" step="0.01" id="price" name="price" required />
            {error && 'price' in error && <div className="text-destructive text-sm">{error.price[0]}</div>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (ml)</Label>
            <Input type="number" id="quantity" name="quantity" placeholder="e.g. 750" required />
            {error && 'quantity' in error && <div className="text-destructive text-sm">{error.quantity[0]}</div>}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select name="category" required>
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
        {error && 'category' in error && <div className="text-destructive text-sm">{error.category[0]}</div>}
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
            <Input 
                id="image" 
                name="imageFile" 
                type="file" 
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
                disabled={isUploading}
            />
             <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : "Choose Image"}
            </Button>
            <p className="text-xs text-muted-foreground">Recommended: 600x600px (1:1)</p>
          </div>
        </div>
         {error && 'imageUrl' in error && <div className="text-destructive text-sm">{error.imageUrl[0]}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required />
        {error && 'description' in error && <div className="text-destructive text-sm">{error.description[0]}</div>}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="featured" name="featured" />
        <Label htmlFor="featured">Featured Product</Label>
      </div>
      
      {error && 'serverError' in error && <div className="text-destructive text-sm">{error.serverError[0]}</div>}

      <Button type="submit" disabled={isUploading || isSubmitting} className="w-full">
        {isUploading 
            ? <><Loader2 className="animate-spin mr-2" /> Waiting for upload...</>
            : isSubmitting 
            ? <><Loader2 className="animate-spin mr-2" /> Adding Product...</>
            : "Add Product"
        }
      </Button>
    </form>
  );
}
