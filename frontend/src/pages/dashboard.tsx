import { useAuth } from "@/context/auth-context";
import AdminDashboard from "@/components/dashboard/admin/admin-dashboard";
import Choice from "@/components/choice";
import UserDashboard from "@/components/dashboard/user/user-dashboard";

export default function Dashboard() {
  const { user } = useAuth()!;
  if (!user) return <Choice />;

  return (
    <div className="p-6 flex flex-col gap-6 xl:grid xl:grid-cols-2 xl:justify-center">
      {user.role === "admin" ? <AdminDashboard /> : <UserDashboard />}
    </div>
  );
}
