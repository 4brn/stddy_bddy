import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router";
import type { Category, TestInfo } from "@shared/types";
import { ArrowDownAZ, ArrowDownZA } from "lucide-react";

export default function Tests() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [reversedCategories, setReversedCategories] = useState(false);
  const [reversedTests, setReversedTests] = useState(false);
  const [tests, setTests] = useState<Record<number, TestInfo[]>>({});

  function sortCategories(reversed: boolean) {
    const cats = [...categories].sort((a, b) => a.name.localeCompare(b.name));
    return reversed ? cats.toReversed() : cats;
  }

  function sortTests(categoryId: number, reversed: boolean) {
    const testList = tests[categoryId];
    if (!testList) return [];

    const sortedTests = [...testList].sort((a, b) =>
      a.title.localeCompare(b.title),
    );
    return reversed ? sortedTests.toReversed() : sortedTests;
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/categories", {
          credentials: "include",
        });

        if (response.ok) {
          const json = await response.json();
          setCategories(json.data);
        }
      } catch (error) {
        toast.error("Error fetching categories");
      }
    };
    const fetchTests = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/info/tests", {
          credentials: "include",
        });

        if (!response.ok) {
          toast.error("Error while fetching tests");
          return;
        }

        const data: TestInfo[] = await response.json();
        const categorizedTests: Record<number, TestInfo[]> = {};

        for (const test of data) {
          const categoryId = test.category.id;
          if (!categorizedTests[categoryId]) {
            categorizedTests[categoryId] = [];
          }
          categorizedTests[categoryId].push(test);
        }

        setTests(categorizedTests);
      } catch (error) {
        toast.error("Error fetching tests");
      }
    };

    fetchCategories();
    fetchTests();
  }, []);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-[80vw] h-[40vh]">
        <Command
          loop
          className="bg-background"
          filter={(value, search, keywords) => {
            const extendValue = value + " " + keywords?.join(" ");
            return extendValue.toLowerCase().includes(search.toLowerCase())
              ? 1
              : 0;
          }}
        >
          <CommandInput
            className="flex-1"
            placeholder="Type a test or a subject..."
          />
          <div className="grid sm:grid-cols-2 gap-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setReversedCategories(!reversedCategories)}
            >
              {reversedCategories ? <ArrowDownZA /> : <ArrowDownAZ />}
              Category ({reversedCategories ? "reversed" : "alphabetical"})
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setReversedTests(!reversedTests)}
            >
              {reversedTests ? <ArrowDownZA /> : <ArrowDownAZ />}
              Tests ({reversedTests ? "reversed" : "alphabetical"})
            </Button>
          </div>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {sortCategories(reversedCategories).map((category, i) => (
              <CommandGroup
                key={category.id}
                className={!tests[category.id] ? "hidden" : ""}
                heading={category.name}
              >
                {sortTests(category.id, reversedTests).map((test) => (
                  <Link key={test.id} to={`/test/${test.id}`}>
                    <CommandItem
                      value={test.title}
                      keywords={[
                        test.category.name,
                        test.id.toString(),
                        test.author.username,
                        test.is_private ? "private" : "public",
                      ]}
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
  );
}
