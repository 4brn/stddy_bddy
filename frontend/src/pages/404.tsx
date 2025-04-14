import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="h-svh flex flex-col justify-center items-center gap-8">
      <h1 className="text-4xl">NOT FOUND :(</h1>
      <Button
        variant={"link"}
        size={"lg"}
        className="text-2xl"
        onClick={() => navigate(-1)}
      >
        Go back
      </Button>
    </div>
  );
}
