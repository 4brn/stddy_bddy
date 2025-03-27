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
import type { TestSelect as Test, TestCrud as Crud } from "@shared/types";
import { toast } from "sonner";

export default function TestDelete({
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
        toast.success(`Deleted test (${test.id})`);
        crud.delete(test);
        onOpenChange(false);
      } else {
        toast.error("Could not delete test");
      }
    } catch (error) {
      toast.error("Something happened");
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
          <AlertDialogAction onClick={handleDelete}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
