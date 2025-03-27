import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/theme-context";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant="secondary"
    >
      {theme === "dark" ? (
        <Moon className="rotate-90 transition-all dark:rotate-0" />
      ) : (
        <Sun className="rotate-0 transition-all dark:-rotate-90" />
      )}
    </Button>
  );
}
