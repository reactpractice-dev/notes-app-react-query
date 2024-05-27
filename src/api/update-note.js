import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const updateNote = (note) =>
  axios.put(`${import.meta.env.VITE_BACKEND_API_URL}/notes/${note.id}`, note);

export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNote,
    onSuccess: () => {
      // Invalidate and refetch
      return queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
