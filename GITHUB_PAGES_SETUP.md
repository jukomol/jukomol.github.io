# GitHub Pages Configuration Instructions

## Issue Summary

Your site is failing to load because GitHub Pages is configured to use the **classic deployment method** (Deploy from a branch), which only supports Jekyll 3.9.x. However, your site uses Jekyll 4.x, which requires **GitHub Actions** for deployment.

## Error Message

> "The github-pages gem can't satisfy your Gemfile's dependencies."

This error occurs when GitHub tries to build your site with the classic Pages method, which cannot satisfy Jekyll 4.x dependencies.

## Solution

You need to change your repository's Pages settings to use **GitHub Actions** instead of deploying from a branch.

### Step-by-Step Instructions

1. **Go to your repository on GitHub**: https://github.com/jukomol/site

2. **Navigate to Settings**:
   - Click on "Settings" tab at the top of the repository

3. **Go to Pages settings**:
   - In the left sidebar, click on "Pages" (under "Code and automation")

4. **Change the deployment source**:
   - Under "Build and deployment" section
   - Find the "Source" dropdown
   - **Change it from "Deploy from a branch" to "GitHub Actions"**
   - No need to save - it updates automatically

5. **Verify the workflow**:
   - The workflow `.github/workflows/build.yml` is already properly configured
   - Once you change the source to GitHub Actions, the next push will trigger a deployment

6. **Push or trigger a deployment**:
   - Either push a new commit to the `main` branch
   - Or go to Actions tab and manually run the "Build and Deploy" workflow

## What Was Changed in This PR

To help prevent this issue and make the configuration clearer:

1. **Added `.nojekyll` file**: This signals to GitHub Pages not to use Jekyll classic processing
2. **Updated Gemfile**: Added comments explaining why Jekyll 4.x is used
3. **Enhanced README**: Added troubleshooting section for this specific error
4. **Updated `_config.yml`**: Ensured `.nojekyll` is included in the build

## Verification

After changing the Pages source to "GitHub Actions":

1. Go to the **Actions** tab in your repository
2. You should see a "Build and Deploy" workflow running
3. Once it completes successfully, your site will be live at: https://jukomol.github.io

## Why This Happened

GitHub Pages has two deployment methods:

1. **Classic Method (Deploy from a branch)**:
   - GitHub automatically builds Jekyll sites
   - Only supports Jekyll 3.9.x
   - Limited plugin support
   - This was likely the default when you created the repository

2. **GitHub Actions**:
   - You control the build process
   - Supports any Jekyll version (including 4.x)
   - Full plugin support
   - This is the modern recommended approach

Your site uses Jekyll 4.x for modern features and better performance, so it requires GitHub Actions.

## Additional Notes

- The workflow is already configured correctly in `.github/workflows/build.yml`
- No code changes are needed beyond what's in this PR
- The site builds successfully locally and in GitHub Actions
- Once you change the Pages source setting, everything will work

## Still Having Issues?

If you've changed the Pages source to "GitHub Actions" and are still experiencing issues:

1. Check the Actions tab for workflow run logs
2. Ensure the workflow has permissions to deploy (already configured)
3. Make sure the `main` branch has the latest changes
4. Try manually triggering the workflow from the Actions tab

## References

- [GitHub Pages documentation](https://docs.github.com/en/pages)
- [Jekyll GitHub Actions deployment](https://jekyllrb.com/docs/continuous-integration/github-actions/)
- [GitHub Pages with custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-with-a-custom-github-actions-workflow)
