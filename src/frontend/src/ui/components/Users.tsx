import { useEffect, useState } from "react";
import { User } from "../../../../common/types";
import { useNotyf } from "../../context/NotyfContext";

export default function Users() {
  const { notyf } = useNotyf()!;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users", {
          credentials: "include",
        });

        if (response.ok) {
          const usersData = await response.json();
          setUsers(usersData);
        }
      } catch (error: any) {
        notyf.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="shadow-md">
      <div className="flex gap-2 p-4 pb-2 text-lg  tracking-wide">
        <span className="flex-1 text-primary/70">Users</span>
        <button className="btn btn-ghost">?</button>
        <button className="btn btn-ghost">+</button>
      </div>
      <ul className="list bg-base-100 rounded-box h-[40vh] overflow-y-scroll">
        {users.map((user) => (
          <li key={user.id} className="list-row items-center">
            <div className="text-xl font-extralight opacity-70 tabular-nums flex items-center">
              {user.id}
            </div>
            <div className="avatar avatar-placeholder">
              <div className="bg-primary/60 text-neutral-content w-10 rounded-full">
                <span className="text-base-100">
                  {user.username.slice(0, 2)}
                </span>
              </div>
            </div>
            <div className="list-col-grow flex gap-2 flex-1">
              <div className="text-sm">{user.username}</div>
              <div
                className={`badge badge-soft ${user.isAdmin ? "badge-primary" : "badge-secondary"} text-sm opacity-60`}
              >
                {user.isAdmin ? "Admin" : "User"}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn btn-soft btn-success">E</button>
              <button className="btn btn-soft btn-error">X</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
