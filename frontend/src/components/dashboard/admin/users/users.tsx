import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import type { User } from "@schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, RefreshCw } from "lucide-react";
import { UserRecord } from "./record";
import { Add } from "./add";

export type UserWithSession = User & {
  active: boolean;
};

export type Crud = {
  add: (user: User) => void;
  update: (newUser: User) => void;
  delete: (user: User) => void;
  logout: (user: UserWithSession) => void;
};

export default function Users() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithSession[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  // Handle search input with debouncing
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 50);

    return () => clearTimeout(timerId);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:1337/api/users/sessions", {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch users");

      const json = await response.json();
      setUsers(json.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  const crud: Crud = {
    add: () => {
      fetchUsers();
    },
    update: (newUser: User) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === newUser.id ? { ...u, ...newUser } : u)),
      );
    },
    delete: (user: User) => {
      setUsers((prevState) => prevState.filter((u) => u.id !== user.id));
    },
    logout: (user: UserWithSession) => {
      setUsers((prevState) =>
        prevState.map((u) => (u.id === user.id ? { ...u, active: false } : u)),
      );
    },
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Memoize filtered users based on debounced search value
  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users;

    return users.filter(
      (user) =>
        user.id.toString().includes(debouncedSearch) ||
        user.username.includes(debouncedSearch) ||
        user.role.includes(debouncedSearch),
    );
  }, [users, debouncedSearch]);

  if (loading) return <h1>Loading</h1>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex gap-2 justify-start">
            <Input
              placeholder="Search users"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <Plus />
            </Button>
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[30vh] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Id</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden sm:table-cell">Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <UserRecord key={user.id} user={user} crud={crud} />
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="text-gray-400 pt-0">
          {`${filteredUsers.length} of ${users.length} users`}
        </CardFooter>
      </Card>

      <Add open={addOpen} onOpenChange={setAddOpen} crud={crud} />
    </>
  );
}
