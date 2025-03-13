import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/context/auth_context";
import AdminDashboard from "@/components/dashboard/admin/admin_dashboard";

function Dashboard() {
  const { user } = useAuth()!;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/");
  }, [user]);

  return user?.role === "admin" ? <AdminDashboard /> : "User dashboard";
}

export default Dashboard;
