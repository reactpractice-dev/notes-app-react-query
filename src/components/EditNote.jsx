import { useState } from "react";
import { useUpdateNote } from "../api/update-note";
import toast from "react-hot-toast";

const EditNote = ({ note, onSave }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const updateNoteMutation = useUpdateNote();

  const handleSubmit = (e) => {
    e.preventDefault();
    updateNoteMutation.mutate(
      { ...note, title, content },
      {
        onSuccess: () => {
          toast.success("Note successfully saved");
          onSave();
        },
        onError: () => {
          toast.error("There was an error saving the note");
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
        marginBottom: "30px",
      }}
    >
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
      <button type="submit" disabled={updateNoteMutation.isPending}>
        {updateNoteMutation.isPending ? "Saving ..." : "Save"}
      </button>
    </form>
  );
};

export default EditNote;
