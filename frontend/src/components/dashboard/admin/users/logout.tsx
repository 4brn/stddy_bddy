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
import type { Crud, UserWithSession } from "./users";
import { toast } from "sonner";

export function LogOut({
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
    const response = await fetch(
      `http://localhost:1337/api/users/logout/${user.id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    if (!response.ok) toast.error("Could not log out user");
    if (response.ok) {
      toast.success(`Logged out ${user.username}`);
      crud.logout(user);
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
