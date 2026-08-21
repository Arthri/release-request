import * as core from "@actions/core";
import * as github from "@actions/github";
import { getContext } from "./context.js";
import { getDraftReleaseID, extract, shouldRun } from "./steps.js";

export async function run() {
  try {
    if (github.context.eventName !== "pull_request") {
      core.setFailed(
        "Release requests must be triggered by pull request events.",
      );
      return;
    }

    const context = getContext();
    if (!(await shouldRun(context)) || !context.isMerge) {
      return;
    }

    const releaseInformation = await extract(context);
    const draftID = await getDraftReleaseID(context, releaseInformation);
    const commonParams = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      tag_name: releaseInformation.tag,
      target_commitish: context.event.pull_request.base.ref,
      name: releaseInformation.title,
      body: context.event.pull_request.body ?? undefined,
      discussion_category_name: context.config.discussionCategoryName,
      draft: true,
      prerelease: releaseInformation.isPrerelease,
      make_latest: context.config.makeLatest,
    };

    if (draftID !== null) {
      await context.octokit.rest.repos.updateRelease({
        ...commonParams,
        release_id: draftID,
      });
    } else {
      await context.octokit.rest.repos.createRelease({
        ...commonParams,
        generate_release_notes: context.config.generateReleaseNotes,
      });
    }

    core.setOutput("success", true);
  } catch (error) {
    core.setFailed(error instanceof Error ? error : "Fatal error.");
  }
}
