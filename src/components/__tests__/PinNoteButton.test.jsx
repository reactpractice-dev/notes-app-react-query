import { screen } from "@testing-library/react";
import { renderWithAppContext } from "../../../tests/utils";
import PinNoteButton from "../PinNoteButton";

describe("PinNoteButton", () => {
  it("show pin button for unpinned notes", async () => {
    renderWithAppContext(<PinNoteButton id={123} is_pinned={false} />);
    expect(
      screen.getByRole("button", {
        name: "Pin note",
      })
    ).toBeInTheDocument();
  });

  it("show unpin button for pinned notes", async () => {
    renderWithAppContext(<PinNoteButton id={123} is_pinned />);
    expect(
      screen.getByRole("button", {
        name: "Unpin note",
      })
    ).toBeInTheDocument();
  });
});
