import { BsFillTrash3Fill } from "react-icons/bs";
import { BsPin } from "react-icons/bs";
import { BsPinFill } from "react-icons/bs";
import toast from "react-hot-toast";
import { usePinNote } from "../api/pin-note";
import { useDeleteNote } from "../api/delete-note";

const Note = ({ id, title, content, is_pinned, onClick }) => {
  const deleteNoteMutation = useDeleteNote();
  const pinNoteMutation = usePinNote();

  const handlePin = (e) => {
    e.stopPropagation();
    pinNoteMutation.mutate({ id, is_pinned: !is_pinned });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteNoteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Note successfully deleted");
      },
      onError: () => {
        toast.error("There was an error deleting the note");
      },
    });
  };

  return (
    <div onClick={onClick}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4>{title}</h4>
        <button
          style={{
            flexGrow: 0,
            flexShrink: 0,
            padding: "6px",
            paddingBottom: "2px",
          }}
          title={is_pinned ? "Unpin note" : "Pin note"}
          onClick={handlePin}
        >
          {is_pinned ? <BsPinFill /> : <BsPin />}
        </button>
      </div>
      <p>{content}</p>
      <div style={{ textAlign: "right" }}>
        <button
          disabled={deleteNoteMutation.isPending}
          onClick={handleDelete}
          style={{ padding: "6px", paddingBottom: "2px" }}
          title={deleteNoteMutation.isPending ? "Deleting note" : "Delete note"}
        >
          <BsFillTrash3Fill />
        </button>
      </div>
    </div>
  );
};

export default Note;
