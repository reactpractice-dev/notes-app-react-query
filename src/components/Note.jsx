import { FaRegTrashCan } from "react-icons/fa6";
import { useMutation, useQueryClient } from "react-query";
import { deleteNote } from "../api/notes";

const Note = ({ id, title, content }) => {
  const queryClient = useQueryClient();
  const deleteNoteMutation = useMutation(deleteNote, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries("notes");
    },
  });
  return (
    <>
      <h4>{title}</h4>
      <p>{content}</p>
      <div style={{ textAlign: "right" }}>
        <button onClick={() => deleteNoteMutation.mutate(id)}>
          <FaRegTrashCan />
        </button>
      </div>
    </>
  );
};

export default Note;
