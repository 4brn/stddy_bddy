import ThemeToggle from "@/components/theme-toggle";
import { useAuth } from "@/context/auth-context";
import Logout from "@/components/auth/logout";
import { Button } from "@/components/ui/button";
import { Link, NavLink } from "react-router";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { House, File, Menu } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth()!;

  return (
    <nav className="flex justify-center items-center sticky top-0 z-50 p-2 bg-background @xs:justify-evenly sm:justify-between">
      <Link to={"/"}>
        <Button variant={"link"} className="text-2xl font-bold tracking-tight">
          StddyBddy{user && `@${user.username}`}
        </Button>
      </Link>

      {user ? (
        <NavigationMenu orientation="vertical" className="sm:hidden">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Menu strokeWidth={3} />
              </NavigationMenuTrigger>
              <NavigationMenuContent className="flex flex-col gap-1">
                <Link to="/dashboard">
                  <Button variant={"secondary"} className="hover:bg-accent">
                    <House strokeWidth={3} />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/tests">
                  <Button
                    variant={"secondary"}
                    className="w-full hover:bg-accent"
                  >
                    <File strokeWidth={3} />
                    Tests
                  </Button>
                </Link>
                <div className="flex w-full gap-1">
                  <ThemeToggle />
                  <Logout />
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      ) : (
        <div className="sm:hidden">
          <ThemeToggle />
        </div>
      )}

      {user && (
        <NavigationMenu className="hidden sm:block">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/dashboard">
                <Button variant={"ghost"} className="text-lg hover:bg-accent">
                  <House strokeWidth={3} />
                  Dashboard
                </Button>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavLink to="/tests">
                <Button variant={"ghost"} className="text-lg hover:bg-accent">
                  <File strokeWidth={3} />
                  Tests
                </Button>
              </NavLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )}

      <div className="hidden sm:flex gap-2 ">
        <ThemeToggle />
        {user && <Logout />}
      </div>
    </nav>
  );
}
