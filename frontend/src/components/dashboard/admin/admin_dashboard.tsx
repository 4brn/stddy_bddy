import Users from "@/components/dashboard/admin/users/users";

export default function AdminDashboard() {
  return (
    <div className="p-6 grid lg:grid-cols-2">
      <Users />
    </div>
  );
}
