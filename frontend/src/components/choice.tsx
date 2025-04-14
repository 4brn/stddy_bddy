import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function Choice() {
  return (
    <div className="h-full col-span-2 flex flex-col gap-6 justify-center items-center">
      <h1 className="text-4xl">The choice is yours</h1>
      <div className="grid grid-cols-2">
        <Link to={"/"}>
          <Button className="text-2xl" variant={"link"}>
            Home
          </Button>
        </Link>
        <Link to={"/auth"}>
          <Button className="text-2xl" variant={"link"}>
            Auth
          </Button>
        </Link>
      </div>
    </div>
  );
}
