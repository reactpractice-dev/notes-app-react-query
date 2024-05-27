import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import server from "./mock-api-server";
import toast from "react-hot-toast";

expect.extend(matchers);

beforeEach(() => {
  // remove all toasts before each test
  toast.remove();
});
beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());

// Fix "TypeError: matchMedia is not a function"
// cause by using `react-hot-toast` in testing environment
// error is caused by `matchMedia` not being implement in jsdom
// solution is to just mock it (see https://github.com/chakra-ui/chakra-ui/discussions/6664)
const matchMediaMock = vi.fn((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
vi.stubGlobal("matchMedia", matchMediaMock);
