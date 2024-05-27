import { BsFillTrash3Fill } from "react-icons/bs";
import toast from "react-hot-toast";
import { useDeleteNote } from "../api/delete-note";

const DeleteNoteButton = ({ id }) => {
  const deleteNoteMutation = useDeleteNote();

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
    <button
      disabled={deleteNoteMutation.isPending}
      onClick={handleDelete}
      style={{ padding: "6px", paddingBottom: "2px" }}
      title={deleteNoteMutation.isPending ? "Deleting note" : "Delete note"}
    >
      <BsFillTrash3Fill />
    </button>
  );
};

export default DeleteNoteButton;
