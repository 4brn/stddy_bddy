import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

export default function Login() {
  const { setUser } = useAuth()!;
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const reset = () => {
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:1337/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    switch (response.status) {
      case 200:
        const json = await response.json();
        setUser(json.data);
        navigate("/dashboard");
        toast.success("Logged in successfully");
        break;
      case 307:
        navigate("/tests");
        break;
      case 400:
        reset();
        toast.error("Incorrect username or password");
        break;
      case 404:
        reset();
        toast.error("User not found");
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Login to your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="username"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                placeholder="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
