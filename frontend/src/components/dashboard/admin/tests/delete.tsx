// stddy_bddy/frontend/src/components/dashboard/admin/tests/delete.tsx
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
import type { Crud } from "./tests";
import type { Test } from "@schema";
import { toast } from "sonner";

export function Delete({
  test,
  crud,
  onOpenChange,
  open,
}: {
  test: Test;
  crud: Crud;
  onOpenChange: (state: boolean) => void;
  open: boolean;
}) {
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:1337/api/tests/${test.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        toast.success(`Deleted test: ${test.title}`);
        crud.delete(test);
        onOpenChange(false);
      } else {
        toast.error("Could Not Delete Test");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the test
            and all associated data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
