import { NavLink } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function Logo() {
  const { user } = useAuth()!;

  return (
    <NavLink
      to={user ? "/dashboard" : "/"}
      className={"btn btn-ghost text-2xl"}
    >
      StddyBddy
    </NavLink>
  );
}
