import { useQuery } from "react-query";
import AddNote from "./AddNote";
import { getNotes } from "../api/notes";
import Note from "./Note";

const NotesList = () => {
  const {
    isLoading,
    error,
    data: notes,
    isFetching,
  } = useQuery("notes", () =>
    getNotes().then((notes) => {
      // reverse data so we always show latest note on top
      return notes.reverse();
    })
  );

  if (isLoading) return "Loading...";

  if (error)
    return (
      <p style={{ color: "red" }}> An error has occurred: {error.message}</p>
    );

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h1>Notes</h1>
      <AddNote />

      <div>{isFetching ? "Updating..." : ""}</div>
      {notes && (
        <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
          {notes.map((note) => (
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
