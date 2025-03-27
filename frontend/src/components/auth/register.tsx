import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const reset = () => {
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const response = await fetch("http://localhost:1337/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    switch (response.status) {
      case 201:
        toast.success("Registered successfully");
        setTimeout(() => navigate("/"), 1000);
        break;
      case 307:
        navigate("/dashboard");
        toast.info("Already logged in");
        break;
      case 400:
        reset();
        toast.error("Incorrect username or password");
        break;
      case 409:
        reset();
        toast.error("Username already used");
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Register a new account</CardTitle>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button type="submit" className="w-full">
                Register
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
