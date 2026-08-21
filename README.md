# release-request
A workflow action which introduces and handles the creation and execution of "release requests," a type of pull requests associated with GitHub Releases.

## Installation
Add a new workflow under `.github/workflows/` with the following contents.
```yml
name: Release Request

on:
  pull_request:
    types:
      - closed
      - edited
      - labeled
      - opened
      - unlabeled
    branches:
      - dev

jobs:
  handle:
    permissions:
      contents: write
      pull-requests: write
    uses: Arthri/release-request/.github/workflows/i.yml@v3
```

Add the following pull request labels: `release`, `release:major`, `release:minor`, `release:patch`, and `release:prerelease`. A shell script for creating the labels using the GitHub CLI is provided below.
```sh
gh label create 'release:major' -c '#D93F0B' -d 'Requests for new major releases containing breaking changes, new features, and/or bugfixes'
gh label create 'release:minor' -c '#0E8A16' -d 'Requests for new minor releases containing new features and/or bugfixes'
gh label create 'release:patch' -c '#1D76DB' -d 'Requests for new patch releases containing bugfixes'
gh label create 'release:prerelease' -c '#D0E20C' -d 'Requests for new prereleases'
gh label create 'release' -c '#5319e7' -d 'Requests for new releases'
```

## Release Request Format
The format for release requests' titles is `<Prer|R>elease vMajor.Minor[.Patch[.Build]][-suffix][ | Title]`. The following are all valid titles.
- `Release v1.2.3`.
- `Prerelease v1.2.4-alpha`.
- `Release v1.2.5 | Performance Update`.

The following are all invalid titles.
- `pReReLeAse v1.2` - Invalid capitalization.
- `release v1.2.4` - Invalid capitalization.
- `Release v1.2.3.4.5` - Too many version fields.

https://regex101.com/r/2H2iOA/4/unit-tests can be used to determine if a title is valid.

Release requests' contents do not currently have a format. Any format is valid.

## Usage
The intended usage pattern for release requests is as follows, listed step by step,
1. The release request is created by the user, with the version and type of release specified in the pull request title. The release must be tagged with the `release` label as well as the appropriate sublabel. The pull request body may contain anything. The pull request head branch is commonly `dev`, while the base branch is commonly `master`. Pull request templates for release requests are available in this repository in the `.github` folder.
1. The release workflow triggers and creates a draft GitHub release.
1. Optionally, the same workflow may also trigger other jobs for publishing to other platforms, such as NuGet. For the purposes of release requests, publishing to other platforms must succeed before the release request is undrafted and published. If publishing is not successful, users may still edit or push new changes to the pull request head branch to fix any issues with the repository. When publishing to all other platforms succeed, users can move to the next step. GitHub releases are effectively published last, in relation to all other platforms or registries.
1. The user merges the release request *before* publishing the draft release. The draft release is set to target the base branch by default, which would not contain the new commits before the release request is merged.

The new process introduced in v3 primarily aims to improve integration with immutable GitHub releases. The following benefits are noted,
- Problems with publishing to other platforms can still be fixed before publishing the GitHub release.
- Other jobs may modify the GitHub release draft such as to attach changelogs or artifacts before publishing. As of August 21, 2026, GitHub does not push events for creation and modification of draft releases, making it challenging for workflows to trigger on draft releases and modify them before the immutable release is published.

Only owners or collaborators of the repository may create release requests, and the head branch must be in the same repository: that is, release requests cannot be triggered by pull requests from forks.

### Custom Branches
The default template sets the release request head branch to `dev`. A different branch glob can be specified, and more than one branch can also be specified.

Here is an example of release requests triggering for branches `release/nuget` and `staging/**`.
```yml
on:
  pull_request:
    types:
      - closed
      - edited
      - labeled
      - opened
      - unlabeled
    branches:
      - release/nuget
      - staging/**
```

### Latest Release
By default, the latest release is set by comparing version numbers(`legacy`). The behavior can be changed to always set new releases as the latest(`true`) as well as never set new releases as the latest(`false`).

Here is an example of always setting new releases as the latest release.
```yml
jobs:
  handle:
    permissions:
      contents: write
      pull-requests: write
    uses: Arthri/release-request/.github/workflows/i.yml@v2
    with:
      make-latest: true
```

### Discussion Name
The workflow can be configured to create a discussion when publishing a release, the workflow does not create a discussion by default but GitHub's default is creating a discussion in the `announcements` category.
```yml
jobs:
  handle:
    permissions:
      contents: write
      pull-requests: write
    uses: Arthri/release-request/.github/workflows/i.yml@v2
    with:
      discussion-category-name: announcements
```

### Generate Release Notes
The workflow does not allow GitHub to generate release notes for empty release names or notes by default. However, the workflow can be configured to allow GitHub to do so.
```yml
jobs:
  handle:
    permissions:
      contents: write
      pull-requests: write
    uses: Arthri/release-request/.github/workflows/i.yml@v2
    with:
      generate-release-notes: true
```

### Custom Release Request Label
Only pull requests with the labeled with `release` are considered release requests. The label can be changed, but only one label can be specified.
```yml
jobs:
  handle:
    permissions:
      contents: write
      pull-requests: write
    uses: Arthri/release-request/.github/workflows/i.yml@v2
    with:
      release-request-label: custom-label
```
