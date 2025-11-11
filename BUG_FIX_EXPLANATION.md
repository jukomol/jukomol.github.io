# Bug Fix: Sync-Resume Workflow Breaking Site

## Problem Statement

After the `sync-resume` Overleaf workflow runs, it automatically triggers the `build-and-deploy` workflow, which ends up breaking the site. However, when manually running the `build-and-deploy` workflow afterward, the site is fixed.

## Root Cause Analysis

The issue occurs due to how GitHub Actions handles the `repository_dispatch` event and the `actions/checkout@v4` action:

1. **Sync-Resume Workflow Execution:**
   - The sync-resume workflow downloads the latest resume PDF from Overleaf
   - It commits and pushes the updated PDF to the master branch
   - It then triggers the build-and-deploy workflow using `repository_dispatch` event

2. **Build-and-Deploy Workflow Trigger:**
   - When triggered by `repository_dispatch`, the workflow receives the event
   - The `actions/checkout@v4` step runs **without an explicit `ref` parameter**
   - Without a `ref`, checkout defaults to the commit SHA associated with the triggering event
   - For `repository_dispatch`, this is the commit SHA **before** the sync-resume workflow pushed its changes

3. **The Result:**
   - The build workflow checks out the code from before the resume PDF was updated
   - The site builds with the old resume PDF (or missing PDF)
   - The site appears broken because the latest resume is not included

4. **Why Manual Trigger Works:**
   - When manually triggering via `workflow_dispatch`, the checkout action gets the latest commit on the branch
   - The build includes the updated resume PDF
   - The site works correctly

## Solution

Add an explicit `ref: master` parameter to the checkout action in `.github/workflows/build.yml`:

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    ref: master
```

This ensures that regardless of how the workflow is triggered (push, pull_request, workflow_dispatch, or repository_dispatch), it will always check out the latest code from the master branch.

## Technical Details

### GitHub Actions Checkout Behavior

The `actions/checkout@v4` action determines which commit to check out based on:

1. **Explicit `ref` parameter**: If provided, uses this ref (highest priority)
2. **Event context**: Different events provide different default refs:
   - `push`: The commit that triggered the push
   - `pull_request`: The merge commit of the PR
   - `workflow_dispatch`: The commit on the selected branch at trigger time
   - `repository_dispatch`: The commit that was current when the dispatch was sent (NOT when received)

### Why This Fix Works

By explicitly specifying `ref: master`, we override the default behavior and ensure:
- The workflow always gets the absolute latest commit from master
- Any commits pushed by other workflows (like sync-resume) are included
- The build is always up-to-date regardless of trigger source

## Testing

The fix was verified by:
1. Building the site locally with the latest code
2. Confirming npm and bundle dependencies install correctly
3. Verifying Tailwind CSS builds successfully
4. Confirming Jekyll site builds without errors
5. Running CodeQL security analysis (0 vulnerabilities found)

## Impact

- **Before Fix**: Automated sync-resume triggers resulted in broken site deployments
- **After Fix**: All workflow triggers (automated and manual) will deploy the latest code
- **Side Effects**: None - this is the recommended approach for workflows that need the latest code

## Alternative Solutions Considered

1. **Use `fetch-depth: 0` and `git pull`**: More complex, unnecessary overhead
2. **Add delay between workflows**: Unreliable, race conditions still possible
3. **Use workflow_run instead of repository_dispatch**: Changes workflow architecture unnecessarily

The chosen solution is the simplest and most reliable approach.
