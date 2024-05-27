import {
  screen,
  waitForElementToBeRemoved,
  within,
  waitFor,
  act,
} from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import server from "../../../tests/mock-api-server";
import NotesList from "../NotesList";
import userEvent from "@testing-library/user-event";
import { v4 as uuid } from "uuid";
import toast from "react-hot-toast";
import { renderWithAppContext, waitOneTick } from "../../../tests/utils";

describe("Notes List", () => {
  beforeEach(() => {
    // remove all toasts before each test
    toast.remove();
  });
  describe("viewing notes", () => {
    it("shows a loading indicator before the notes are ready", async () => {
      server.use(
        http.get("http://localhost:3000/notes", () => {
          delay();
          return HttpResponse.json([{ id: uuid(), content: "hello tests" }]);
        })
      );
      renderWithAppContext(<NotesList />);

      await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

      const notes = screen.getAllByRole("listitem");
      expect(notes.map((note) => note.textContent)).toEqual(["hello tests"]);
    });

    it("shows notes with the latest one on top", async () => {
      server.use(
        http.get("http://localhost:3000/notes", () => {
          return HttpResponse.json([
            { id: uuid(), content: "first" },
            { id: uuid(), content: "second" },
            { id: uuid(), content: "third" },
          ]);
        })
      );
      renderWithAppContext(<NotesList />);

      await waitForElementToBeRemoved(() => screen.getByText(/loading/i));

      const notes = screen.getAllByRole("listitem");
      expect(notes.map((note) => note.textContent)).toEqual([
        "third",
        "second",
        "first",
      ]);
    });

    it("shows pinned notes at the top", async () => {
      server.use(
        http.get("http://localhost:3000/notes", () => {
          return HttpResponse.json([
            { id: uuid(), content: "first" },
            { id: uuid(), content: "second", is_pinned: true },
            { id: uuid(), content: "third" },
            { id: uuid(), content: "fourth", is_pinned: true },
            { id: uuid(), content: "fifth" },
          ]);
        })
      );
      renderWithAppContext(<NotesList />);

      const notes = await screen.findAllByRole("listitem");
      expect(notes.map((note) => note.textContent)).toEqual([
        "fourth",
        "second",
        "fifth",
        "third",
        "first",
      ]);
    });
  });

  describe("notes CRUD", () => {
    beforeEach(() => {
      const dummyNotes = [
        {
          id: uuid(),
          title: "Starter note",
          content: "Let's always have one note",
        },
      ];
      server.use(
        http.get("http://localhost:3000/notes", () => {
          return HttpResponse.json(dummyNotes);
        }),
        http.post("http://localhost:3000/notes", async ({ request }) => {
          const postedNote = await request.json();
          postedNote.id = uuid();
          dummyNotes.push(postedNote);
          await waitOneTick();
          return HttpResponse.json(postedNote);
        }),
        http.delete("http://localhost:3000/notes/:id", async ({ params }) => {
          const index = dummyNotes.findIndex((note) => note.id === params.id);
          dummyNotes.splice(index, 1);
          await waitOneTick();
          return HttpResponse.json();
        }),
        http.patch(
          "http://localhost:3000/notes/:id",
          async ({ params, request }) => {
            const index = dummyNotes.findIndex((note) => note.id === params.id);
            const postedNote = await request.json();
            dummyNotes[index] = { ...dummyNotes[index], ...postedNote };
            delay();
            return HttpResponse.json();
          }
        )
      );
    });

    describe("adding notes", () => {
      it("shows a loading state as the note is being added", async () => {
        renderWithAppContext(<NotesList />);

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

        // prevent warning
        // Warning: An update to NotesList inside a test was not wrapped in act(...).
        // should have checked for another state change, but can't tell what
        // see https://kentcdodds.com/blog/fix-the-not-wrapped-in-act-warning
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve));
        });
      });
      it("allows adding a note", async () => {
        renderWithAppContext(<NotesList />);

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

        // Check new note is displayed in the notes list
        await waitFor(() => {
          expect(screen.getAllByRole("listitem")).toHaveLength(2);
        });
        const notes = screen.getAllByRole("listitem");
        expect(within(notes[0]).getByText("Testing")).toBeInTheDocument();
        expect(
          within(notes[0]).getByText("Don't forget to check the tests")
        ).toBeInTheDocument();

        // Check the form is now cleared
        expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue("");
        expect(screen.getByRole("textbox", { name: "Content" })).toHaveValue(
          ""
        );
      });

      it("shows an error if adding a note failed", async () => {
        server.use(
          http.post("http://localhost:3000/notes", async () => {
            delay();
            return HttpResponse.json(null, { status: 500 });
          })
        );

        renderWithAppContext(<NotesList />);

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

        // Check notes list still has just one item
        const notes = await screen.findAllByRole("listitem");
        expect(notes).toHaveLength(1);

        // Check the form is NOT cleared
        expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue(
          "Testing"
        );
        expect(screen.getByRole("textbox", { name: "Content" })).toHaveValue(
          "Don't forget to check the tests"
        );
      });
    });

    describe("deleting notes", () => {
      it("shows a loading icon as the note is being deleted", async () => {
        renderWithAppContext(<NotesList />);

        // Get the dummy note and delete it
        const notes = await screen.findAllByRole("listitem");
        const deleteButton = within(notes[0]).getByRole("button", {
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
      });

      it("allows deleting a note", async () => {
        renderWithAppContext(<NotesList />);

        // Get the dummy note and delete it
        const notes = await screen.findAllByRole("listitem");
        const deleteButton = within(notes[0]).getByRole("button", {
          name: "Delete note",
        });
        await userEvent.click(deleteButton);

        // Check the notes list is now empty
        await waitFor(() =>
          expect(screen.queryAllByRole("listitem")).toHaveLength(0)
        );
      });

      it("shows an error if deleting a note failed", async () => {
        server.use(
          http.delete("http://localhost:3000/notes/:id", async () => {
            delay();
            return HttpResponse.json(null, { status: 500 });
          })
        );
        renderWithAppContext(<NotesList />);

        // Get the dummy note and delete it
        const notes = await screen.findAllByRole("listitem");
        const deleteButton = within(notes[0]).getByRole("button", {
          name: "Delete note",
        });
        await userEvent.click(deleteButton);

        expect(await screen.getByRole("status")).toHaveTextContent(
          "There was an error deleting the note"
        );

        // Check the notes list is now empty
        expect(await screen.queryAllByRole("listitem")).toHaveLength(1);
      });
    });

    describe("pinning notes", () => {
      it("allows pinning and unpinning a note", async () => {
        renderWithAppContext(<NotesList />);

        // Get the dummy note and delete it
        const notes = await screen.findAllByRole("listitem");
        expect(notes).toHaveLength(1);

        const pinNoteButton = within(notes[0]).getByRole("button", {
          name: "Pin note",
        });
        await userEvent.click(pinNoteButton);

        // Check the note is now pinned
        const unpinButton = within(notes[0]).queryByRole("button", {
          name: "Unpin note",
        });
        expect(unpinButton).toBeInTheDocument();

        // Check users can unpin it
        await userEvent.click(unpinButton);
        expect(
          within(notes[0]).queryByRole("button", {
            name: "Pin note",
          })
        ).toBeInTheDocument();
      });
    });
  });
});
