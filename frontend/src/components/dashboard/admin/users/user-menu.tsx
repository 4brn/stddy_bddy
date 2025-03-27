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
import type { UserWithSession, UserCrud } from "@shared/types";
import { Copy, LogOut, Settings2, Trash, UserPen } from "lucide-react";
import { toast } from "sonner";
// import { Edit } from "./edit";
import { useState } from "react";
import { UserLogout } from "./crud/user-logout";
import { UserDelete } from "./crud/user-delete";
import { Edit } from "./crud/user-edit";

export default function UserMenu({
  user,
  crud,
}: {
  user: UserWithSession;
  crud: UserCrud;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [logOutOpen, setLogOutOpen] = useState(false);

  const handleCopy = () => {
    const info = `id: ${user.id}, username: ${user.username}, password: ${user.password}, role: ${user.role}`;
    navigator.clipboard.writeText(info);
    toast.success("User info copied to clipboard");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={"sm"} variant="secondary">
            <Settings2 />
            Open
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-44">
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={handleCopy}>
              <Copy />
              Copy
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <UserPen />
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuItem
            disabled={!user.active}
            onClick={() => setLogOutOpen(true)}
          >
            <LogOut />
            Log out
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserLogout
        user={user}
        crud={crud}
        open={logOutOpen}
        onOpenChange={setLogOutOpen}
      />
      <UserDelete
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
