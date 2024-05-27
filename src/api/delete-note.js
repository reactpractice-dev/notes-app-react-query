import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const deleteNote = (noteId) =>
  axios.delete(`${import.meta.env.VITE_BACKEND_API_URL}/notes/${noteId}`);

export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      // Invalidate and refetch
      return queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
