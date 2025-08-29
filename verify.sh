#!/bin/bash

# Verification script for Obsidian AI Assistant installation

echo "=== Obsidian AI Assistant Installation Verification ==="
echo

# Check if plugin files exist
PLUGIN_DIR="/home/windowslinux/MEGA/Phd_life_All/PhD_life/.obsidian/plugins/ai-assistant"

echo "Checking plugin files in: $PLUGIN_DIR"
echo

if [ -d "$PLUGIN_DIR" ]; then
    echo "✓ Plugin directory exists"
    
    # Check required files
    REQUIRED_FILES=("main.js" "manifest.json" "styles.css")
    ALL_FILES_PRESENT=true
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$PLUGIN_DIR/$file" ]; then
            echo "✓ $file found"
        else
            echo "✗ $file missing"
            ALL_FILES_PRESENT=false
        fi
    done
    
    if [ "$ALL_FILES_PRESENT" = true ]; then
        echo
        echo "✅ Plugin installation successful!"
        echo
        echo "Next steps:"
        echo "1. Open Obsidian (or restart if already open)"
        echo "2. Go to Settings → Community Plugins"
        echo "3. Enable 'AI Assistant' plugin"
        echo "4. Click the AI Assistant icon in the left ribbon to start using it"
        echo
        echo "🎉 You're ready to boost your productivity with AI!"
    else
        echo
        echo "❌ Plugin installation incomplete"
        echo "Please reinstall the plugin files"
    fi
else
    echo "✗ Plugin directory not found"
    echo "Please run the installation script or manually copy files"
fi