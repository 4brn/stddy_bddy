import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Link } from "react-router";

export default function NotFound() {
  const { user } = useAuth()!;
  return (
    <>
      <div className="min-h-svh flex flex-col justify-center items-center gap-8">
        <h1 className="text-4xl">404 NOT FOUND :(</h1>
        <Link to={user ? "/dashboard" : "/"}>
          <Button variant={"link"} size={"lg"} className="text-2xl">
            Get Out
          </Button>
        </Link>
      </div>
    </>
  );
}
