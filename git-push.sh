#!/bin/bash

# Git Auto Push Script for Soccer Management System
# Usage: ./git-push.sh "commit message"

echo "🚀 Soccer Management System - Git Push Automation"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if commit message is provided
if [ -z "$1" ]; then
    COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "${YELLOW}No commit message provided. Using default: ${COMMIT_MSG}${NC}"
else
    COMMIT_MSG="$1"
fi

# Function to check command status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1 successful${NC}"
    else
        echo -e "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# Navigate to project root
cd /Users/lucamambelli/Desktop/soccer-management-system

echo "📁 Working directory: $(pwd)"
echo ""

# Check current branch
BRANCH=$(git branch --show-current)
echo "🌿 Current branch: $BRANCH"
echo ""

# Show git status
echo "📊 Git Status:"
git status --short
echo ""

# Add all changes
echo "📝 Adding all changes..."
git add .
check_status "Git add"
echo ""

# Commit changes
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"
check_status "Git commit"
echo ""

# Set upstream if not set
echo "🔧 Checking remote configuration..."
git remote -v
echo ""

# Pull latest changes (to avoid conflicts)
echo "⬇️ Pulling latest changes..."
git pull origin $BRANCH --rebase
check_status "Git pull"
echo ""

# Push to GitHub
echo "⬆️ Pushing to GitHub..."
git push origin $BRANCH
check_status "Git push"
echo ""

# Show latest commit
echo "📝 Latest commit:"
git log --oneline -1
echo ""

echo -e "${GREEN}✅ Successfully pushed to GitHub!${NC}"
echo "🔗 Repository: https://github.com/241luca/soccer-management-system"
echo ""

# Optional: Open GitHub in browser
read -p "Open GitHub in browser? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "https://github.com/241luca/soccer-management-system"
fi
