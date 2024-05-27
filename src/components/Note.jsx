import DeleteNoteButton from "./DeleteNoteButton";
import PinNoteButton from "./PinNoteButton";

const Note = ({ id, title, content, is_pinned, onClick }) => {
  return (
    <div onClick={onClick}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h4>{title}</h4>
        <PinNoteButton id={id} is_pinned={is_pinned} />
      </div>
      <p>{content}</p>
      <div style={{ textAlign: "right" }}>
        <DeleteNoteButton id={id} />
      </div>
    </div>
  );
};

export default Note;
