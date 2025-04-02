import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import type { UserCrud, UserInsert } from "@shared/types";
import { User as UserValidation } from "@/lib/validation";
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
  SelectGroup,
  SelectItem,
  SelectLabel,
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
} from "@/components/ui/alert-dialog";

export default function UserAdd({
  crud,
  onOpenChange,
  open,
}: {
  crud: UserCrud;
  onOpenChange: (state: boolean) => void;
  open: boolean;
}) {
  const defaultUser: UserInsert = {
    username: "",
    password: "",
    role: "user" as const,
  };
  const [newUser, setNewUser] = useState<UserInsert>(defaultUser);
  const [alertOpen, setAlertOpen] = useState(false);

  const reset = () => setNewUser(defaultUser);

  const handleSubmit = async () => {
    const { success, data } = UserValidation.omit({ id: true }).safeParse(
      newUser,
    );
    if (!success) {
      reset();
      toast.error("User validation fail");
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
        toast.error(`Username ${data.username} taken`);
        return;
      }

      if (response.ok) {
        crud.add();
        reset();
        setAlertOpen(false);
        onOpenChange(false);
        toast.success(`User created: ${data.username}`);
      }
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleInputChange = (field: keyof UserInsert, value: string) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle>Create user</DialogTitle>
            <DialogDescription>
              Create a user. Click "Save" when you're done.
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
                onChange={(e) => handleInputChange("username", e.target.value)}
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
                onChange={(e) => handleInputChange("password", e.target.value)}
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
                  handleInputChange("role", value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Choose role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="user">user</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setAlertOpen(true)}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
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
    </>
  );
}
