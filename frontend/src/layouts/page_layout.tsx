import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import { Outlet } from "react-router";

export default function PageLayout() {
  return (
    <div className="flex h-screen flex-col">
      <NavBar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
