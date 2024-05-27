import { useState } from "react";
import { useCreateNote } from "../api/create-note";

const AddNote = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState();

  const createNoteMutation = useCreateNote();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content || !title) {
      setError(
        "Your note is empty! Make sure to add some text before you save."
      );
      return;
    }
    createNoteMutation.mutate(
      { title, content },
      {
        onSuccess: () => {
          // Clear form values
          setTitle("");
          setContent("");
          setError(undefined);
        },
        onError: (createError) => {
          setError(createError.response.statusText);
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        padding: "10px",
        backgroundColor: "lightblue",
        marginBottom: "30px",
      }}
    >
      {error && <span style={{ color: "red" }}>{error}</span>}
      <input
        type="text"
        placeholder="Title"
        name="title"
        aria-label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Take a note ..."
        name="content"
        aria-label="Content"
        rows={6}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>
      <button type="submit" disabled={createNoteMutation.isPending}>
        {createNoteMutation.isPending ? "Adding note" : "Add note"}
      </button>
    </form>
  );
};

export default AddNote;
