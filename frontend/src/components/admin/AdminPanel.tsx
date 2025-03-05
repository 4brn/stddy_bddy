import Users from "@/components/admin/users/Users";

export default function AdminPanel() {
  return (
    <div
      className={`grid gap-4 overflow-y-auto p-4
      grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`}
    >
      <Users />
    </div>
  );
}
