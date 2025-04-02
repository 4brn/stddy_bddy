import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "@/components/auth/login";
import Register from "@/components/auth/register";
import { useAuth } from "@/context/auth-context";
import { useNavigate } from "react-router";

export default function Auth() {
  const { user } = useAuth()!;
  const navigate = useNavigate()!;

  useEffect(() => {
    if (user) {
      navigate("/tests");
    }
  }, [user]);

  return (
    <div className="flex h-full items-center justify-center">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Login />
        </TabsContent>
        <TabsContent value="register">
          <Register />
        </TabsContent>
      </Tabs>
    </div>
  );
}
