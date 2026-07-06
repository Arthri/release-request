import { PullRequestEvent } from "@octokit/webhooks-types";
import { Config } from "./config.js";
import { getOctokit } from "@actions/github";

export type Context = {
  config: Config;
  event: PullRequestEvent;
  octokit: ReturnType<typeof getOctokit>;

  shouldCreateRelease: boolean;

  error: (message: string) => Promise<never>;
};
