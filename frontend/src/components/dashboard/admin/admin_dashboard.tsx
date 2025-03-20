import Users from "@/components/dashboard/admin/users/users";
import Tests from "@/components/dashboard/admin/tests/tests";

export default function AdminDashboard() {
  return (
    <div className="p-6 flex flex-col gap-4">
      <Users />
      <Tests />
    </div>
  );
}
