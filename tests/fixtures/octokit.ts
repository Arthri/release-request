import * as github from "@actions/github";
import { GitHub } from "@actions/github/lib/utils";
import { beforeEach, vi } from "vitest";

export const octokit = vi.mockObject(new GitHub());
beforeEach(() => {
  vi.mocked(github.getOctokit).mockReturnValue(octokit);
});
