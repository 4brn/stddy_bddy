import { useEffect, useMemo, useState, useCallback } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { File, Plus, RefreshCw } from "lucide-react";
import type {
  Test,
  TestCrud as Crud,
  User,
  Category,
  UserContext,
} from "@shared/types";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/loading";
import TestMenu from "./tests-menu";
import TestAdd from "./crud/test-add";

export default function TestsTable({ user }: { user: UserContext }) {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<Test[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch("http://localhost:1337/api/users", {
        credentials: "include",
      });

      if (!response.ok) return;
      const json = await response.json();
      setUsers(json.data);
    };

    const fetchCategories = async () => {
      const response = await fetch("http://localhost:1337/api/categories", {
        credentials: "include",
      });

      if (!response.ok) return;
      const json = await response.json();
      setCategories(json.data);
    };

    fetchUsers();
    fetchCategories();
  }, []);

  // Handle search input with debouncing
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 50);
    return () => clearTimeout(timerId);
  }, [searchInput]);

  const fetchTests = useCallback(async () => {
    const timer = setTimeout(() => setLoading(false), 300);
    try {
      const response = await fetch(
        `http://localhost:1337/api/${user.role === "admin" ? "tests" : "my/tests"}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Failed to fetch tests");

      const { data } = await response.json();
      setTests(data);
    } catch (error) {
      toast.error("Failed to load tests");
    } finally {
      return () => clearTimeout(timer);
    }
  }, []);

  const crud: Crud = useMemo(
    () => ({
      add: async () => await fetchTests(),
      update: (newTest: Test) =>
        setTests((prev) =>
          prev.map((t) => (t.id === newTest.id ? { ...t, ...newTest } : t)),
        ),
      delete: (test: Test) =>
        setTests((prev) => prev.filter((t) => t.id !== test.id)),
    }),
    [],
  );

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // Filter tests based on search input
  const filteredTests = useMemo(() => {
    if (!debouncedSearch) return tests;

    return tests.filter((test) => {
      const extendedSearchQuery = [
        test.id,
        test.title,
        test.is_private ? "private" : "public",
      ]
        .join(" ")
        .toLowerCase();

      return extendedSearchQuery.includes(debouncedSearch.toLowerCase());
    });
  }, [tests, debouncedSearch]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex gap-2 justify-start">
            <Label htmlFor="search" className="text-lg">
              <File strokeWidth={2} />
              {user.role === "user" && "My"} Tests
            </Label>
            <Input
              placeholder="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <Plus strokeWidth={2} />
            </Button>
            <Button variant="outline" onClick={fetchTests}>
              <RefreshCw strokeWidth={2} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="h-[50svh]">
          {loading ? (
            <Loading />
          ) : (
            <ScrollArea className="h-full border rounded-md">
              <div className="p-3 gap-3 grid grid-cols-3 sticky top-0 z-10 bg-card items-center border-b sm:grid-cols-4 md:grid-cols-6">
                <span className="pl-3">Id</span>
                <span>Title</span>
                <span className="hidden sm:block">Visibility</span>
                <span className="hidden md:block">Created</span>
                <span className="hidden md:block">Updated</span>
                <span>Options</span>
              </div>
              {filteredTests.map((test, i) => (
                <div key={i}>
                  <div className="p-3 gap-3 grid grid-cols-3 hover:bg-accent/50 items-center border-t sm:grid-cols-4 md:grid-cols-6">
                    <span className="pl-3">{test.id}</span>
                    <span className="truncate">{test.title}</span>
                    <span className="hidden sm:block">
                      {test.is_private ? "Private" : "Public"}
                    </span>

                    <span className="hidden md:block">
                      {new Date(test.created_at).toLocaleDateString()}
                    </span>
                    <span className="hidden md:block">
                      {new Date(test.updated_at).toLocaleDateString()}
                    </span>
                    <span>
                      <TestMenu
                        crud={crud}
                        test={test}
                        users={users}
                        categories={categories}
                      />
                    </span>
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter className="text-muted-foreground">
          {`${filteredTests.length} of ${tests.length} results`}
        </CardFooter>
      </Card>

      <TestAdd
        open={addOpen}
        onOpenChange={setAddOpen}
        crud={crud}
        users={users}
        categories={categories}
      />
    </>
  );
}
