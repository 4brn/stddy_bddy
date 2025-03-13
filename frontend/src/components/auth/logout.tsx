import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth_context";
import { LogOut as Icon } from "lucide-react";
import { useNavigate } from "react-router";

export default function LogOut() {
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
    <Button onClick={handleLogout}>
      <Icon />
    </Button>
  );
}
