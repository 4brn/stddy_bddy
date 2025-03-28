import "@/index.css";
import { useEffect } from "react";
import { ThemeProvider } from "@/context/theme-context";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { BrowserRouter, Routes, Route } from "react-router";
import { Toaster } from "./components/ui/sonner";

import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import PageLayout from "@/layouts/page";
import NotFound from "@/pages/404";
import Tests from "@/pages/tests";
import DashboardLayout from "./layouts/dashboard";

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
        const json = await response.json();
        setUser(json.data);
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
        </Route>
        <Route path="/404" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
