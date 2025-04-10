#!/bin/bash

# Quick GitHub Push Script for TitaniumManager

# Add all files
git add .

# Prompt for commit message
echo "Enter commit message (or press Enter for default message):"
read MESSAGE
MESSAGE=${MESSAGE:-"Update TitaniumManager"}

# Commit changes
git commit -m "$MESSAGE"

# Push to GitHub
git push

echo "Changes pushed to GitHub!" 