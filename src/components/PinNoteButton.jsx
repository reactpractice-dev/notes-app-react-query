import { BsPin } from "react-icons/bs";
import { BsPinFill } from "react-icons/bs";
import { usePinNote } from "../api/pin-note";

const PinNoteButton = ({ id, is_pinned }) => {
  const pinNoteMutation = usePinNote();

  const handlePin = (e) => {
    e.stopPropagation();
    pinNoteMutation.mutate({ id, is_pinned: !is_pinned });
  };
  return (
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
  );
};

export default PinNoteButton;
