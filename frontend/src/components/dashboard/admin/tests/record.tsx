// stddy_bddy/frontend/src/components/dashboard/admin/tests/record.tsx
import { TableCell, TableRow } from "@/components/ui/table";
import type { Test } from "@schema";
import Menu from "./menu";
import type { Crud } from "./tests";
import { Badge } from "@/components/ui/badge";

export function TestRecord({
  test,
  crud,
}: {
  // Added the opening brace here
  test: Test;
  crud: Crud;
}) {
  // Format date for display
  const createdDate = new Date(test.createdAt).toLocaleDateString();
  const updatedDate = new Date(test.updatedAt).toLocaleDateString();

  return (
    <TableRow>
      <TableCell className="text-center">{test.id}</TableCell>
      <TableCell className="max-w-[80px] truncate overflow-hidden text-ellipsis whitespace-nowrap">
        <span title={test.title}>{test.title}</span>
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        {/* {test.isPrivate ? "True" : "False"} */}

        <Badge
          variant={test.isPrivate ? "destructive" : "secondary"}
          className="text-sm"
        >
          {test.isPrivate ? "Private" : "Public"}
        </Badge>
      </TableCell>
      <TableCell className="hidden md:table-cell">{createdDate}</TableCell>
      <TableCell className="hidden md:table-cell">{updatedDate}</TableCell>
      <TableCell>
        <Menu test={test} crud={crud} />
      </TableCell>
    </TableRow>
  );
}
