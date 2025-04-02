import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { User, UserCrud as Crud, UserWithSession } from "@shared/types";
import { Plus, RefreshCw, User as UserIcon } from "lucide-react";
import UserMenu from "./user-menu";
import { Loading } from "@/components/loading";
import UserAdd from "./crud/user-add";

export default function UsersTable() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithSession[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 30);

    return () => clearTimeout(timerId);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    const timer = setTimeout(() => setLoading(false), 250);
    try {
      const response = await fetch(
        "http://localhost:1337/api/users/with/sessions",
        { credentials: "include" },
      );

      if (!response.ok) throw new Error("Failed to fetch users");

      const json = await response.json();
      setUsers(json.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      return () => clearTimeout(timer);
    }
  }, []);

  const crud: Crud = useMemo(
    () => ({
      add: () => fetchUsers(),
      update: (newUser: User) =>
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.id === newUser.id ? { ...u, ...newUser } : u,
          ),
        ),
      delete: (user: User) =>
        setUsers((prevState) => prevState.filter((u) => u.id !== user.id)),

      logout: (user: UserWithSession) =>
        setUsers((prevState) =>
          prevState.map((u) =>
            u.id === user.id ? { ...u, active: false } : u,
          ),
        ),
    }),
    [],
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users;

    return users.filter((user) => {
      const extendedQueryString = [
        user.id,
        user.username,
        user.active ? "true" : "false",
        user.role,
      ]
        .join(" ")
        .toLowerCase();
      return extendedQueryString.includes(debouncedSearch.toLowerCase());
    });
  }, [users, debouncedSearch]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex gap-2 justify-start">
            <Label htmlFor="search" className="text-lg">
              <UserIcon strokeWidth={2} />
              Users
            </Label>
            <Input
              id="search"
              placeholder="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <Plus strokeWidth={2} />
            </Button>
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw strokeWidth={2} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[50svh]">
          {loading ? (
            <Loading />
          ) : (
            <ScrollArea className="h-full border rounded-md">
              <div className="p-3 gap-3 grid grid-cols-3 sticky top-0 z-10 bg-card items-center border-b sm:grid-cols-4 md:grid-cols-5">
                <span className="pl-3">Id</span>
                <span>Username</span>
                <span className="hidden sm:block">Role</span>
                <span className="hidden md:block">Activity</span>
                <span className="justify-self-center sm:justify-self-start">
                  Options
                </span>
              </div>
              {filteredUsers.map((user, i) => (
                <div key={i}>
                  <div className="p-3 gap-3 grid grid-cols-3 hover:bg-accent/50 items-center border-t sm:grid-cols-4 md:grid-cols-5">
                    <span className="pl-3">{user.id}</span>
                    <span className="truncate">{user.username}</span>
                    <span className="hidden md:block">{user.role}</span>
                    <span className="hidden sm:block">
                      {user.active ? "True" : "False"}
                    </span>
                    <span className="justify-self-center sm:justify-self-start">
                      <UserMenu user={user} crud={crud} />
                    </span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter className="text-muted-foreground">
          {`${filteredUsers.length} of ${users.length} results`}
        </CardFooter>
      </Card>

      <UserAdd open={addOpen} onOpenChange={setAddOpen} crud={crud} />
    </>
  );
}
