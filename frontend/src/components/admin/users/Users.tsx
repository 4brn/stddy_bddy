import { useEffect, useState } from "react";
import { User } from "@/../../backend/src/db/schema";
import { useNotyf } from "@/context/NotyfContext";

import UserRecord from "@/components/admin/users/UserRecord";

export default function Users() {
  const { notyf } = useNotyf()!;
  const [users, setUsers] = useState<User[]>([]);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:1337/api/users", {
          credentials: "include",
        });

        if (response.ok) {
          const json = await response.json();
          const usersData = json.data;
          setUsers(usersData);
        }
      } catch (error: any) {
        notyf.error(error);
      } finally {
        // setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="shadow-md">
      <div className="flex gap-2 p-4 pb-2 text-lg  tracking-wide">
        <span className="flex-1 text-primary/70">Users</span>
        <input type="checkbox" className="input" placeholder="asdf" />
        <button className="btn btn-ghost">+</button>
      </div>
      <ul className="list bg-base-100 rounded-box h-[40vh] overflow-y-scroll">
        {users.map((user) => (
          <UserRecord user={user} />
        ))}
      </ul>
    </div>
  );
}
