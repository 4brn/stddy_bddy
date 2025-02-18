import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter, Routes, Route } from "react-router";
import PageLayout from "./ui/layouts/PageLayout";
import AuthLayout from "./ui/layouts/AuthLayout";
import Home from "./ui/pages/Home";
import Login from "./ui/pages/Login";
import Register from "./ui/pages/Register";


const Routing = () => {
  return (
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
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routing />
      </BrowserRouter>
    </AuthProvider>
  );
}
