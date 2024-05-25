import NotesList from "./components/NotesList";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Toaster />
      </div>
      <NotesList />
    </QueryClientProvider>
  );
}

export default App;
