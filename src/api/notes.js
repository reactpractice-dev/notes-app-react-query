import axios from "axios";

const getNotes = () =>
  axios
    .get(`${import.meta.env.VITE_BACKEND_API_URL}/notes`)
    .then((res) => res.data)
    .catch((e) => {
      throw new Error(e);
    });

const postNote = (note) =>
  axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/notes`, note);

export { getNotes, postNote };
