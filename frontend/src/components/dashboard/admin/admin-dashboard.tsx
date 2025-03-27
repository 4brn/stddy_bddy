import UsersTable from "@/components/dashboard/admin/users/users-table";
import TestsTable from "@/components/dashboard/admin/tests/tests-table";

export default function AdminDashboard() {
  return (
    <>
      <UsersTable />
      <TestsTable />
    </>
  );
}
