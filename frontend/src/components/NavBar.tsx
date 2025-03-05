import { useAuth } from "@/context/AuthContext";
import { Link } from "react-router";

import Theme from "./Theme";
import Logo from "./Logo";
import Avatar from "./Avatar";

const NoUserBar = () => {
  return (
    <>
      <Link to="/login">
        <button className="btn btn-ghost text-lg">Login</button>
      </Link>
    </>
  );
};

const UserBar = () => {
  return (
    <>
      <Avatar />
    </>
  );
};

export default function NavBar() {
  const { user } = useAuth()!;

  return (
    <nav className="navbar sticky top-0 z-50 flex bg-base-100 shadow-sm">
      <div className="flex-1">
        <Logo />
        <Theme />
      </div>
      <div>{user ? <UserBar /> : <NoUserBar />}</div>
    </nav>
  );
}
