import { useAuth } from "@/context/auth_context";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";

function Home() {
  const { user } = useAuth()!;
  const navigate = useNavigate();

  // Handle keyboard events for Enter key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        navigate("/auth");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm text-center">
        <Link to={"/auth"}>
          <h1 className="font-bold text-5xl w-full">StddyBddy</h1>
        </Link>
        <p className="text-lg mt-3">StddyBddy {">"} Kahoot</p>
      </div>
    </div>
  );
}

export default Home;
