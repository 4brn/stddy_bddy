import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";

import AdminPanel from "@/components/admin/AdminPanel";

export default function Dashboard() {
  const { user } = useAuth()!;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/");
  }, [user]);

  return (
    <>
      <h1>{user?.username}'s Dashboard</h1>
      {user?.role === "admin" ? <AdminPanel /> : "GET THE FUCK OUT"}
    </>
  );
}
