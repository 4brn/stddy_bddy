import { useAuth } from "@/context/auth-context";
import UsersTable from "@/components/dashboard/users/users-table";
import TestsTable from "@/components/dashboard/tests/tests-table";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth()!;
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate("/");
  }, []);

  return user ? (
    <>
      {user.role === "admin" && <UsersTable />}
      <TestsTable user={user!} />
    </>
  ) : (
    <h1>asdfadsf</h1>
  );
}
