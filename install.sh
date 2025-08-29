#!/bin/bash

# Obsidian AI Assistant Installation Script
# This script helps install the plugin manually

echo "🤖 Installing Obsidian AI Assistant..."

# Check if Obsidian is installed
if ! command -v obsidian &> /dev/null
then
    echo "❌ Obsidian is not installed. Please install Obsidian first."
    exit 1
fi

# Get the user's home directory
HOME_DIR=$(eval echo ~${SUDO_USER})
OBSIDIAN_PLUGINS_DIR="$HOME_DIR/.obsidian/plugins"

# Create plugins directory if it doesn't exist
if [ ! -d "$OBSIDIAN_PLUGINS_DIR" ]; then
    echo "📁 Creating Obsidian plugins directory..."
    mkdir -p "$OBSIDIAN_PLUGINS_DIR"
fi

# Create plugin directory
PLUGIN_DIR="$OBSIDIAN_PLUGINS_DIR/ai-assistant"
echo "📁 Creating plugin directory..."
mkdir -p "$PLUGIN_DIR"

# Copy files to plugin directory
echo "📋 Copying plugin files..."
cp main.js "$PLUGIN_DIR/"
cp manifest.json "$PLUGIN_DIR/"
cp styles.css "$PLUGIN_DIR/"

# Check if files were copied successfully
if [ -f "$PLUGIN_DIR/main.js" ] && [ -f "$PLUGIN_DIR/manifest.json" ] && [ -f "$PLUGIN_DIR/styles.css" ]; then
    echo "✅ Plugin installed successfully!"
    echo "📝 Next steps:"
    echo "   1. Open Obsidian"
    echo "   2. Go to Settings → Community Plugins"
    echo "   3. Enable 'AI Assistant' plugin"
    echo "   4. Configure your AI providers in the plugin settings"
    echo ""
    echo "🌟 Enjoy your AI-powered productivity boost!"
else
    echo "❌ Installation failed. Please check the files and try again."
    exit 1
fi