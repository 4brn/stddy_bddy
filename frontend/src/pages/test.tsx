import { LoadingScreen } from "@/components/loading";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/auth-context";
import type { Result, TestInfo } from "@shared/types";
import {
  CalendarSync,
  Eye,
  File,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

const Info = ({ children }: { children: ReactNode }) => (
  <div className="grid grid-cols-2 gap-4 sm:text-lg">{children}</div>
);

const Left = ({ children }: { children: ReactNode }) => (
  <div className="flex gap-2">{children}</div>
);

export default function Test() {
  const { user } = useAuth()!;
  const navigate = useNavigate();
  const { id } = useParams();

  const [test, setTest] = useState<TestInfo | null>(null);
  const [liked, setLiked] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const updated = new Date(test?.updated_at ?? "").toLocaleDateString();

  async function handleLike() {
    try {
      const endpoint = liked ? "dislike" : "like";
      const response = await fetch(
        `http://localhost:1337/api/tests/${id}/${endpoint}`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      if (response.status === 307) {
        navigate("/");
        return;
      }

      if (!response.ok) throw new Error("Could not handle like");
      setLiked(!liked);
    } catch (error) {
      toast.error("Failed to update like status");
    }
  }

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    const fetchTest = async () => {
      try {
        const response = await fetch(
          `http://localhost:1337/api/info/tests/${id}`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          navigate("/404");
          throw new Error("Could not fetch test");
        }

        const testData = (await response.json()).data;
        setTest(testData);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load test");
      }
    };

    const fetchLike = async () => {
      try {
        const response = await fetch(
          `http://localhost:1337/api/tests/${id}/liked`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) throw new Error("Could not fetch like status");
        const liked: boolean = await response.json();
        setLiked(liked);
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    };

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `http://localhost:1337/api/my/results/${id}`,
          {
            credentials: "include",
          },
        );

        if (!response.ok) throw new Error("Could not fetch results");
        const resultsData = await response.json();
        setResults(resultsData);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };

    fetchTest();
    fetchLike();
    fetchResults();
  }, [id, user, navigate]);

  return loading ? (
    <LoadingScreen />
  ) : (
    <div className="h-full flex flex-col items-start justify-center gap-16">
      <div className="flex flex-col gap-6">
        <div className="text-2xl self-start font-bold gap-3 sm:3xl">
          <h1 className="truncate">{test?.title}</h1>
        </div>
        <ul className="flex flex-col justify-center gap-3">
          <Info>
            <Left>
              <User />
              Author
            </Left>
            <span>{test?.author?.username}</span>
          </Info>
          <Info>
            <Left>
              <Eye />
              Visibility
            </Left>
            <span className={`${test?.is_private ? "text-rose-500" : ""}`}>
              {test?.is_private ? "private" : "public"}
            </span>
          </Info>
          <Info>
            <Left>
              <File />
              Category
            </Left>
            <span>{test?.category?.name}</span>
          </Info>
          <Info>
            <Left>
              <CalendarSync />
              Last Updated
            </Left>
            <span>{updated}</span>
          </Info>
        </ul>

        <div className="flex w-full gap-1">
          <Button
            size="lg"
            className="text-lg flex-1 py-5"
            onClick={() => navigate("solve")}
          >
            Begin
          </Button>
          <Button
            size="lg"
            variant={liked ? "destructive" : "secondary"}
            className="text-lg py-5 border"
            onClick={handleLike}
          >
            {liked ? <ThumbsDown /> : <ThumbsUp />}
          </Button>
        </div>
      </div>

      {results.length > 0 && (
        <section className="flex flex-col gap-5">
          <span className="text-xl font-semibold">Your results</span>
          <ScrollArea className="h-[20svh] space-y-1">
            {results.map((result, index) => {
              const time = new Date(result.solved_at)
                .toLocaleString()
                .split(",");
              return (
                <li
                  key={index}
                  className="w-full p-3 border rounded-md grid gap-1 grid-cols-3"
                >
                  <span>{result.percentage.toFixed(0)}%</span>
                  <span>{time[0]}</span>
                  <span>{time[1]}</span>
                </li>
              );
            })}
          </ScrollArea>
        </section>
      )}
    </div>
  );
}
