#!/bin/bash

# GitHub Update Script for Titanium Manager
# This script helps commit and push changes to your GitHub repository

# Text styling
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Banner
echo -e "${BOLD}${BLUE}"
echo "============================================="
echo "   Titanium Manager GitHub Update Script"
echo "============================================="
echo -e "${NC}"

# Check if Git is initialized
if [ ! -d ".git" ]; then
  echo -e "${RED}Error: Git repository not initialized.${NC}"
  echo "Run 'git init' and 'github-setup.sh' first."
  exit 1
fi

# Check if remote exists
if ! git remote -v | grep -q "origin"; then
  echo -e "${RED}Error: No remote repository configured.${NC}"
  echo "Run 'github-setup.sh' first to configure your GitHub repository."
  exit 1
fi

# Ask for commit message
echo -e "${BOLD}Enter a commit message:${NC}"
read COMMIT_MESSAGE

if [ -z "$COMMIT_MESSAGE" ]; then
  COMMIT_MESSAGE="Update Titanium Manager"
  echo -e "${YELLOW}Using default commit message: '$COMMIT_MESSAGE'${NC}"
fi

# Show status
echo -e "${BLUE}Current Git Status:${NC}"
git status

# Confirm commit
echo -e "${YELLOW}"
echo "The above files will be committed and pushed to GitHub."
echo -e "${BOLD}Do you want to continue? (y/n)${NC}"
read CONFIRM

if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
  echo -e "${RED}Operation cancelled.${NC}"
  exit 0
fi

# Add all changes
echo -e "${BLUE}Adding files to Git...${NC}"
git add .

# Commit the files
echo -e "${BLUE}Committing files...${NC}"
git commit -m "$COMMIT_MESSAGE"

# Pull any changes from remote
echo -e "${BLUE}Pulling latest changes from GitHub...${NC}"
git pull

# Push to GitHub
echo -e "${BLUE}Pushing to GitHub...${NC}"
if git push; then
  echo -e "${GREEN}${BOLD}Update Complete!${NC}"
  echo -e "Your changes have been pushed to GitHub."
else
  echo -e "${RED}Failed to push to GitHub.${NC}"
  echo "You may need to run 'github-setup.sh' again to configure your credentials."
fi 