#!/bin/bash

# GitHub Setup Script for Titanium Manager
# This script helps configure your GitHub repository and push the code

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
echo "   Titanium Manager GitHub Setup Script"
echo "============================================="
echo -e "${NC}"

# Check if Git is already initialized
if [ ! -d ".git" ]; then
  echo -e "${RED}Error: Git repository not initialized.${NC}"
  echo "Run 'git init' first."
  exit 1
fi

# Ask for GitHub username
echo -e "${BOLD}Enter your GitHub username:${NC}"
read GITHUB_USERNAME

# Ask for repository name
echo -e "${BOLD}Enter the name for your GitHub repository:${NC}"
read REPO_NAME
echo ""

# Ask for GitHub personal access token
echo -e "${YELLOW}You will need a GitHub Personal Access Token with 'repo' permissions.${NC}"
echo "If you don't have one, create it at: https://github.com/settings/tokens"
echo -e "${BOLD}Enter your GitHub Personal Access Token:${NC}"
read -s GITHUB_TOKEN
echo ""

# Create repository
echo -e "${BLUE}Creating GitHub repository: ${REPO_NAME}...${NC}"

# Create the repository using GitHub API
RESPONSE=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{\"name\":\"$REPO_NAME\",\"description\":\"Titanium Manager: A secure password manager with hardware key integration\",\"private\":false}")

# Check if repository creation was successful
if [[ $RESPONSE == *"name\":\"$REPO_NAME"* ]]; then
  echo -e "${GREEN}Repository created successfully!${NC}"
else
  # Check if the repository already exists
  if [[ $RESPONSE == *"Repository creation failed"* ]] || [[ $RESPONSE == *"already exists"* ]]; then
    echo -e "${YELLOW}Repository may already exist, attempting to continue...${NC}"
  else
    echo -e "${RED}Failed to create repository. Error:${NC}"
    echo "$RESPONSE"
    echo ""
    echo -e "${YELLOW}Continuing with setup assuming repository exists...${NC}"
  fi
fi

# Configure git
echo -e "${BLUE}Configuring Git...${NC}"

# Create a URL with the token included
REPO_URL="https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/$GITHUB_USERNAME/$REPO_NAME.git"

# Add the remote
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

echo -e "${GREEN}Git configured successfully!${NC}"

# Add files to git
echo -e "${BLUE}Adding files to Git...${NC}"
git add .

# Commit the files
echo -e "${BLUE}Committing files...${NC}"
git commit -m "Initial commit of Titanium Manager"

# Push to GitHub
echo -e "${BLUE}Pushing to GitHub...${NC}"
git push -u origin master || git push -u origin main

# Store credentials in the .git-credentials file (alternatively to credential.helper store)
echo -e "${BLUE}Storing credentials...${NC}"
echo "https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com" > ~/.git-credentials
git config --global credential.helper store

echo -e "${GREEN}${BOLD}Setup Complete!${NC}"
echo -e "Your Titanium Manager code has been pushed to: ${BLUE}https://github.com/$GITHUB_USERNAME/$REPO_NAME${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: ~/.git-credentials now contains your GitHub token.${NC}"
echo -e "${YELLOW}For better security, consider setting up SSH keys for future GitHub interactions.${NC}" 