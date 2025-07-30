
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { products, categories as initialCategories } from "@/lib/products";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters."),
});

type CategoryFormValues = z.infer<typeof categorySchema>;


export default function CategoriesPage() {
    const { toast } = useToast();
    // In a real app, this would be fetched and updated via an API
    const [categories, setCategories] = useState(initialCategories);

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: "" },
    });

    const onSubmit = (data: CategoryFormValues) => {
        // This is a simulation of an API call.
        console.log("Adding category (simulation):", data);
        if (categories.some(c => c.toLowerCase() === data.name.toLowerCase())) {
             toast({
                variant: 'destructive',
                title: "Category Exists",
                description: `The category "${data.name}" already exists.`,
            });
            return;
        }

        setCategories(prev => [...prev, data.name as any]);
        toast({
            title: "Category Added",
            description: `The category "${data.name}" has been added. (Simulation)`,
        });
        form.reset();
    };

  return (
    <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Product Categories</CardTitle>
                <CardDescription>
                    Manage the categories for your products.
                </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    {categories.map(category => (
                        <Badge key={category} variant="secondary" className="text-lg py-2 px-4">
                            {category}
                        </Badge>
                    ))}
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Add New Category</CardTitle>
                    <CardDescription>
                        Create a new category for your products.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                             <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Liqueur" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Category
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
