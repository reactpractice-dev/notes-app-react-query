import { render, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import server from "../../../tests/mock-api-server";

import NotesList from "../NotesList";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "react-query";
import { v4 as uuid } from "uuid";

// see https://tkdodo.eu/blog/testing-react-query for details
// on testing components that use react query
const createWrapper = () => {
  const queryClient = new QueryClient();
  // eslint-disable-next-line react/display-name
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("Notes List", () => {
  describe("viewing notes", () => {
    it("shows notes with the latest one on top", async () => {
      server.use(
        http.get("http://localhost:3000/notes", () => {
          return HttpResponse.json([
            { id: 1, content: "first" },
            { id: 2, content: "second" },
            { id: 3, content: "third" },
          ]);
        })
      );
      render(<NotesList />, { wrapper: createWrapper() });

      const notes = await screen.findAllByRole("listitem");
      expect(notes.map((note) => note.textContent)).toEqual([
        "third",
        "second",
        "first",
      ]);
    });
  });

  describe("notes CRUD", () => {
    beforeEach(() => {
      const dummyNotes = [
        { id: 1, title: "Starter note", content: "Let's always have one note" },
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
        })
      );
    });

    it("allows users to add a note", async () => {
      render(<NotesList />, { wrapper: createWrapper() });

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

      // Check it's displayed in the notes list
      const notes = await screen.findAllByRole("listitem");
      expect(notes).toHaveLength(2);
      expect(within(notes[0]).getByText("Testing")).toBeInTheDocument();
      expect(
        within(notes[0]).getByText("Don't forget to check the tests")
      ).toBeInTheDocument();

      // Check the form is now cleared
      expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue("");
      expect(screen.getByRole("textbox", { name: "Content" })).toHaveValue("");
    });

    it("allows users to delete a note", async () => {
      render(<NotesList />, { wrapper: createWrapper() });

      // Get the dummy note and delete it
      const notes = await screen.findAllByRole("listitem");
      expect(notes).toHaveLength(1);

      const deleteButton = within(notes[0]).getByRole("button");
      await userEvent.click(deleteButton);

      // Check the notes list is now empty
      expect(await screen.queryAllByRole("listitem")).toHaveLength(0);
    });
  });
});
