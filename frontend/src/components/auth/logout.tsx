import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

export default function Logout() {
  const { setUser } = useAuth()!;
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await fetch("http://localhost:1337/api/auth/logout", {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      navigate("/");
      setUser(null);
    }
  };

  return (
    <Button variant={"destructive"} onClick={handleLogout}>
      <LogOut strokeWidth={3} />
      Exit
    </Button>
  );
}
