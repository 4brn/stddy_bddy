// stddy_bddy/frontend/src/components/dashboard/admin/tests/menu.tsx
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
import type { Crud } from "./tests";
import { Ellipsis, ThumbsUp } from "lucide-react";
import { toast } from "sonner";
import Edit from "./edit";
import { useState } from "react";
import { Delete } from "./delete";
import View from "./view";
import type { Test } from "@schema";

export default function TestMenu({ test, crud }: { test: Test; crud: Crud }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const handleCopy = () => {
    const info = `id: ${test.id}, title: ${test.title}, private: ${test.isPrivate}`;
    navigator.clipboard.writeText(info);
    toast.info("Test info copied to clipboard");
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
            <DropdownMenuItem onClick={() => setViewOpen(true)}>
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>Copy</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <View test={test} open={viewOpen} onOpenChange={setViewOpen} />
      <Edit
        test={test}
        crud={crud}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <Delete
        test={test}
        crud={crud}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
