import * as core from "@actions/core";

export type Config = {
  discussionCategoryName: string;
  draft: boolean;
  generateReleaseNotes: boolean;
  makeLatest?: "legacy" | "false" | "true";
  releaseRequestLabel: string;
  token: string;
};

function getMakeLatest() {
  const makeLatest = core.getInput("make-latest");
  if (
    makeLatest !== "legacy" &&
    makeLatest !== "true" &&
    makeLatest !== "false" &&
    makeLatest !== undefined
  ) {
    throw new Error("Invalid value for make-latest input.");
  }
  return makeLatest ?? "legacy";
}

export function getConfig(): Config {
  return {
    discussionCategoryName: core.getInput("discussion-category-name") ?? "",
    draft: core.getBooleanInput("draft") ?? true,
    generateReleaseNotes:
      core.getBooleanInput("generate-release-notes") ?? false,
    makeLatest: getMakeLatest(),
    releaseRequestLabel: core.getInput("release-request-label") ?? "release",
    token: core.getInput("token", { required: true }),
  };
}
