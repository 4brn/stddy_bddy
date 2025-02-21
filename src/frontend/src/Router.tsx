import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";

import { useAuth } from "./context/AuthContext";
import { User } from "../../common/types";

import PageLayout from "./ui/layouts/PageLayout";
import AuthLayout from "./ui/layouts/AuthLayout";

import Home from "./ui/pages/Home";
import Login from "./ui/pages/Login";
import Register from "./ui/pages/Register";
import Dashboard from "./ui/pages/Dashboard";

export default function Router() {
  const { setUser } = useAuth()!;

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("http://localhost:3000/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const userData: User | null = await response.json();
        setUser(userData);
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
          <Route path="/dashboard" element={<Dashboard />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
