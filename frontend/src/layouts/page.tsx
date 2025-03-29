import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Outlet } from "react-router";

export default function PageLayout() {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
