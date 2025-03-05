import { Outlet } from "react-router";

import NavBar from "../components/NavBar";
import Footer from "../components/Footer";

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
