import * as core from "@actions/core";
import * as github from "@actions/github";
import { afterEach, beforeEach, expect, vi } from "vitest";
import { octokit } from "./octokit";
import { payload } from "./payload";

export type Message = {
  content: string;
  level: "error" | "warning" | "info" | "notice" | "debug";
  shouldComment?: boolean;
};

export let messages: Message[] = [];

beforeEach(({ annotate }) => {
  messages = [];

  vi.spyOn(core, "setFailed").mockImplementation((message) =>
    annotate(`ERR: ${message}`, "error"),
  );
  vi.spyOn(core, "warning").mockImplementation((message) =>
    annotate(`WRN: ${message}`, "warning"),
  );
  vi.spyOn(core, "info").mockImplementation((message) =>
    annotate(`INF: ${message}`, "info"),
  );
  vi.spyOn(core, "notice").mockImplementation((message) =>
    annotate(`NOT: ${message}`, "notice"),
  );
  vi.spyOn(core, "debug").mockImplementation((message) =>
    annotate(`DBG: ${message}`, "debug"),
  );
  vi.spyOn(octokit.rest.issues, "createComment").mockImplementation((params) =>
    annotate(
      `COMMENT on ${params?.owner}/${params?.repo}#${params?.issue_number}: ${params?.body}`,
    ),
  );
});

afterEach(() => {
  const levelsCount: Record<string, number> = {};
  let commentCount = 0;
  for (const message of messages) {
    const callCount = (levelsCount[message.level] =
      (levelsCount[message.level] ?? 0) + 1);
    const loggingFunction = (function () {
      switch (message.level) {
        case "error":
          return vi.mocked(core.setFailed);
        case "warning":
          return vi.mocked(core.warning);
        case "info":
          return vi.mocked(core.info);
        case "notice":
          return vi.mocked(core.notice);
        case "debug":
          return vi.mocked(core.debug);
      }
    })();

    const argument =
      message.level === "error" ? new Error(message.content) : message.content;
    expect(loggingFunction).toHaveBeenNthCalledWith(callCount, argument);

    if (message.shouldComment) {
      expect(octokit.rest.issues.createComment).toHaveBeenNthCalledWith(
        ++commentCount,
        {
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          issue_number: payload.pull_request?.number,
          body: message.content,
        },
      );
    }
  }
});
