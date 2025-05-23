import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Outlet } from "react-router";

export default function PageLayout() {
  return (
    <div className="flex h-screen w-screen flex-col">
      <Navbar />
      <div className="flex-1 px-8 pt-8">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
