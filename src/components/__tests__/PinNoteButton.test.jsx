import { screen } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import server from "../../../tests/mock-api-server";
import userEvent from "@testing-library/user-event";
import { renderWithAppContext } from "../../../tests/utils";
import PinNoteButton from "../PinNoteButton";

describe("PinNoteButton", () => {
  beforeEach(() => {
    server.use(
      http.patch("http://localhost:3000/notes/:id", async () => {
        delay();
        return HttpResponse.json();
      })
    );
  });

  it("allows pinning and unpinning a note", async () => {
    renderWithAppContext(<PinNoteButton />);

    const pinNoteButton = screen.getByRole("button", {
      name: "Pin note",
    });
    await userEvent.click(pinNoteButton);

    // Check the note is now pinned by checking the button label updated
    const unpinButton = screen.queryByRole("button", {
      name: "Unpin note",
    });
    expect(unpinButton).toBeInTheDocument();

    // Check users can unpin it
    await userEvent.click(unpinButton);
    expect(
      screen.queryByRole("button", {
        name: "Pin note",
      })
    ).toBeInTheDocument();
  });
});
