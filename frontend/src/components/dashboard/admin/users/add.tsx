import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userCreationSchema, type userCreate } from "@/lib/validation";
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

export function Add({
  crud,
  onOpenChange,
  open,
}: {
  crud: Crud;
  onOpenChange: (state: boolean) => void;
  open: boolean;
}) {
  // Initialize with empty object with default values instead of null
  const [newUser, setNewUser] = useState<userCreate>({
    username: "",
    password: "",
    role: "user",
  });
  const [alertOpen, setAlertOpen] = useState(false);

  const reset = () => setNewUser({ username: "", password: "", role: "user" });

  const handleSubmit = async () => {
    const { success, data, error } = userCreationSchema.safeParse(newUser);
    if (!success) {
      toast.error("Validation error");
      reset();
      return;
    }

    try {
      const response = await fetch(`http://localhost:1337/api/users`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        toast.error(`Username ${newUser.username} taken`);
        return;
      }

      if (response.ok) {
        const json = await response.json();
        crud.add(json.data[0]);
        toast.success(`Added user ${newUser.username}`);
        reset();
        setAlertOpen(false);
        onOpenChange(false); // Close the dialog after successful update
      }
    } catch (err) {
      toast.error("An Error Occurred");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Create a user. Click save when you're done.
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
              onChange={(e) => {
                setNewUser({ ...newUser, username: e.target.value });
              }}
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
              value={newUser.password}
              onChange={(e) => {
                setNewUser({ ...newUser, password: e.target.value });
              }}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Role
            </Label>
            <Select
              value={newUser.role}
              onValueChange={(value: "admin" | "user") => {
                setNewUser({ ...newUser, role: value });
              }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Choose role" />
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
              <Button>Create</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will add the account to the database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
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
