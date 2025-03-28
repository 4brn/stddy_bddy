import { Outlet } from "react-router";

export default function DashboardLayout() {
  return (
    <div className="p-6 flex flex-col gap-6 xl:grid xl:grid-cols-2 xl:justify-center">
      <Outlet />
    </div>
  );
}
