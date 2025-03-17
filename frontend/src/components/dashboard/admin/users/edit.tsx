import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userUpdateSchema } from "@/lib/validation";
import type { User } from "@schema";
import { useState } from "react";
import { toast } from "sonner";
import type { Crud } from "./users";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function Edit({
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
  const [newUser, setNewUser] = useState<User>(user);
  const [alertOpen, setAlertOpen] = useState(false);

  const reset = () => setNewUser(user);

  const handleSubmit = async () => {
    const { success, data } = userUpdateSchema.safeParse(newUser);
    if (!success) {
      reset();
      toast.error("Validation error");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:1337/api/users/${data.id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        throw new Error("Server responded with an error");
      }

      crud.update(newUser);
      toast.success("User Updated.");
      setAlertOpen(false);
      onOpenChange(false);
    } catch (error) {
      reset();
      toast.error("An Error Occurred");
    }
  };

  const handleChange = (field: keyof User, value: string) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              value={newUser.username}
              onChange={(e) => handleChange("username", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="optional"
              value={newUser.password === user.password ? "" : newUser.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select
              value={newUser.role}
              onValueChange={(value: "admin" | "user") =>
                handleChange("role", value)
              }
            >
              <SelectTrigger className="col-span-3" id="role">
                <SelectValue placeholder={newUser.role} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">admin</SelectItem>
                <SelectItem value="user">user</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button>Save</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will change the account data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={reset}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSubmit}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
