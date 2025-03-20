// stddy_bddy/frontend/src/components/dashboard/admin/tests/tests.tsx
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
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, RefreshCw } from "lucide-react";
import { TestRecord } from "./record";
import AddTest from "./add";
import type { Test } from "@schema";
import { useAuth } from "@/context/auth_context";

export type Crud = {
  add: (test: Test) => void;
  update: (newTest: Test) => void;
  delete: (test: Test) => void;
};

export default function Tests() {
  const { user } = useAuth()!;
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
      const response = await fetch("http://localhost:1337/api/tests", {
        credentials: "include",
      });

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
      add: (test: Test) => setTests((prev) => [...prev, test]),
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
      const updated = new Date(test.updatedAt).toLocaleDateString();
      const created = new Date(test.createdAt).toLocaleDateString();
      return (
        test.id.toString().includes(debouncedSearch) ||
        test.title.toLowerCase().includes(searchLower) ||
        updated.includes(debouncedSearch) ||
        created.includes(debouncedSearch)
      );
    });
  }, [tests, debouncedSearch]);

  if (loading) return <h1>Loading</h1>;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex gap-2 justify-start">
            <Input
              placeholder="Search tests"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline" onClick={() => setAddOpen(true)}>
              <Plus />
            </Button>
            <Button variant="outline" onClick={fetchTests}>
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
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Private
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Updated
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTests.map((test) => (
                  <TestRecord key={test.id} test={test} crud={crud} />
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
        <CardFooter className="text-gray-400 pt-0">
          {`${filteredTests.length} of ${tests.length} tests`}
        </CardFooter>
      </Card>

      <AddTest
        user={user}
        open={addOpen}
        onOpenChange={setAddOpen}
        crud={crud}
      />
    </>
  );
}
