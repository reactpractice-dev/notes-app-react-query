import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export const getNotes = () =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_API_URL}/notes`)
    .then((res) => res.data);

export const useNotes = () =>
  useQuery({ queryKey: ["notes"], queryFn: getNotes });
