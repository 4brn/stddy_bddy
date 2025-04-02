import { Children, ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import type { Category, Question, TestInfo } from "@shared/types";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/loading";
import {
  User,
  File,
  FileQuestion,
  CalendarPlus,
  CalendarSync,
  Eye,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Info = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-2 gap-4 sm:text-lg">{children}</div>
);

const Left = ({ children }: { children: ReactNode }) => (
  <div className="flex gap-2">{children}</div>
);

export default function Test() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [test, setTest] = useState<TestInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await fetch(
          `http://localhost:1337/api/info/test/${id}`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Could not fetch test");
          navigate("/404");
          return;
        }

        const json = await response.json();
        setTest(json.data);
      } catch (error) {
        toast.error("Something happened");
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, []);

  const created = new Date(test?.created_at ?? "").toLocaleDateString();
  const updated = new Date(test?.updated_at ?? "").toLocaleDateString();

  return loading ? (
    <LoadingScreen />
  ) : (
    <div className="flex flex-col items-start justify-center gap-10">
      <div className="text-2xl self-start flex w-full font-bold gap-5 sm:3xl">
        <h1 className="truncate">{test?.title}</h1>
      </div>
      <ul className="flex flex-col gap-3">
        <Info>
          <Left>
            <User />
            Author
          </Left>
          <span>{test?.author.username}</span>
        </Info>
        <Info>
          <Left>
            <Eye />
            Visiblity
          </Left>

          <span className={`${test?.is_private ? "text-rose-500" : ""}`}>
            {test?.is_private ? "private" : "public"}
          </span>
        </Info>
        <Info>
          <Left>
            <CalendarPlus />
            Created
          </Left>
          <span>{created}</span>
        </Info>
        <Info>
          <Left>
            <CalendarSync />
            Last Updated
          </Left>
          <span>{updated}</span>
        </Info>
      </ul>
      <Button size={"lg"} className="text-lg w-full py-5">
        Begin
      </Button>
    </div>
  );
}
