import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  // CommandShortcut,
} from "@/components/ui/command";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CategorySelect as Category,
  TestSelect as Test,
  UserSelect as User,
} from "@shared/types";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/loading";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/auth-context";
import Choice from "@/components/choice";

export default function Tests() {
  const { user } = useAuth()!;
  const [categories, setCategories] = useState<Category[]>([]);
  const [tests, setTests] = useState<{ [index: number]: Test[] }>({});
  const [users, setUser] = useState<User[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await fetch("http://localhost:1337/api/categories", {
        credentials: "include",
      });

      if (response.ok) {
        const json = await response.json();
        setCategories(json.data);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      const response = await fetch("http://localhost:1337/api/tests", {
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Error while fetching tests");
        return;
      }

      const { data }: { data: Test[] } = await response.json();
      const categorizedTests: { [category: number]: Test[] } = {};

      for (let test of data) {
        if (!Object.hasOwn(categorizedTests, test.category_id))
          categorizedTests[test.category_id] = [test];
        else categorizedTests[test.category_id].push(test);
      }

      setTests(categorizedTests);
    };

    fetchTests();
  }, []);

  return (
    <div className="w-full flex justify-center">
      <div className="h-[50svh] grid gap-2 grid-cols-3 sm:w-[60vw]">
        <Card className="bg-background rounded-md">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter tests</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
        <div className="col-span-2">
          <Command
            loop
            className="bg-background border"
            filter={(value, search, keywords) => {
              const extendValue = value + " " + keywords?.join(" ");
              if (extendValue.toLowerCase().includes(search.toLowerCase()))
                return 1;
              return 0;
            }}
          >
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {categories
                .sort((c1, c2) => (c1.category < c2.category ? 0 : 1))
                .map((category, i) => (
                  <CommandGroup
                    key={i}
                    className={!tests[category.id] ? "hidden" : ""}
                    heading={category.category}
                  >
                    {tests[category.id]?.map((test, i) => (
                      <Link key={i} to={`/test/${test.id}`}>
                        <CommandItem
                          value={test.title}
                          keywords={[category.category, test.id.toString()]}
                        >
                          {test.title}
                        </CommandItem>
                      </Link>
                    ))}
                  </CommandGroup>
                ))}
            </CommandList>
          </Command>
        </div>
      </div>
    </div>
  );
}
