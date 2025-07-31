
"use client";

import { useState, useEffect, useActionState, useRef, useTransition } from "react";
import { getCategories, addCategory, deleteCategory } from "@/actions/category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trash2 } from "lucide-react";
import type { Category } from "@/types";
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
import { Skeleton } from "@/components/ui/skeleton";

function AddCategoryForm({ onCategoryAdded }: { onCategoryAdded: () => void }) {
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, isPending] = useActionState(async (prevState: unknown, formData: FormData) => {
        const result = await addCategory(prevState, formData);
        if (result?.success) {
            onCategoryAdded();
            formRef.current?.reset();
        }
        return result;
    }, undefined);

    return (
        <form ref={formRef} action={formAction} className="flex gap-4">
            <Input
              name="name"
              placeholder="Category Name"
              required
              className="max-w-xs"
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="animate-spin" /> Adding...</> : "Add Category"}
            </Button>
            {state?.error && <p className="text-destructive text-sm self-center">{state.error as string}</p>}
        </form>
    )
}

function DeleteCategoryButton({ category, onDelete }: { category: Category, onDelete: (id: string, name: string) => void }) {
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();
    
    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteCategory(category.id);
            if (result?.success) {
                onDelete(category.id, category.name);
                toast({ title: "Success", description: `Category "${category.name}" has been deleted.`})
            } else if (result?.error) {
                toast({ variant: "destructive", title: "Deletion Failed", description: result.error })
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
            className="h-8 w-8"
        >
            {isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
        </Button>
         <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. You can only delete a category if no products are assigned to it.
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

function CategoryTableSkeleton() {
    return (
         <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell>
                           <Skeleton className="h-5 w-32" />
                        </TableCell>
                        <TableCell className="text-right">
                           <Skeleton className="h-8 w-8 ml-auto" />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}


export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setLoading(false);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCategoryDeleted = (deletedCategoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== deletedCategoryId));
  };


  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Category</CardTitle>
          <CardDescription>
            Create a new category for your products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddCategoryForm onCategoryAdded={loadCategories} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Existing Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
             <CategoryTableSkeleton />
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                   <TableCell className="text-right">
                       <DeleteCategoryButton category={category} onDelete={handleCategoryDeleted} />
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
