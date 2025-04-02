import "@/index.css";
import { useEffect } from "react";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "./components/ui/sonner";

import PageLayout from "@/layouts/page";
import DashboardLayout from "./layouts/dashboard";
import OverviewLayout from "./layouts/overview";

import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/404";
import Tests from "@/pages/tests";
import Test from "@/pages/test";
import Solve from "./pages/solve";

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="theme">
      <AuthProvider>
        <Routing />
        <Toaster richColors={true} expand={false} />
      </AuthProvider>
    </ThemeProvider>
  );
}

function Routing() {
  const { setUser } = useAuth()!;

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("http://localhost:1337/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const user = await response.json();
        setUser(user);
      } else {
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PageLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="auth" element={<Auth />} />
          <Route element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
          <Route path="tests" element={<Tests />} />
          <Route element={<OverviewLayout />}>
            <Route path="test/:id" element={<Test />} />
          </Route>
          <Route path="test/:id/solve?" element={<Solve />} />
          <Route path="/404" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
