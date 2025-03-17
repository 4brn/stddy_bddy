import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { UserWithSession, Crud } from "./users";
import { Ellipsis } from "lucide-react";
import { toast } from "sonner";
import { Edit } from "./edit";
import { useState } from "react";
import { Delete } from "./delete";
import { LogOut } from "./logout";

export default function UserMenu({
  user,
  crud,
}: {
  user: UserWithSession;
  crud: Crud;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [logOutOpen, setLogOutOpen] = useState(false);

  const handleCopy = () => {
    const info = `id: ${user.id}, username: ${user.username}, password: ${user.password}, role: ${user.role}`;
    navigator.clipboard.writeText(info);
    toast.info("User info copied to clipboard");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleCopy}>Copy</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuItem
            disabled={!user.active}
            onClick={() => setLogOutOpen(true)}
          >
            Log out
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogOut
        user={user}
        crud={crud}
        open={logOutOpen}
        onOpenChange={setLogOutOpen}
      />
      <Delete
        user={user}
        crud={crud}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
      <Edit
        user={user}
        crud={crud}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
