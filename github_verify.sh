#!/bin/bash

# GitHub Repository Verification Script
# This script helps verify the integrity and setup of the Obsidian AI Assistant repository

echo "=== GitHub Repository Verification ==="
echo

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

echo "✅ Git repository detected"
echo

# Check remote origin
echo "=== Remote Repository Check ==="
origin=$(git remote get-url origin 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Remote origin: $origin"
else
    echo "❌ No remote origin configured"
fi
echo

# Check branches
echo "=== Branch Check ==="
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "✅ Current branch: $current_branch"

branches=$(git branch -r | grep -v HEAD)
if [ -n "$branches" ]; then
    echo "✅ Remote branches found:"
    echo "$branches" | sed 's/^/  /'
else
    echo "⚠️  No remote branches found"
fi
echo

# Check for essential files
echo "=== Essential Files Check ==="
essential_files=(
    "README.md"
    "LICENSE"
    "package.json"
    "manifest.json"
    "src/main.ts"
    "src/view.ts"
    "src/settings.ts"
    "src/settings-tab.ts"
    "styles.css"
    ".gitignore"
    ".eslintrc.json"
)

missing_files=()
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file"
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -gt 0 ]; then
    echo
    echo "⚠️  Missing essential files:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
fi
echo

# Check for documentation files
echo "=== Documentation Files Check ==="
doc_files=(
    "CHANGELOG.md"
    "CONTRIBUTING.md"
    "CODE_OF_CONDUCT.md"
    "SECURITY.md"
    "DEVELOPMENT.md"
    "INSTRUCTIONS.md"
    "SUMMARY.md"
    "SHARE.md"
)

for file in "${doc_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file"
    fi
done
echo

# Check git status
echo "=== Git Status ==="
git_status=$(git status --porcelain)
if [ -z "$git_status" ]; then
    echo "✅ Working directory clean"
else
    echo "⚠️  Uncommitted changes:"
    echo "$git_status" | sed 's/^/  /'
fi
echo

# Check for GitHub-specific files
echo "=== GitHub Files Check ==="
github_files=(
    ".github/FUNDING.yml"
    ".github/ISSUE_TEMPLATE/bug_report.md"
    ".github/ISSUE_TEMPLATE/feature_request.md"
    ".github/PULL_REQUEST_TEMPLATE.md"
)

for file in "${github_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file"
    fi
done
echo

# Check Node.js and npm
echo "=== Environment Check ==="
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo "✅ Node.js: $node_version"
else
    echo "❌ Node.js not found"
fi

if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo "✅ npm: $npm_version"
else
    echo "❌ npm not found"
fi
echo

# Check package.json
if [ -f "package.json" ]; then
    echo "=== Package.json Check ==="
    name=$(grep -o '"name": "[^"]*"' package.json | cut -d'"' -f4)
    version=$(grep -o '"version": "[^"]*"' package.json | cut -d'"' -f4)
    echo "✅ Package name: $name"
    echo "✅ Package version: $version"
    
    # Check for essential scripts
    scripts=("dev" "build" "release" "lint" "test")
    echo "  Scripts:"
    for script in "${scripts[@]}"; do
        if grep -q "\"$script\":" package.json; then
            echo "  ✅ $script"
        else
            echo "  ❌ $script"
        fi
    done
fi
echo

echo "=== Verification Complete ==="
echo
echo "Next steps:"
echo "1. Ensure all essential files are present"
echo "2. Verify remote repository configuration"
echo "3. Check for uncommitted changes"
echo "4. Test the development environment with 'npm run dev'"