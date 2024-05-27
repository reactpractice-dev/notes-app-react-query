import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const postNote = (note) =>
  axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/notes`, note);

export const useCreateNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postNote,
    onSuccess: () => {
      // Invalidate and refetch
      return queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
};
