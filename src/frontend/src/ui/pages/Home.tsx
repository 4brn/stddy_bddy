import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { Link } from "react-router";

export default function Home() {
  const { user } = useAuth()!;
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user]);

  return (
    <div className="hero bg-base-100 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">
            Hello {user ? user?.username : "there"}
          </h1>
          <p className="py-6">StddyBddy {">"} Kahoot</p>
          <Link className="btn btn-primary" to="/register">
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
