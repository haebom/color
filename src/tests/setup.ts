// Test setup file for vitest
import { vi } from "vitest";
import "@testing-library/jest-dom";

// Mock browser APIs that cause issues in test environment
// Mock setTimeout/clearTimeout for debounce hooks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.setTimeout = vi.fn((fn: any) => {
  fn();
  return 1;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;
global.clearTimeout = vi.fn();

// Increase test timeout for complex operations
vi.setConfig({
  testTimeout: 10000,
});

// Mock window.matchMedia (needed for responsive components)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock navigator.clipboard (needed for useClipboard hook)
Object.defineProperty(navigator, "clipboard", {
  writable: true,
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  },
});

// Mock window.location (needed for URL query parsing)
if (typeof window !== "undefined") {
  delete (window as unknown as { location?: unknown }).location;
  window.location = {
    href: "http://localhost/",
    origin: "http://localhost",
    protocol: "http:",
    host: "localhost",
    hostname: "localhost",
    port: "",
    pathname: "/",
    search: "",
    hash: "",
    reload: vi.fn(),
    replace: vi.fn(),
    assign: vi.fn(),
  } as Location;
}

// Mock window.history (needed for pushState in ColorGenerator)
Object.defineProperty(window, "history", {
  writable: true,
  value: {
    pushState: vi.fn(),
    replaceState: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    go: vi.fn(),
    length: 0,
    state: {},
  },
});


