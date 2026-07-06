import * as github from "@actions/github";
import { PullRequestEvent } from "@octokit/webhooks-types";
import { Config, getConfig } from "./config.js";
import { getOctokit } from "@actions/github";

export type Context = {
  config: Config;
  event: PullRequestEvent;
  octokit: ReturnType<typeof getOctokit>;

  shouldCreateRelease: boolean;

  error: (message: string) => Promise<never>;
};

export function getContext(): Context {
  const config = getConfig();
  const event = github.context.payload as PullRequestEvent;
  const octokit = github.getOctokit(config.token);
  return {
    config: config,
    event: event,
    octokit: octokit,

    shouldCreateRelease: event.action === "closed" && event.pull_request.merged,

    error: async (message: string) => {
      await octokit.rest.issues.createComment({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: event.pull_request.number,
        body: message,
      });
      throw new Error(message);
    },
  };
}
