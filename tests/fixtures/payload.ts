import {
  PullRequest,
  PullRequestEvent,
  Repository,
} from "@octokit/webhooks-types";
import { beforeEach } from "vitest";
import * as github from "@actions/github";

const repositoryID = 636166346;
const pullRequestNumber = 1234;
export const defaultPayload: Readonly<Partial<PullRequestEvent>> = {
  action: "opened",
  number: pullRequestNumber,
  pull_request: {
    number: pullRequestNumber,
    title: "Release: v1.0.0",
    state: "open",
    merged: false,
    author_association: "OWNER",
    labels: [
      {
        id: 5464527766,
        node_id: "LA_kwDOJesgys8AAAABRbYTlg",
        url: "https://api.github.com/repos/Arthri/release-request/labels/release",
        name: "release",
        description: "Requests for new releases",
        color: "5319e7",
        default: false,
      },
      {
        id: 5464529137,
        node_id: "LA_kwDOJesgys8AAAABRbYY8Q",
        url: "https://api.github.com/repos/Arthri/release-request/labels/release:major",
        name: "release:major",
        description:
          "Requests for new major releases containing breaking changes, new features, and/or bugfixes",
        color: "D93F0B",
        default: false,
      },
    ],
    base: {
      ref: "master",
      repo: {
        id: repositoryID,
      } satisfies Partial<Repository> as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    } satisfies Partial<PullRequest["base"]> as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    head: {
      ref: "dev",
      repo: {
        id: repositoryID,
      } satisfies Partial<Repository> as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    } satisfies Partial<PullRequest["head"]> as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent eu nisi eget mi rutrum scelerisque. Nunc ultricies leo sit amet elit dictum, vitae pretium massa porta. Duis id tempor mi, a consectetur sapien. Sed imperdiet euismod neque, sit amet maximus leo luctus eget. Donec at semper nulla, id semper mauris. Quisque tristique, urna non blandit aliquet, tellus lectus fringilla dolor, vitae maximus nibh mi id nisl. Aenean urna mauris, tempor ut elit vel, mollis tempor arcu. Integer consectetur purus eros.",
  } satisfies Partial<PullRequest> as any, // eslint-disable-line @typescript-eslint/no-explicit-any
};

export let payload: PullRequestEvent =
  {} satisfies Partial<PullRequestEvent> as any; // eslint-disable-line @typescript-eslint/no-explicit-any

beforeEach(() => {
  payload = structuredClone(defaultPayload) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  github.context.payload = payload as any; // eslint-disable-line @typescript-eslint/no-explicit-any
});
