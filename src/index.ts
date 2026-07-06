import * as core from "@actions/core";
import * as github from "@actions/github";
import { PullRequestEvent } from "@octokit/webhooks-types";
import { getConfig } from "./config.js";
import { Context } from "./context.js";

async function shouldRun(context: Context) {
  const pullRequest = context.event.pull_request;
  // If pull request is closed and the current action isn't merging the pull request, then do nothing.
  if (pullRequest.state === "closed" && context.shouldCreateRelease) {
    core.info("Pull request is closed. Nothing to do.");
  } else if (
    !pullRequest.labels.some(
      (l) => l.name === context.config.releaseRequestLabel,
    )
  ) {
    core.info("Pull request is not a release request. Nothing to do.");
  } else if (
    pullRequest.author_association !== "OWNER" &&
    pullRequest.author_association !== "COLLABORATOR"
  ) {
    await context.error(
      "Only collaborators or the repository owner may create release requests.",
    );
    throw new Error("Unreachable");
  } else if (
    pullRequest.head.repo !== undefined &&
    pullRequest.head.repo !== null &&
    pullRequest.base.repo.id !== pullRequest.head.repo.id
  ) {
    await context.error(
      "Release requests' head branches must be in the same repository as the base branches.",
    );
    throw new Error("Unreachable");
  }

  return true;
}

type ReleaseInformation = { tag: string; title?: string };
/**
 * Extracts the release tag and the optional release title from the pull request title.
 */
async function extract(context: Context): Promise<ReleaseInformation> {
  const match = context.event.pull_request.title.match(
    /^(?:Prer|R)elease (v[0-9]+(?:\.[0-9]+){1,3}(?:-[a-zA-Z0-9_]+)?)(?: \| (.+))?$/,
  );
  if (match === null) {
    await context.error(
      "The release request's title is not in the correct format.",
    );
    throw new Error("Unreachable.");
  }
  const [, tag, title] = match;
  core.setOutput("release-tag", tag);
  core.setOutput("release-title", title);
  return { tag, title };
}

async function checkReleaseStatus(
  context: Context,
  releaseInformation: ReleaseInformation,
) {
  const response = await context.octokit.rest.repos.getReleaseByTag({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    tag: releaseInformation.tag,
  });
  const status = response.status as number;

  if (status === 404) {
    return true;
  }

  if (status === 200) {
    context.error(
      `A release for the tag ${releaseInformation.tag} already exists.`,
    );
    throw new Error("Unreachable");
  } else {
    throw new Error(`Unexpected status code ${status}`);
  }
}

export async function run() {
  try {
    if (github.context.eventName !== "pull_request") {
      core.setFailed(
        "Release requests must be triggered by pull request events.",
      );
      return;
    }

    const config = getConfig();
    const event = github.context.payload as PullRequestEvent;
    const octokit = github.getOctokit(config.token);
    const context: Context = {
      config: config,
      event: event,
      octokit: octokit,

      shouldCreateRelease:
        event.action === "closed" && event.pull_request.merged,

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

    if (await shouldRun(context)) {
      const releaseInformation = await extract(context);
      if (
        (await checkReleaseStatus(context, releaseInformation)) &&
        context.shouldCreateRelease
      ) {
        await context.octokit.rest.repos.createRelease({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          tag_name: releaseInformation.tag,
          target_commitish: context.event.pull_request.base.ref,
          name: releaseInformation.title,
          body: context.event.pull_request.body ?? undefined,
          discussion_category_name: context.config.discussionCategoryName,
          draft: context.config.draft,
          generate_release_notes: context.config.generateReleaseNotes,
          prerelease: context.event.pull_request.title.startsWith("Pre"),
          make_latest: context.config.makeLatest,
        });
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error);
    } else {
      core.setFailed("Fatal error.");
    }
  }
}
