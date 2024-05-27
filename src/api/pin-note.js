import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const patchNote = (note) =>
  axios.patch(`${import.meta.env.VITE_BACKEND_API_URL}/notes/${note.id}`, note);

export const usePinNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
};
