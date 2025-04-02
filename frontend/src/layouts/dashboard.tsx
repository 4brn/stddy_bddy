import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <div className="gap-6 grid xl:grid-cols-2 xl:justify-center">
      <Outlet />
    </div>
  );
}
