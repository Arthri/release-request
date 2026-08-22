import { run } from "../src/index";
import { expect, it, vi } from "vitest";
import { messages } from "./fixtures/logging";
import { context } from "./fixtures/context";
import { octokit } from "./fixtures/octokit";
import { payload } from "./fixtures/payload";

it("should fail on non-pull request events", async () => {
  messages.push({
    level: "error",
    content: "Release requests must be triggered by pull request events.",
  });
  context.eventName = "push";
  await run();
});

it("should do nothing on closed pull requests", async () => {
  messages.push({
    level: "info",
    content: "Pull request is closed. Nothing to do.",
  });
  const restSpy = vi.spyOn(octokit, "rest", "get");
  payload.pull_request.state = "closed";
  payload.action = "edited";
  await run();
  expect(restSpy).toHaveBeenCalledTimes(0);
});

it.for([
  // ["COLLABORATOR", true],
  // ["OWNER", true],
  ["CONTRIBUTOR", false],
  ["FIRST_TIMER", false],
  ["FIRST_TIME_CONTRIBUTOR", false],
  ["MANNEQUIN", false],
  ["MEMBER", false],
  ["NONE", false],
] as const)(
  "should only allow release requests from owners and collaborators",
  async ([association, successful]) => {
    payload.pull_request.author_association = association;
    if (successful) {
      throw new Error("todo");
    } else {
      messages.push({
        level: "error",
        content:
          "Only collaborators or the repository owner may create release requests.",
      });
      await run();
    }
  },
);
