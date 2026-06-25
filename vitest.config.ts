import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests for the pure logic in lib/ (analyzer, datetime, validation).
// Path alias mirrors tsconfig ("@/*" -> "./*") so tests import the same way the
// app does. Node environment — none of these modules touch the DOM.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname) },
  },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
