import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const patchNote = (note) =>
  axios.patch(`${import.meta.env.VITE_BACKEND_API_URL}/notes/${note.id}`, note);

export const usePinNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: patchNote,
    onSuccess: () => {
      // Invalidate and refetch
      return queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
