import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";

export default function LogoutButton({ className }: { className: string }) {
  const { setUser } = useAuth()!;
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await fetch("http://localhost:3000/api/auth/logout", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (response.ok) {
      setUser(null);
      navigate("/");
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
