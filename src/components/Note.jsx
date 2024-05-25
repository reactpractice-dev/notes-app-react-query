import { BsFillTrash3Fill } from "react-icons/bs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNote, patchNote } from "../api/notes";
import { BsPin } from "react-icons/bs";
import { BsPinFill } from "react-icons/bs";
import toast from "react-hot-toast";

const Note = ({ id, title, content, is_pinned }) => {
  const queryClient = useQueryClient();
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      toast.success("Note successfully deleted");
      // Invalidate and refetch
      return queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: () => {
      toast.error("There was an error deleting the note");
    },
  });

  const pinNoteMutation = useMutation({
    mutationFn: patchNote,
    // When mutate is called:
    onMutate: async (updatedNote) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries(["notes"]);

      // Snapshot the previous value
      const previousNotes = queryClient.getQueryData(["notes"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["notes"], (notes) =>
        notes.map((n) =>
          n.id === updatedNote.id
            ? { ...n, is_pinned: updatedNote.is_pinned }
            : n
        )
      );

      // Return a context object with the snapshotted value
      return { previousNotes };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, updatedNote, context) => {
      queryClient.setQueryData(["notes"], context.previousNotes);
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
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
          onClick={() => pinNoteMutation.mutate({ id, is_pinned: !is_pinned })}
        >
          {is_pinned ? <BsPinFill /> : <BsPin />}
        </button>
      </div>
      <p>{content}</p>
      <div style={{ textAlign: "right" }}>
        <button
          disabled={deleteNoteMutation.isPending}
          onClick={() => deleteNoteMutation.mutate(id)}
          style={{ padding: "6px", paddingBottom: "2px" }}
          title={deleteNoteMutation.isPending ? "Deleting note" : "Delete note"}
        >
          <BsFillTrash3Fill />
        </button>
      </div>
    </>
  );
};

export default Note;
