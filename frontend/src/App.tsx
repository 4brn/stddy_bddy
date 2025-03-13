import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router";
import { useEffect } from "react";

import { ThemeProvider } from "@/context/theme_context";
import { AuthProvider, useAuth } from "@/context/auth_context";
import { Toaster } from "@/components/ui/sonner";

import Home from "@/pages/home";
import Auth from "@/pages/auth";
import Dashboard from "@/pages/dashboard";
import PageLayout from "@/layouts/page_layout";

const Router = () => {
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
        <Route element={PageLayout()}>
          <Route index element={<Home />} />
          <Route path="auth" element={<Auth />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <Router />
        <Toaster expand={true} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
