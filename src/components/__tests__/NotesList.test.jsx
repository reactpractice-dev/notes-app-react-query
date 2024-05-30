import {
  screen,
  waitForElementToBeRemoved,
  within,
  waitFor,
} from "@testing-library/react";
import { delay, http, HttpResponse } from "msw";
import server from "../../../tests/mock-api-server";
import NotesList from "../NotesList";
import userEvent from "@testing-library/user-event";
import { v4 as uuid } from "uuid";
import { renderWithAppContext } from "../../../tests/utils";

describe("Notes List", () => {
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

    it("shows the title and content for each note", async () => {
      server.use(
        http.get("http://localhost:3000/notes", async () => {
          return HttpResponse.json([
            { id: uuid(), title: "title1", content: "content1" },
            { id: uuid(), title: "title2", content: "content2" },
          ]);
        })
      );
      renderWithAppContext(<NotesList />);

      const notes = await screen.findAllByRole("listitem");
      expect(notes).toHaveLength(2);

      expect(screen.getByText(/title1/)).toBeInTheDocument();
      expect(screen.getByText(/content1/)).toBeInTheDocument();
      expect(screen.getByText(/title2/)).toBeInTheDocument();
      expect(screen.getByText(/content2/)).toBeInTheDocument();
    });

    it("shows an error if the notes couldn't be fetched", async () => {
      server.use(
        http.get("http://localhost:3000/notes", async () => {
          return HttpResponse.json(null, { status: 500 });
        })
      );
      renderWithAppContext(<NotesList />);
      await waitFor(() => {
        expect(
          screen.getByText(/Request failed with status code 500/)
        ).toBeInTheDocument();
      });
    });

    describe("sorting", () => {
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
          return HttpResponse.json(postedNote);
        }),
        http.delete("http://localhost:3000/notes/:id", async ({ params }) => {
          const index = dummyNotes.findIndex((note) => note.id === params.id);
          dummyNotes.splice(index, 1);
          return HttpResponse.json();
        }),
        http.patch(
          "http://localhost:3000/notes/:id",
          async ({ params, request }) => {
            const index = dummyNotes.findIndex((note) => note.id === params.id);
            const postedNote = await request.json();
            dummyNotes[index] = { ...dummyNotes[index], ...postedNote };
            return HttpResponse.json();
          }
        )
      );
    });

    it("shows newly added note in the list", async () => {
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
    });

    it("removes deleted note from the list", async () => {
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
