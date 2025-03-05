import { useAuth } from "@/context/AuthContext";
import { useNotyf } from "@/context/NotyfContext";
import { useNavigate } from "react-router";

export default function Logout({ className }: { className: string }) {
  const { setUser } = useAuth()!;
  const { notyf } = useNotyf()!;
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await fetch("http://localhost:1337/api/auth/logout", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      setUser(null);
      navigate("/");
      notyf.success("Logged out");
    }
  };

  return (
    <button
      className={className ? className : "btn btn-ghost text-lg"}
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}
