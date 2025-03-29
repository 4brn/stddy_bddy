import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Link } from "react-router";

export default function Home() {
  const { user } = useAuth()!;
  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="flex flex-col items-center justify-center gap-5">
        <h1 className="font-bold text-center leading-tight text-5xl">
          Welcome {user ? user.username : "to StddyBddy"}
        </h1>
        <p className="text-xl text-center text-accent-foreground">
          Become an academic weapon
        </p>
        <Link to={user ? "/tests" : "/auth"}>
          <Button size={"lg"} className="text-xl p-6">
            Learn
          </Button>
        </Link>
      </div>
    </div>
  );
}
