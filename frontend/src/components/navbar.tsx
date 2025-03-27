import ThemeToggle from "@/components/theme-toggle";
import { useAuth } from "@/context/auth-context";
import Logout from "@/components/auth/logout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { House, File } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth()!;
  return (
    <nav className="flex justify-between items-center sticky top-0 z-50 p-2 bg-background">
      <Link to={"/"}>
        <Button
          variant={"link"}
          className="scroll-m-20 text-2xl font-bold tracking-tight"
        >
          StddyBddy{user && `@${user.username}`}
        </Button>
      </Link>

      {user && (
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/dashboard">
                <Button variant={"ghost"} className="text-lg hover:bg-accent">
                  <House strokeWidth={2} />
                  Dashboard
                </Button>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/tests">
                <Button variant={"ghost"} className="text-lg hover:bg-accent">
                  <File strokeWidth={2} />
                  Tests
                </Button>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}

      <div className="flex gap-2">
        <ThemeToggle />
        {user && <Logout />}
      </div>
    </nav>
  );
}
