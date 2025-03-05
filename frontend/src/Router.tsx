import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router";

import { useAuth } from "@/context/AuthContext";

import { User } from "@/../../backend/src/db/schema";

import PageLayout from "@/layouts/PageLayout";
import AuthLayout from "@/layouts/AuthLayout";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";

export default function Router() {
  const { setUser } = useAuth()!;

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch("http://localhost:1337/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const json = await response.json();
        setUser(json.data as User);
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
