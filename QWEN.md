# Obsidian AI Assistant Plugin - Project Context

## Project Overview

This directory contains the Obsidian AI Assistant plugin, a productivity tool that integrates multiple AI models directly into Obsidian. The plugin allows users to leverage both local AI models (via Ollama) and cloud-based APIs (OpenAI, Anthropic, Google Gemini, Groq) for various knowledge management tasks.

The plugin transforms Obsidian into an AI-powered research and writing assistant with features including:
- AI chat interface with model selection
- Research assistance
- Note summarization
- Content creation from notes
- Auto-tagging of notes
- Related notes discovery

## Key Technologies

- **TypeScript**: Primary programming language
- **Obsidian Plugin API**: For integration with Obsidian
- **Node.js/npm**: Package management and build tools
- **esbuild**: Build system for compiling TypeScript to JavaScript
- **External AI APIs**: Integration with Ollama, OpenAI, Anthropic, Google Gemini, and Groq

## Project Structure

```
obsidian-ai-assistant/
├── src/                    # TypeScript source files
│   ├── main.ts            # Main plugin class
│   ├── settings.ts        # Plugin settings interface and defaults
│   ├── settings-tab.ts    # Settings tab UI
│   └── view.ts            # Main view with chat interface
├── releases/              # Packaged plugin releases
├── node_modules/          # npm dependencies
├── manifest.json          # Plugin manifest file
├── styles.css             # Plugin styling
├── package.json           # npm package configuration
├── tsconfig.json          # TypeScript configuration
├── esbuild.config.mjs     # Build configuration
└── README.md              # Project documentation
```

## Building and Running

### Development Setup
1. Install dependencies: `npm install`
2. Development build with watch: `npm run dev`

### Production Build
- Build for production: `npm run build`
- Create release package: `npm run release`

### Manual Installation in Obsidian
1. Build the plugin: `npm run build`
2. Copy `main.js`, `manifest.json`, and `styles.css` to your Obsidian vault's `.obsidian/plugins/ai-assistant/` directory
3. Enable the plugin in Obsidian's settings

## Development Conventions

- **TypeScript**: The project is written in TypeScript for type safety
- **Modular Architecture**: Code is organized into modules following Obsidian's plugin structure
- **API Integration**: Uses direct HTTP requests via Obsidian's `requestUrl` function for API calls
- **Error Handling**: Comprehensive error handling for network issues and API errors
- **Settings Management**: Centralized settings management through Obsidian's settings API

## Key Features

1. **Multi-Model Support**: Switch between local Ollama models and cloud APIs
2. **Productivity Tools**: Research assistant, summarization, content creation, auto-tagging, related notes finder
3. **Command Palette Integration**: All features accessible through Obsidian's command palette
4. **Ribbon Icon**: Quick access through Obsidian's sidebar
5. **Settings Panel**: Configuration for API keys and model preferences

## Documentation Files

- `README.md`: Main project documentation
- `DEVELOPMENT.md`: Development guide
- `INSTRUCTIONS.md`: Detailed usage instructions
- `SUMMARY.md`: Productivity impact analysis
- `CHANGELOG.md`: Version history
- `SHARE.md`: Community sharing guide
- `SUBMISSION.md`: Guide for submitting to Obsidian community plugins

## Future Improvements

The plugin is designed to be extensible with additional AI features and improved integration with Obsidian's ecosystem. Key areas for future development include:
- Enhanced natural language processing capabilities
- Improved note organization and linking suggestions
- Additional content creation workflows
- Better performance optimization for large vaults