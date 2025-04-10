# GitHub Setup for Titanium Manager

This document provides instructions on how to use the provided Git scripts to manage your Titanium Manager repository on GitHub.

## Prerequisites

1. A GitHub account
2. A Personal Access Token (PAT) with 'repo' scope
   - Go to GitHub → Settings → Developer settings → Personal access tokens → Generate new token
   - Give it a name like "Titanium Manager" and select the "repo" scope
   - **Important**: Copy the token immediately as GitHub will only show it once

## Initial Setup

1. Run the GitHub setup script:
   ```
   ./github-setup.sh
   ```

2. The script will prompt you for:
   - Your GitHub username
   - A name for your repository
   - Your GitHub Personal Access Token (PAT)

3. The script will then:
   - Create a new repository on GitHub (if it doesn't exist)
   - Configure your local Git repository to use the GitHub repository
   - Commit all files and push them to GitHub
   - Store your credentials for future use

## Making Updates

1. After making changes to your code, run the update script:
   ```
   ./update-github.sh
   ```

2. The script will:
   - Show you the current status of files (changed, added, deleted)
   - Ask for a commit message
   - Commit your changes
   - Pull any changes from GitHub
   - Push your changes to GitHub

## Security Notes

- The scripts store your GitHub token in `~/.git-credentials`
- Never share this file with anyone
- Consider using SSH keys for better security in the long term
- The `.gitignore` file is configured to prevent accidentally committing sensitive files

## Manual Git Commands

If you prefer to use Git commands directly:

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Pull latest changes
git pull

# Push changes
git push
```

## Troubleshooting

If you encounter issues with authentication:

1. Check that your token is still valid (not expired)
2. Run `github-setup.sh` again to reconfigure with a new token
3. Ensure you have the correct permissions for your repository

For other Git-related issues, refer to the [GitHub documentation](https://docs.github.com/en/get-started/using-git/about-git). 