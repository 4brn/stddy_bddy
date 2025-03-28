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
import type { Crud, UserWithSession } from "@shared/types";
import { toast } from "sonner";

export function UserLogout({
  user,
  crud,
  onOpenChange,
  open,
}: {
  user: UserWithSession;
  crud: Crud;
  onOpenChange: (state: boolean) => void;
  open: boolean;
}) {
  const handleLogOut = async () => {
    try {
      const response = await fetch(
        `http://localhost:1337/api/users/logout/${user.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        toast.success(`Logged out ${user.username}`);
        crud.logout(user);
      } else {
        toast.error("Could not log out user");
      }
    } catch (error) {
      toast.error("Failed to process logout request");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleLogOut}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
