# release_request
A reusable workflow that introduces a new type of pull requests, "Release Requests", which create a new release when merged.

## Installation
Add a new workflow under `.github/workflows/` with the following contents.
```yml
name: Release Request
run-name: Release Request

on:
  pull_request:
    types:
      - closed
      - edited
      - labeled
      - opened
      - unlabeled
    branches:
      - release/**

jobs:
  handle_release_request:
    name: ${{ github.event.action == 'closed' && 'Resolve ' || 'Verify ' }}Release Request
    permissions:
      contents: write
    uses: Arthri/release_request/.github/workflows/release_request.yml@v1

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

https://regex101.com/r/2H2iOA/ can be used to determine if a title is valid.

Release requests' contents do not currently have a format. Any format is valid.

## Usage
1. Create a new pull request with a valid title to any branch that begins with `release/`.
1. Label the pull request with "release".
1. Merge pull request.
1. Expect workflow to run and a new release to be created.

### Custom Branches
The default template sets the release request branches to `release/**`. A different branch glob can be specified, and more than one branch can also be specified.

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
  handle_release_request:
    name: ${{ github.event.action == 'closed' && 'Resolve ' || 'Verify ' }}Release Request
    permissions:
      contents: write
    uses: Arthri/release_request/.github/workflows/release_request.yml
    with:
      make_latest: true
```

### Discussion Name
The workflow can be configured to create a discussion when publishing a release, the workflow does not create a discussion by default but GitHub's default is creating a discussion in the `announcements` category.
```yml
jobs:
  handle_release_request:
    name: ${{ github.event.action == 'closed' && 'Resolve ' || 'Verify ' }}Release Request
    permissions:
      contents: write
    uses: Arthri/release_request/.github/workflows/release_request.yml
    with:
      discussion_category_name: announcements
```

### Generate Release Notes
The workflow does not allow GitHub to generate release notes for empty release names or notes by default. However, the workflow can be configured to allow GitHub to do so.
```yml
jobs:
  handle_release_request:
    name: ${{ github.event.action == 'closed' && 'Resolve ' || 'Verify ' }}Release Request
    permissions:
      contents: write
    uses: Arthri/release_request/.github/workflows/release_request.yml
    with:
      generate_release_notes: true
```

### Publish Instead of Draft
By default, the workflow drafts releases rather than outright publishing them to allow users to review the release before publishing, but also as a simple bypass to `$GITHUB_TOKEN` not being able to trigger other workflows. The behavior can be changed.
```yml
jobs:
  handle_release_request:
    name: ${{ github.event.action == 'closed' && 'Resolve ' || 'Verify ' }}Release Request
    permissions:
      contents: write
    uses: Arthri/release_request/.github/workflows/release_request.yml
    with:
      draft: false
```

### Custom Release Request Label
Only pull requests with the labeled with `release` are considered release requests. The label can be changed, but only one label can be specified.
```yml
jobs:
  handle_release_request:
    name: ${{ github.event.action == 'closed' && 'Resolve ' || 'Verify ' }}Release Request
    permissions:
      contents: write
    uses: Arthri/release_request/.github/workflows/release_request.yml
    with:
      release_request_label: custom_label
```

### Limitations
- Release requests cannot be made from another repository.
- Release requests must be created by the repository's owner or collaborators.
- The release request title format is not configurable.
