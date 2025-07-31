
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
import { Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

type EditProductFormProps = {
  categories: Category[];
  product: Product;
};

export function EditProductForm({ categories, product }: EditProductFormProps) {
  const [state, formAction] = useActionState(updateProduct.bind(null, product.id), undefined);
  const { toast } = useToast();

  const [imagePreview, setImagePreview] = useState<string | null>(product.image);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      <input type="hidden" name="imageUrl" value={product.image} />
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" required defaultValue={product.name} />
        {state?.error?.name && <div className="text-destructive text-sm">{state.error.name[0]}</div>}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            <Input 
              id="image" 
              name="imageFile"
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
            />
            <p className="text-xs text-muted-foreground">Change image (optional). Recommended: 600x600px (1:1)</p>
          </div>
        </div>
        {state?.error?.imageFile && <div className="text-destructive text-sm">{state.error.imageFile[0]}</div>}
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

      <Button type="submit" className="w-full">
        {/* The useFormStatus hook can be used here if we extract the button */}
        Saving Changes...
      </Button>
    </form>
  );
}
