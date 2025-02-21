import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <>
      <div className="hero bg-base-100 min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}
