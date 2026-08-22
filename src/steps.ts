import * as core from "@actions/core";
import * as github from "@actions/github";
import { Context } from "./context.js";

export async function shouldRun(context: Context) {
  const pullRequest = context.event.pull_request;
  // If pull request is closed and the current action isn't merging the pull request, then do nothing.
  if (
    pullRequest.state === "closed" &&
    !(context.event.action === "closed" && context.event.pull_request.merged)
  ) {
    core.info("Pull request is closed. Nothing to do.");
    return false;
  } else if (
    !pullRequest.labels.some(
      (l) => l.name === context.config.releaseRequestLabel,
    )
  ) {
    core.info("Pull request is not a release request. Nothing to do.");
    return false;
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
  } else {
    return true;
  }
}

type ReleaseInformation = {
  tag: string;
  title?: string;
  isPrerelease: boolean;
};
/**
 * Extracts the release tag and the optional release title from the pull request title.
 */
export async function extract(context: Context): Promise<ReleaseInformation> {
  const title = context.event.pull_request.title;
  const match = title.match(
    /^(?:Prer|R)elease (v[0-9]+(?:\.[0-9]+){1,3}(?:-[a-zA-Z0-9_]+)?)(?: \| (.+))?$/,
  );
  const isPrerelease = title.startsWith("Pre");
  if (match === null) {
    await context.error(
      "The release request's title is not in the correct format.",
    );
    throw new Error("Unreachable.");
  }
  const [, tag, name] = match;
  core.setOutput("release-tag", tag);
  core.setOutput("release-title", name);
  core.setOutput("is-prerelease", isPrerelease);
  return { tag, title, isPrerelease };
}

export async function getDraftReleaseID(
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
    return null;
  } else if (status === 200) {
    if (response.data.draft) {
      return response.data.id;
    } else {
      await context.error(
        `A release for the tag ${releaseInformation.tag} already exists.`,
      );
      throw new Error("Unreachable");
    }
  } else {
    throw new Error(`Unexpected status code ${status}`);
  }
}
