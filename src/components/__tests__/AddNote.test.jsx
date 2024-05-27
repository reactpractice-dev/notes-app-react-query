import { screen, waitFor } from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import server from "../../../tests/mock-api-server";
import userEvent from "@testing-library/user-event";
import { renderWithAppContext, waitOneTick } from "../../../tests/utils";
import AddNote from "../AddNote";

describe("AddNote", () => {
  beforeEach(() => {
    server.use(
      http.post("http://localhost:3000/notes", async ({ request }) => {
        const postedNote = await request.json();
        await waitOneTick();
        return HttpResponse.json(postedNote);
      })
    );
  });

  it("shows a loading state as the note is being added", async () => {
    renderWithAppContext(<AddNote />);

    // Create the note
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Title" }),
      "Testing"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Content" }),
      "Don't forget to check the tests"
    );
    // click the button, but don't wait for the action to finish
    // so we can check the button text changes when loading
    userEvent.click(screen.getByRole("button", { name: "Add note" }));

    // check the button becomes disabled and says 'Adding note'
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Adding note/i })
      ).toBeDisabled();
    });
  });

  it("allows adding a note", async () => {
    renderWithAppContext(<AddNote />);

    // Create the note
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Title" }),
      "Testing"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Content" }),
      "Don't forget to check the tests"
    );
    await userEvent.click(screen.getByRole("button", { name: "Add note" }));

    expect(await screen.getByRole("status")).toHaveTextContent(
      "Note successfully added"
    );

    // Check the form is now cleared
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: "Content" })).toHaveValue("");
  });

  it("shows an error if adding a note failed", async () => {
    server.use(
      http.post("http://localhost:3000/notes", async () => {
        delay();
        return HttpResponse.json(null, { status: 500 });
      })
    );

    renderWithAppContext(<AddNote />);

    // Create the note
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Title" }),
      "Testing"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Content" }),
      "Don't forget to check the tests"
    );
    await userEvent.click(screen.getByRole("button", { name: "Add note" }));

    // Check that an error message is displayed
    expect(screen.getByText("Internal Server Error")).toBeInTheDocument();

    expect(await screen.getByRole("status")).toHaveTextContent(
      "There was an error adding the note"
    );

    // Check the form is NOT cleared
    expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue(
      "Testing"
    );
    expect(screen.getByRole("textbox", { name: "Content" })).toHaveValue(
      "Don't forget to check the tests"
    );
  });
});
