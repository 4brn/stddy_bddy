import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Crud } from "./users";
import type { User } from "@schema";
import { toast } from "sonner";

export function Delete({
  user,
  crud,
  onOpenChange,
  open,
}: {
  user: User;
  crud: Crud;
  onOpenChange: (state: boolean) => void;
  open: boolean;
}) {
  const handleDelete = async () => {
    const response = await fetch(`http://localhost:1337/api/users/${user.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!response.ok) toast.error("Could not delete user");
    if (response.ok) {
      toast.success(`Deleted ${user.username}`);
      crud.delete(user);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
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
