import { useQuery } from "@tanstack/react-query";
import AddNote from "./AddNote";
import { getNotes } from "../api/notes";
import Note from "./Note";

const NotesList = () => {
  const {
    isPending,
    error,
    data: notes,
    isFetching,
  } = useQuery({ queryKey: ["notes"], queryFn: getNotes });

  if (isPending) return "Loading...";

  if (error)
    return (
      <p style={{ color: "red" }}> An error has occurred: {error.message}</p>
    );

  // reverse data so we always show latest note on top
  const sortedNotes = notes.reverse();
  const notesWithPinnedOnTop = [
    ...sortedNotes.filter((note) => note.is_pinned),
    ...sortedNotes.filter((note) => !note.is_pinned),
  ];

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h1>Notes</h1>
      <AddNote />

      <div>{isFetching ? "Updating..." : ""}</div>
      {notes && (
        <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
          {notesWithPinnedOnTop.map((note) => (
            <li
              key={note.id}
              style={{
                border: "1px solid gray",
                padding: "5px",
                margin: "5px",
              }}
            >
              <Note {...note} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotesList;
