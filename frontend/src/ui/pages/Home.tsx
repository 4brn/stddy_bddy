import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";

export default function Home() {
  const { user } = useAuth()!;

  return (
    <div className="hero bg-base-100 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">
            Hello {user ? user?.username : "there"}
          </h1>
          <p className="py-6">StddyBddy {">"} Kahoot</p>
          <Link to="/register">
            <button className="btn btn-primary">Get Started</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
