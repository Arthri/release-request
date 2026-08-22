import * as core from "@actions/core";
import { beforeEach, vi } from "vitest";

export const defaultInputs: Readonly<Record<string, string>> = {
  token: "PLACEHOLDER_TOKEN",
};

export let inputs: Record<string, string> = {};

beforeEach(() => {
  inputs = structuredClone(defaultInputs);
  vi.mocked(core.getInput).mockImplementation(
    (name: string) => inputs[name] ?? "",
  );
  vi.mocked(core.getBooleanInput).mockImplementation(
    (name: string) => inputs[name] === "true",
  );
});
