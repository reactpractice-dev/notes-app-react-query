import NotesList from "./components/NotesList";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotesList />
    </QueryClientProvider>
  );
}

export default App;
