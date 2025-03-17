import { TableCell, TableRow } from "@/components/ui/table";
import type { UserWithSession } from "./users";
import Menu from "./menu";
import type { Crud } from "./users";
import { Badge } from "@/components/ui/badge";

export function UserRecord({
  user,
  crud,
}: {
  user: UserWithSession;
  crud: Crud;
}) {
  return (
    <TableRow>
      <TableCell>{user.id}</TableCell>
      <TableCell>{user.username}</TableCell>
      <TableCell>{user.role}</TableCell>
      <TableCell>{user.active ? "True" : "False"}</TableCell>
      <TableCell>
        <Menu user={user} crud={crud} />
      </TableCell>
    </TableRow>
  );
}
