import { Pencil, Trash } from "lucide-react";
import { User } from "../../../../../backend/src/db/schema";
import EditUser from "./EditUser";

export default function UserRecord({ user }: { user: User }) {
  return (
    <li key={user.id} className="list-row items-center">
      <div className="text-xl font-extralight opacity-70 tabular-nums flex items-center">
        {user.id}
      </div>
      <div className="list-col-grow flex gap-2 flex-1">
        <div className="text-sm w-15 truncate" title={user.username}>
          {user.username}
        </div>
        <div
          className={`badge badge-soft ${user.role === "admin" ? "badge-primary" : "badge-secondary"} text-sm opacity-60`}
        >
          {user.role === "admin" ? "Admin" : "User"}
        </div>
      </div>
      <div className="flex gap-1">
        {/* <button className="btn btn-ghost">
          <Pencil size={15} color="green" />
        </button> */}
        <EditUser user={user} />
        {/* <button className="btn btn-ghost">
          <Trash size={15} color="red" />
        </button> */}
      </div>
    </li>
  );
}
