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
  TestSelect as Test,
  TestCrud as Crud,
  UserSelect as User,
} from "@shared/types";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/loading";
import TestMenu from "./tests-menu";
import TestAdd from "./crud/test-add";

export default function TestsTable({ user }: { user: User }) {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<Test[]>([]);
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

  const fetchTests = useCallback(async () => {
    try {
      console.log(user.role);
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
      setLoading(false);
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

    const searchLower = debouncedSearch.toLowerCase();
    return tests.filter((test) => {
      const visibilityMatch =
        (test.is_private && "private".includes(searchLower)) ||
        (!test.is_private && "public".includes(searchLower));

      return (
        test.id.toString().includes(debouncedSearch) ||
        test.title.toLowerCase().includes(searchLower) ||
        visibilityMatch
      );
    });
  }, [tests, debouncedSearch]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex gap-2 justify-start">
            <Label htmlFor="search" className="text-lg">
              <File strokeWidth={2} />
              Tests
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
        <CardContent>
          {loading ? (
            <Loading />
          ) : (
            <ScrollArea className="h-[50vh] border rounded-md">
              <div className="p-3 gap-3 grid grid-cols-3 sticky top-0 z-10 bg-card items-center border-b sm:grid-cols-4 md:grid-cols-6">
                <span className="pl-3">Id</span>
                <span>Title</span>
                <span className="hidden sm:block">Visibility</span>
                <span className="hidden md:block">Created</span>
                <span className="hidden md:block">Updated</span>
                <span>Options</span>
              </div>
              {filteredTests.map((test) => (
                <div key={test.id}>
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
                    <span className="justify-self-center sm:justify-self-start">
                      <TestMenu crud={crud} test={test} />
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

      <TestAdd open={addOpen} onOpenChange={setAddOpen} crud={crud} />
    </>
  );
}
