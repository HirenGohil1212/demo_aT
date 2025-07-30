
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
import { Loader2, Image as ImageIcon } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState, useRef } from "react";
import Image from "next/image";

type ProductFormProps = {
  categories: Category[];
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? <Loader2 className="animate-spin" /> : "Add Product"}
        </Button>
    )
}

export function ProductForm({ categories }: ProductFormProps) {
  const [error, action] = useActionState(addProduct, {});
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
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" required />
        {error?.name && <div className="text-destructive text-sm">{error.name[0]}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (in cents)</Label>
        <Input type="number" id="price" name="price" required />
         {error?.price && <div className="text-destructive text-sm">{error.price[0]}</div>}
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
                <Image src={imagePreview} alt="Image Preview" width={128} height={128} className="object-cover w-full h-full rounded-md" />
            ) : (
                <ImageIcon className="w-16 h-16 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <Input 
                id="image" 
                name="image" 
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
            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
          </div>
        </div>
         {error?.image && <div className="text-destructive text-sm">{error.image[0]}</div>}
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

      <SubmitButton />
    </form>
  );
}
