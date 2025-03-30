import { useAuth } from "@/context/auth-context";
import Choice from "@/components/choice";
import UsersTable from "@/components/dashboard/users/users-table";
import TestsTable from "@/components/dashboard/tests/tests-table";

export default function Dashboard() {
  const { user } = useAuth()!;

  if (!user) return <Choice />;
  return (
    <>
      {user.role === "admin" && <UsersTable />}
      <TestsTable user={user} />
    </>
  );
}
