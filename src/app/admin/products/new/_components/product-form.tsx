
"use client";

import { useActionState } from "react";
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
import { Loader2, Image as ImageIcon, UploadCloud } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState, useRef } from "react";
import Image from "next/image";
import { uploadFile } from "@/lib/storage";
import { Progress } from "@/components/ui/progress";

type ProductFormProps = {
  categories: Category[];
};

function SubmitButton({ isUploading }: { isUploading: boolean }) {
    const { pending } = useFormStatus();
    const isDisabled = pending || isUploading;
    return (
        <Button type="submit" disabled={isDisabled} className="w-full">
            {isUploading 
                ? <><UploadCloud className="animate-bounce mr-2" /> Uploading Image...</>
                : pending 
                ? <><Loader2 className="animate-spin mr-2" /> Adding Product...</>
                : "Add Product"
            }
        </Button>
    )
}

export function ProductForm({ categories }: ProductFormProps) {
  const [error, action] = useActionState(addProduct, {});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setIsUploading(true);
      setUploadProgress(0);
      setUploadError(null);
      try {
        const url = await uploadFile(file, 'products', setUploadProgress);
        setImageUrl(url); // Set the URL for the hidden input
      } catch (uploadError: any) {
        console.error("Image upload failed:", uploadError);
        setUploadError(uploadError.message || "Image upload failed. Please try again.");
      } finally {
        setIsUploading(false);
      }
    } else {
        setImagePreview(null);
        setImageUrl("");
    }
  };

  return (
    <form action={action} className="space-y-6">
       {/* Hidden input to hold the uploaded image URL */}
      <input type="hidden" name="imageUrl" value={imageUrl} />
      
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" required />
        {error?.name && <div className="text-destructive text-sm">{error.name[0]}</div>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="price">Price (INR)</Label>
            <Input type="number" step="0.01" id="price" name="price" required />
            {error?.price && <div className="text-destructive text-sm">{error.price[0]}</div>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="quantity">Quantity (ml)</Label>
            <Input type="number" id="quantity" name="quantity" placeholder="e.g. 750" required />
            {error?.quantity && <div className="text-destructive text-sm">{error.quantity[0]}</div>}
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
        {error?.category && <div className="text-destructive text-sm">{error.category[0]}</div>}
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
                name="image" 
                type="file" 
                required 
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
                disabled={isUploading}
            />
             <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                Choose Image
            </Button>
            <p className="text-xs text-muted-foreground">Recommended: 600x600px (1:1)</p>
             {isUploading && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Uploading... {Math.round(uploadProgress)}%</p>
                <Progress value={uploadProgress} className="w-full h-2" />
              </div>
            )}
            {uploadError && <p className="text-sm text-destructive">{uploadError}</p>}
          </div>
        </div>
         {error?.imageUrl && <div className="text-destructive text-sm">{error.imageUrl[0]}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required />
        {error?.description && <div className="text-destructive text-sm">{error.description[0]}</div>}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="featured" name="featured" />
        <Label htmlFor="featured">Featured Product</Label>
      </div>
      
      {error?.serverError && <div className="text-destructive text-sm">{error.serverError[0]}</div>}

      <SubmitButton isUploading={isUploading} />
    </form>
  );
}
