import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import server from "../../../tests/mock-api-server";
import userEvent from "@testing-library/user-event";
import { renderWithAppContext, waitOneTick } from "../../../tests/utils";
import EditNote from "../EditNote";

describe("EditNote", () => {
  beforeEach(() => {
    server.use(
      http.put("http://localhost:3000/notes/:id", async ({ request }) => {
        const postedNote = await request.json();
        await waitOneTick();
        return HttpResponse.json(postedNote);
      })
    );
  });

  it("shows a loading state as the note is being added", async () => {
    renderWithAppContext(
      <EditNote
        note={{ id: "123", title: "Hello", content: "World" }}
        onSave={vi.fn()}
      />
    );

    // Edit the note
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
    userEvent.click(screen.getByRole("button", { name: "Save" }));

    // check the button becomes disabled and says 'Saving note'
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Saving .../i })
      ).toBeDisabled();
    });
  });

  it("allows adding a note", async () => {
    const onSave = vi.fn();
    renderWithAppContext(
      <EditNote
        note={{ id: "123", title: "Hello", content: "World" }}
        onSave={onSave}
      />
    );

    // Create the note
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Title" }),
      "Testing"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Content" }),
      "Don't forget to check the tests"
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "Note successfully saved"
      );
    });

    // Check the `onSave` callback is called
    expect(onSave).toHaveBeenCalled();
  });

  it("shows an error if adding a note failed", async () => {
    server.use(
      http.put("http://localhost:3000/notes/:id", async () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const onSave = vi.fn();
    renderWithAppContext(
      <EditNote
        note={{ id: "123", title: "Hello", content: "World" }}
        onSave={onSave}
      />
    );

    // Create the note
    await userEvent.type(
      await screen.findByRole("textbox", { name: "Title" }),
      "Testing"
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Content" }),
      "Don't forget to check the tests"
    );
    await userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "There was an error saving the note"
      );
    });

    // Check the callback is NOT called
    expect(onSave).not.toHaveBeenCalled();
  });
});
