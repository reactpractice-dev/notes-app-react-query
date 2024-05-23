import { BsFillTrash3Fill } from "react-icons/bs";
import { useMutation, useQueryClient } from "react-query";
import { deleteNote, patchNote } from "../api/notes";
import { BsPin } from "react-icons/bs";
import { BsPinFill } from "react-icons/bs";

const Note = ({ id, title, content, is_pinned }) => {
  const queryClient = useQueryClient();
  const deleteNoteMutation = useMutation(deleteNote, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries("notes");
    },
  });

  const patchNoteMutation = useMutation(patchNote, {
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries("notes");
    },
  });
  return (
    <>
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
          onClick={() =>
            patchNoteMutation.mutate({ id, is_pinned: !is_pinned })
          }
        >
          {is_pinned ? <BsPinFill /> : <BsPin />}
        </button>
      </div>
      <p>{content}</p>
      <div style={{ textAlign: "right" }}>
        <button
          onClick={() => deleteNoteMutation.mutate(id)}
          style={{ padding: "6px", paddingBottom: "2px" }}
          title="Delete note"
        >
          <BsFillTrash3Fill />
        </button>
      </div>
    </>
  );
};

export default Note;
