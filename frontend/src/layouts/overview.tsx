import { Outlet } from "react-router";

export default function OverviewLayout() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Outlet />
    </div>
  );
}
