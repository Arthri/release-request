# Test List
A list of steps for testing the workflow's features.

## Action fails on non-collaborator release requests

### Steps
1. Create a release request as a non-collaborator.

### Output
1. Workflow triggers.
1. Workflow fails.

## Action fails on release requests from another repository

### Steps
1. Fork repository, through an organization or another user.
1. Create release request.

### Output
1. Workflow triggers.
1. Workflow fails.

## Action succeeds on repository collaborator release requests

### Steps
1. Create a release request as a repository collaborator.

### Output
1. Workflow triggers.
1. Workflow succeeds.

## Action succeeds on repository owner release requests

### Steps
1. Create a release request as the repository owner.

### Output
1. Workflow triggers.
1. Workflow succeeds.

## Action fails on release requests with invalid titles

### Steps
1. Create a release request with an invalid title, such as `Re v1.2.3`.

### Output
1. Workflow triggers.
1. Workflow fails.

## Action succeeds on release requests with valid titles

### Steps
1. Create a release requests with the titles,
    - `Release v1.2 | Performance`.
    - `Prerelease v1.2.3.4`.
1. Create a release request with the title `Release v1.2.3-alpha | Production Release` and with contents describing the release's changes.

### Output
1. Workflow triggers on all release requests.
1. Workflow succeeds in all release requests.

## Action short-circuits when release request is closed but not merged

### Steps
1. Close one of the release requests created earlier.

### Output
1. Workflow triggers.
1. Workflow short-circuits.

## Action creates release when release request is merged

### Steps
1. Merge one of the release requests created earlier.

### Output
1. Workflow triggers.
1. New release is created.

## Action creates prerelease when prerelease request is merged

### Steps
1. Merge one of the prerelease requests created earlier.

### Output
1. Workflow triggers.
1. New prerelease is created.

## Action creates release in correct format

### Steps
1. Merge a release request with a body, or find a merged release request with a body.

### Outputs
1. A release request in the correct format. The release tag should be correct, everything after `|` should be the release's title, and the release's notes should match the release request's contents.
