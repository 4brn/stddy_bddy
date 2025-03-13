import { useEffect, useMemo, useState } from "react";
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
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
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

    return () => {
      clearTimeout(timerId);
    };
  }, [searchInput]);

  async function fetchUsers() {
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
  }

  const crud: Crud = {
    // TODO: implement adding users
    add: (user: UserWithSession) => {
      fetchUsers();
    },
    update: (user: UserWithSession) => {
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === user.id ? { ...u, ...user } : u)),
      );
    },
    delete: (user: UserWithSession) => {
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
  }, []);

  // Memoize filtered users based on debounced search value
  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users;

    return users.filter((user) => {
      return (
        user.id.toString().includes(debouncedSearch) ||
        user.username.includes(debouncedSearch) ||
        user.role.includes(debouncedSearch)
      );
    });
  }, [users, debouncedSearch]);

  if (loading) return <h1> Loading </h1>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex gap-2 justify-center">
            <CardTitle className="flex-1 text-lg">Users</CardTitle>
            <Input
              placeholder="Search users"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <Plus />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[50vh]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Id</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead></TableHead>
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
        <CardFooter>
          {`${filteredUsers.length} of ${users.length} users`}
        </CardFooter>
      </Card>

      <Add open={addOpen} onOpenChange={setAddOpen} crud={crud} />
    </>
  );
}
