import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router";

import Theme from "./Theme";
import Logo from "./Logo";
import LogoutButton from "./LogoutButton";
import Avatar from "./Avatar";

const NoUserBar = () => {
  return (
    <>
      <Link to="/login">
        <button className="btn btn-ghost text-lg">Login</button>
      </Link>
      {/* <Link to="/register">
        <button className="btn btn-ghost text-lg">Register</button>
      </Link> */}
    </>
  );
};

const UserBar = () => {
  return (
    <>
      <Avatar />
      <LogoutButton />
    </>
  );
};

export default function NavBar() {
  const { user } = useAuth()!;

  return (
    <nav className="navbar fixed top-0 bg-base-100 shadow-sm">
      <div className="flex-1">
        <Logo />
        <Theme />
      </div>
      <div className="flex">{user ? <UserBar /> : <NoUserBar />}</div>
    </nav>
  );
}
