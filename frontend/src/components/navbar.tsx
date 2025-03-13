import { ThemeToggle } from "@/components/theme";
import { useAuth } from "@/context/auth_context";
import { Link } from "react-router";
import LogOut from "@/components/auth/logout";
import { Button } from "./ui/button";
import { LogIn as Icon } from "lucide-react";

const LogIn = () => {
  return (
    <Link to={"/auth"}>
      <Button>
        <Icon />
      </Button>
    </Link>
  );
};

export default function NavBar() {
  const { user } = useAuth()!;
  return (
    <div className="flex p-2 gap-1 sticky top-0 z-50 ">
      <div className="flex-1">
        <Link to={user ? "/dashboard" : "/"} className="font-bold text-2xl">
          StddyBddy
        </Link>
      </div>
      <ThemeToggle />
      {user ? <LogOut /> : <LogIn />}
    </div>
  );
}
