#!/bin/bash

# Ensure we are in the right directory
cd "$(dirname "$0")"

# Configure the target GitHub username and repository name
GITHUB_USERNAME="MohitPipaliya1"
REPO_NAME="The-World-of-Mohit-"

# 1. Initialize git if not already initialized
if [ ! -d ".git" ]; then
    echo "Initializing new Git repository..."
    git init
fi

# 2. Add all files
echo "Adding files to Git..."
git add .

# 3. Commit the changes
echo "Committing changes..."
git commit -m "Uploading entire portfolio updates"

# 4. Handle the remote connection
echo "Checking remote configuration..."
CURRENT_REMOTE=$(git remote -v | grep origin | head -n 1)

if [[ -z "$CURRENT_REMOTE" ]]; then
    # No remote set, add the new one
    echo "Adding remote origin..."
    git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
else
    # Update the existing remote to ensure it points to MohitPipaliya1
    echo "Updating remote origin..."
    git remote set-url origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
fi

# 5. Push to GitHub
echo "Pushing to GitHub..."
echo "Note: If this is your first time, you may be prompted to log in to GitHub."
git branch -M main
git push -u origin main

echo "Done! If the push succeeded, your portfolio is now on GitHub."
