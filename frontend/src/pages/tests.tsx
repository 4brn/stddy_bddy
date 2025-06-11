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
import { useNavigate } from "react-router";
import type { Category, TestInfo } from "@shared/types";
import { ArrowDownAZ, ArrowDownZA } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function Tests() {
  const { user } = useAuth()!;
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [tests, setTests] = useState<Record<number, TestInfo[]>>({});
  const [reversedCategories, setReversedCategories] = useState(false);
  const [reversedTests, setReversedTests] = useState(false);

  const sortCategories = (reversed: boolean) => {
    const cats = [...categories].sort((a, b) => a.name.localeCompare(b.name));
    return reversed ? cats.toReversed() : cats;
  };

  const sortTests = (categoryId: number, reversed: boolean) => {
    const testList = tests[categoryId];
    if (!testList) return [];

    const sortedTests = [...testList].sort((a, b) =>
      a.title.localeCompare(b.title),
    );
    return reversed ? sortedTests.toReversed() : sortedTests;
  };

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/categories", {
          credentials: "include",
        });

        if (response.ok) {
          const json = await response.json();
          setCategories(json.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchTests = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/info/tests", {
          credentials: "include",
        });

        if (response.status === 307) {
          navigate("/");
          return;
        }

        if (response.ok) {
          const data: TestInfo[] = await response.json();
          const categorizedTests: Record<number, TestInfo[]> = {};

          for (const test of data) {
            const categoryId = test?.category?.id!;
            if (!categorizedTests[categoryId]) {
              categorizedTests[categoryId] = [];
            }
            categorizedTests[categoryId].push(test);
          }

          setTests(categorizedTests);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategories();
    fetchTests();
  }, [user, navigate]);

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div className="w-[80vw] h-[30vh] sm:w-[50vw]">
        <Command
          loop
          className="bg-background flex flex-col gap-3"
          filter={(value, search, keywords) => {
            const extendValue = value + " " + keywords?.join(" ");
            return extendValue.toLowerCase().includes(search.toLowerCase())
              ? 1
              : 0;
          }}
        >
          <CommandInput
            className="sm:text-lg"
            placeholder="Type a test, subject or user"
          />

          <div className="grid md:grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setReversedCategories(!reversedCategories)}
            >
              {reversedCategories ? <ArrowDownZA /> : <ArrowDownAZ />}
              Category
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setReversedTests(!reversedTests)}
            >
              {reversedTests ? <ArrowDownZA /> : <ArrowDownAZ />}
              Tests
            </Button>
          </div>

          <CommandList>
            <CommandEmpty>No tests found.</CommandEmpty>
            {sortCategories(reversedCategories).map((category, i) => (
              <CommandGroup
                key={i}
                className={`mb-2 border-b ${!tests[category.id] ? "hidden" : ""}`}
                heading={category.name}
              >
                {sortTests(category.id, reversedTests).map((test, j) => (
                  <CommandItem
                    key={j}
                    value={test.title}
                    onSelect={() => navigate(`/test/${test.id}`)}
                    onClick={() => navigate(`/test/${test.id}`)}
                    keywords={[
                      test.category!.name,
                      test.id.toString(),
                      test.author!.username,
                      test.is_private ? "private" : "public",
                    ]}
                  >
                    {test.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </div>
    </div>
  );
}
