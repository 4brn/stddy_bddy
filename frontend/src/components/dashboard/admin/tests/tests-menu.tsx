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
import type { TestSelect as Test, TestCrud as Crud } from "@shared/types";
import { BookOpen, Copy, FilePen, Settings2, Trash } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import TestView from "./crud/test-view";
import TestEdit from "./crud/test-edit";
import TestDelete from "./crud/test-delete";
// import View from "./view";

export default function TestMenu({ test, crud }: { test: Test; crud: Crud }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const handleCopy = () => {
    const info = `id: ${test.id}, title: ${test.title}, private: ${test.is_private}`;
    navigator.clipboard.writeText(info);
    toast.success("Test info copied to clipboard");
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
            <DropdownMenuItem onClick={() => setViewOpen(true)}>
              <BookOpen />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <FilePen />
              Edit
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TestView test={test} open={viewOpen} onOpenChange={setViewOpen} />
      <TestEdit
        test={test}
        crud={crud}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
      <TestDelete
        test={test}
        crud={crud}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
}
