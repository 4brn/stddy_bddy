import { useAuth } from "@/context/AuthContext";
import Logout from "@/components/Logout";

export default function Avatar() {
  const { user } = useAuth()!;

  return (
    <div className="dropdown dropdown-end mr-2">
      <button
        tabIndex={0}
        role="button"
        className="btn btn-ghost btn-circle avatar avatar-placeholder"
      >
        <div className="bg-primary text-neutral-content w-12 rounded-full">
          <span>{user?.username.slice(0, 2)}</span>
        </div>
      </button>
      <ul
        tabIndex={0}
        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
      >
        <li>
          <a>Profile</a>
        </li>
        <li>
          <a>Settings</a>
        </li>
        <li>
          <Logout className={"text-left text-sm"} />
        </li>
      </ul>
    </div>
  );
}
