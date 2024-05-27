import { screen, waitFor, act } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import server from "../../../tests/mock-api-server";
import userEvent from "@testing-library/user-event";
import { renderWithAppContext, waitOneTick } from "../../../tests/utils";
import DeleteNoteButton from "../DeleteNoteButton";

describe("DeleteNoteButton", () => {
  beforeEach(() => {
    server.use(
      http.delete("http://localhost:3000/notes/:id", async () => {
        await waitOneTick();
        return HttpResponse.json();
      })
    );
  });

  it("shows a loading icon as the note is being deleted", async () => {
    renderWithAppContext(<DeleteNoteButton />);

    // Get the dummy note and delete it
    const deleteButton = screen.getByRole("button", {
      name: "Delete note",
    });
    // click the button, but don't wait for the action to finish
    // so we can check the button text changes when loading
    userEvent.click(deleteButton);

    // check the button becomes disabled and says 'Deleting note'
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Deleting note/i })
      ).toBeDisabled();
    });

    // prevent warning
    // Warning: An update to NotesList inside a test was not wrapped in act(...).
    // should have checked for another state change, but can't tell what
    // see https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve));
    });
  });

  it("allows deleting a note", async () => {
    renderWithAppContext(<DeleteNoteButton />);

    // Get the dummy note and delete it
    const deleteButton = screen.getByRole("button", {
      name: "Delete note",
    });
    await userEvent.click(deleteButton);

    expect(await screen.getByRole("status")).toHaveTextContent(
      "Note successfully deleted"
    );
  });

  it("shows an error if deleting a note failed", async () => {
    server.use(
      http.delete("http://localhost:3000/notes/:id", async () => {
        delay();
        return HttpResponse.json(null, { status: 500 });
      })
    );
    renderWithAppContext(<DeleteNoteButton />);

    // Get the dummy note and delete it
    const deleteButton = screen.getByRole("button", {
      name: "Delete note",
    });
    await userEvent.click(deleteButton);

    expect(await screen.getByRole("status")).toHaveTextContent(
      "There was an error deleting the note"
    );
  });
});
