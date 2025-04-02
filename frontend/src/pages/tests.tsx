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
import { toast } from "sonner";
import { LoadingScreen } from "@/components/loading";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/context/auth-context";
import Choice from "@/components/choice";
import type { Category, TestInfo } from "@shared/types";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const sorting = {
  ascending: (x: any, y: any) => (x < y ? 0 : 1),
  descending: (x: any, y: any) => (x > y ? 0 : 1),
};

export default function Tests() {
  const { user } = useAuth()!;
  const [categories, setCategories] = useState<Category[]>([]);
  const [sort, setSort] = useState<keyof typeof sorting>("ascending");
  const [tests, setTests] = useState<{ [index: number]: TestInfo[] }>({});
  // const [users, setUser] = useState<User[]>([]);

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
      const response = await fetch("http://localhost:1337/api/info/tests", {
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Error while fetching tests");
        return;
      }

      const data: TestInfo[] = await response.json();
      const categorizedTests: { [category: number]: TestInfo[] } = {};

      for (let test of data) {
        if (!Object.hasOwn(categorizedTests, test.category.id))
          categorizedTests[test.category.id] = [test];
        else categorizedTests[test.category.id].push(test);
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
            <CommandInput placeholder="Type a test or a subject..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {categories.sort(sorting[sort]).map((category, i) => (
                <CommandGroup
                  key={i}
                  className={!tests[category.id] ? "hidden" : ""}
                  heading={category.name}
                >
                  {tests[category.id]?.map((test, i) => (
                    <Link key={i} to={`/test/${test.id}`}>
                      <CommandItem
                        value={test.title}
                        keywords={[
                          test.category.name,
                          test.id.toString(),
                          test.author.username,
                          test.is_private ? "private" : "public",
                        ]}
                        className="p-3"
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
