import { BsPin } from "react-icons/bs";
import { BsPinFill } from "react-icons/bs";
import { usePinNote } from "../api/pin-note";
import DeleteNoteButton from "./DeleteNoteButton";

const Note = ({ id, title, content, is_pinned, onClick }) => {
  const pinNoteMutation = usePinNote();

  const handlePin = (e) => {
    e.stopPropagation();
    pinNoteMutation.mutate({ id, is_pinned: !is_pinned });
  };

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
        <button
          style={{
            flexGrow: 0,
            flexShrink: 0,
            padding: "6px",
            paddingBottom: "2px",
          }}
          title={is_pinned ? "Unpin note" : "Pin note"}
          onClick={handlePin}
        >
          {is_pinned ? <BsPinFill /> : <BsPin />}
        </button>
      </div>
      <p>{content}</p>
      <div style={{ textAlign: "right" }}>
        <DeleteNoteButton id={id} />
      </div>
    </div>
  );
};

export default Note;
