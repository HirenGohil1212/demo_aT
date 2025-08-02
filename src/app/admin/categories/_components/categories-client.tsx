
"use client";

import { useState, useActionState, useRef, useTransition, useCallback, useEffect } from "react";
import { addCategory, deleteCategory } from "@/actions/category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function AddCategoryForm({
  formAction,
  isPending,
}: {
  formAction: (data: FormData) => void;
  isPending: boolean;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  // This effect will run after the server action is complete.
  // The parent component will manage clearing the form by watching the `isPending` state.
  useEffect(() => {
    if (!isPending) {
      formRef.current?.reset();
    }
  }, [isPending]);

  return (
    <form ref={formRef} action={formAction} className="flex gap-4 mb-8">
      <Input
        name="name"
        placeholder="New Category Name"
        required
        className="max-w-xs"
        aria-label="Category Name"
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? <><Loader2 className="animate-spin mr-2" /> Adding...</> : "Add Category"}
      </Button>
    </form>
  );
}

function DeleteCategoryButton({
  category,
  onDelete,
}: {
  category: Category;
  onDelete: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result?.success) {
        onDelete();
        toast({
          title: "Success",
          description: `Category "${category.name}" has been deleted.`,
        });
      } else if (result?.error) {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: result.error,
        });
      }
      setIsDialogOpen(false);
    });
  };

  return (
    <>
      <Button
        variant="destructive"
        size="icon"
        onClick={() => setIsDialogOpen(true)}
        disabled={isPending}
        className="h-8 w-8"
        aria-label={`Delete category ${category.name}`}
      >
        {isPending ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. You can only delete a category if no
              products are assigned to it.
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
  );
}

export function CategoriesClient({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] =
    useState<Category[]>(initialCategories);
  const [state, formAction, isPending] = useActionState(addCategory, undefined);
  const { toast } = useToast();
  const nameInputRef = useRef<string | null>(null);

  const wrappedFormAction = (formData: FormData) => {
    const name = formData.get("name") as string;
    // Store the name optimistically
    if (name) {
      nameInputRef.current = name;
    }
    formAction(formData);
  };

  useEffect(() => {
    if (state?.success && nameInputRef.current) {
      toast({
        title: "Success",
        description: `Category "${nameInputRef.current}" has been added.`,
      });
      // Optimistically add the new category to the UI.
      // A proper solution might use the ID from the server, but for now, this provides instant feedback.
      // Revalidation from the server action will eventually sync the correct state.
      setCategories((prev) =>
        [
          ...prev,
          { id: `temp-${Date.now()}`, name: nameInputRef.current! },
        ].sort((a, b) => a.name.localeCompare(b.name))
      );
      nameInputRef.current = null; // Clear the ref
    } else if (state?.error) {
      toast({
        variant: "destructive",
        title: "Failed to Add",
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleCategoryDeleted = useCallback((deletedCategoryId: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== deletedCategoryId));
  }, []);

  return (
    <div>
      <AddCategoryForm formAction={wrappedFormAction} isPending={isPending} />

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-center text-muted-foreground py-8"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell className="text-right">
                    <DeleteCategoryButton
                      category={category}
                      onDelete={() => handleCategoryDeleted(category.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
