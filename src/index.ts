import * as core from "@actions/core";
import * as github from "@actions/github";
import { getContext } from "./context.js";
import { checkReleaseStatus, extract, shouldRun } from "./steps.js";

export async function run() {
  try {
    if (github.context.eventName !== "pull_request") {
      core.setFailed(
        "Release requests must be triggered by pull request events.",
      );
      return;
    }

    const context = getContext();

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
