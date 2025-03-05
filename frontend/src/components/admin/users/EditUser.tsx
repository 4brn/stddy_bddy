import { Pencil } from "lucide-react";
import { User } from "../../../../../backend/src/db/schema";

export default function EditUser({ user }: { user: User }) {
  return (
    <>
      {/* The button to open modal */}
      <label htmlFor="edit-modal" className="btn">
        <Pencil className={"bg-error"} />
      </label>

      {/* Put this part before </body> tag */}
      <input type="checkbox" id="edit-modal" className="modal-toggle" />
      <div className="modal" role="dialog">
        <div className="modal-box">
          <h3 className="text-lg font-bold">Hello!</h3>
          <p className="py-4">This modal works with a hidden checkbox!</p>
          <div className="modal-action">
            <label htmlFor="my_modal_6" className="btn">
              Close!
            </label>
          </div>
        </div>
      </div>
    </>
  );
}
