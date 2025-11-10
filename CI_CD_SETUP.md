# CI/CD Setup Guide for Faleproxy

## Overview
This project uses GitHub Actions for CI/CD with automatic deployment to Vercel.

## Workflow Behavior
- **All branches**: Run tests
- **Main branch**: Deploy to production when tests pass
- **Feature branches**: Deploy to preview when tests pass
- **Failed tests**: No deployment occurs

## Required GitHub Secrets
You need to configure the following secrets in your GitHub repository settings at:
`https://github.com/YOUR_USERNAME/faleproxy/settings/secrets/actions`

### 1. VERCEL_TOKEN
1. Go to https://vercel.com/account/tokens
2. Create a new token
3. Copy the token and add it as a GitHub secret

### 2. VERCEL_ORG_ID
1. Go to https://vercel.com/account
2. Find your Org ID (usually your username or team ID)
3. Add it as a GitHub secret

### 3. VERCEL_PROJECT_ID
1. Link your project to Vercel first (if not already done):
   ```bash
   npx vercel link
   ```
2. Find the project ID in `.vercel/project.json` after linking
3. Add it as a GitHub secret

## GitHub Actions Setup
1. Enable GitHub Actions for your forked repository:
   - Go to `https://github.com/YOUR_USERNAME/faleproxy/actions`
   - Click "I understand my workflows, go ahead and enable them"

## Testing the Pipeline

### 1. Feature Branch Workflow
```bash
# Create a feature branch
git checkout -b feature/test-ci

# Make a change
echo "// Test comment" >> app.js

# Commit and push
git add .
git commit -m "Test CI/CD pipeline"
git push origin feature/test-ci
```

This should:
- Run tests
- Deploy to Vercel preview URL (if tests pass)

### 2. Main Branch Workflow
```bash
# Switch to main
git checkout main

# Merge your feature
git merge feature/test-ci

# Push to main
git push origin main
```

This should:
- Run tests
- Deploy to Vercel production URL (if tests pass)

## Verifying Deployment

### Check GitHub Actions
- Go to the Actions tab in your repository
- You should see the workflow running
- Green checkmark = success
- Red X = failure (check logs)

### Check Vercel Dashboard
- Go to https://vercel.com/dashboard
- Find your project
- Check deployments:
  - Production deployments from main branch
  - Preview deployments from feature branches

## Troubleshooting

### Tests Failing
- Run `npm test` locally to debug
- Check the test output in GitHub Actions logs

### Deployment Failing
- Verify all secrets are correctly set
- Check Vercel dashboard for deployment errors
- Ensure your Vercel account has the project

### Secrets Not Working
- Double-check secret names match exactly
- Regenerate tokens if needed
- Ensure no extra spaces in secret values

## HW9 Submission Notes
If your HW8 submission didn't include a proper commit link, add this note to your HW9 submission:

```
HW8 Update: The GitHub link to the failed test commit is:
https://github.com/YOUR_USERNAME/faleproxy/commit/YOUR_COMMIT_HASH
```

Replace YOUR_USERNAME and YOUR_COMMIT_HASH with your actual values.
