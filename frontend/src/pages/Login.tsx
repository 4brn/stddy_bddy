import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { useNotyf } from "@/context/NotyfContext";

export default function Login() {
  const { user, setUser } = useAuth()!;
  const { notyf } = useNotyf()!;
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleReset = () => {
    setUsername("");
    setPassword("");
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const response = await fetch("http://localhost:1337/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });

    if (response.status === 307) {
      navigate("/dashboard");
      notyf.info("Already logged in.");
    }

    if (!response.ok) {
      handleReset();
      notyf.error("Incorrect username or password.");
    }

    if (response.ok) {
      const json = await response.json();
      setUser(json.data);
      notyf.success(`Logged in as ${username}`);
    }
  };

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user]);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <fieldset className="fieldset w-xs bg-base-200 border border-base-300 p-5 rounded-box">
          <legend className="fieldset-legend text-lg text-primary">
            Login
          </legend>

          <div>
            <label className="floating-label text-primary text-sm">
              <span>Username</span>
              <input
                type="text"
                className="input validator"
                name="username"
                placeholder="Username"
                minLength={3}
                maxLength={30}
                // pattern="[A-Za-z][A-Za-z0-9\-]*"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <p className="validator-hint text-start">Incorrect Username</p>
            </label>
          </div>

          <div>
            <label className="floating-label text-primary text-sm">
              <span>Password</span>
              <input
                type="password"
                className="input validator"
                placeholder="Password"
                minLength={5}
                maxLength={255}
                name="password"
                // pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="validator-hint text-start">Incorrect Password</p>
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-soft">
            Login
          </button>
        </fieldset>
      </form>
      <p className="text-xs mt-3">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-primary font-bold underline underline-offset-1"
        >
          Register
        </Link>
      </p>
    </>
  );
}
