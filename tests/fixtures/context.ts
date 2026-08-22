import * as github from "@actions/github";
import { beforeEach, vi } from "vitest";

type Context = typeof github.context;

export const defaultContext: Readonly<Partial<Context>> = {
  eventName: "pull_request",
  repo: {
    owner: "Arthri",
    repo: "release-request",
  },
};

export let context: Context = {} satisfies Partial<Context> as any; // eslint-disable-line @typescript-eslint/no-explicit-any

beforeEach(() => {
  context = structuredClone(defaultContext) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  vi.spyOn(github, "context", "get").mockImplementation(() => context as any); // eslint-disable-line @typescript-eslint/no-explicit-any
});
