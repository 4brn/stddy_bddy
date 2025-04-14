import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <div className="gap-6 flex flex-col">
      <Outlet />
    </div>
  );
}
