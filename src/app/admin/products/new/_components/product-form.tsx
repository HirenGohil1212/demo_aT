"use client";

import { useActionState } from "react";
import { addProduct } from "@/services/product-service";
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
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type ProductFormProps = {
  categories: Category[];
};

export function ProductForm({ categories }: ProductFormProps) {
  const [error, action] = useActionState(addProduct, {});

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" name="name" required />
        {error?.name && <div className="text-destructive text-sm">{error.name}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Price (in cents)</Label>
        <Input type="number" id="price" name="price" required />
         {error?.price && <div className="text-destructive text-sm">{error.price}</div>}
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
        {error?.category && <div className="text-destructive text-sm">{error.category}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image URL</Label>
        <Input type="url" id="image" name="image" required defaultValue="https://placehold.co/600x600.png" />
        {error?.image && <div className="text-destructive text-sm">{error.image}</div>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required />
        {error?.description && <div className="text-destructive text-sm">{error.description}</div>}
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="featured" name="featured" />
        <Label htmlFor="featured">Featured Product</Label>
      </div>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending ? <Loader2 className="animate-spin" /> : "Add Product"}
        </Button>
    )
}
