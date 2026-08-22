import { vi } from "vitest";

import "./context";
import "./config";
import "./octokit";

import "./payload";
import "./logging";

/* NOTE: do not mock modules in the source code. Mocking should strictly be kept to dependencies and external data if possible.
 * this is avoid fragile tests which break with refactoring.
 */
vi.mock(import("@actions/core"));
vi.mock(import("@actions/github"));
