import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { render } from "@testing-library/react";

// see https://tkdodo.eu/blog/testing-react-query for details
// on testing components that use react query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // disable retries so we can test errors
        retry: false,
      },
    },
  });
  // eslint-disable-next-line react/display-name
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      {children}
    </QueryClientProvider>
  );
};

export const renderWithAppContext = (ui) => {
  render(ui, { wrapper: createWrapper() });
};

export const waitOneTick = async () => {
  // wait one tick, to allow the loading state to show
  // https://github.com/TanStack/query/issues/4379
  await new Promise((resolve) => setTimeout(resolve, 0));
};
