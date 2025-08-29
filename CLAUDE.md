# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Obsidian AI Assistant plugin that provides multi-provider AI capabilities directly within Obsidian. The plugin supports local AI models via Ollama and cloud-based AI providers (OpenAI, Anthropic, Gemini, Groq). It features a WhatsApp-style chat interface and productivity tools for research, summarization, content creation, auto-tagging, and finding related notes.

## Development Commands

### Build & Development
- `npm run dev` - Start development mode with file watching (rebuilds on changes)
- `npm run build` - Production build with TypeScript checking and linting
- `npm run lint` - Run ESLint on src/ directory
- `npm run lint:fix` - Run ESLint with automatic fixes
- `npm run clean` - Remove dist, build, and releases directories
- `npm run release` - Create a release package

### Testing
- `npm run test` - Currently returns exit 0 (no tests configured)
- `npm run test:watch` - Watch mode for tests (not implemented)

## Architecture Overview

### Core Components

**Main Plugin Class (`src/main.ts`)**
- `AIAssistantPlugin` extends Obsidian's `Plugin` class
- Manages plugin lifecycle (onload/onunload)
- Registers the AI Assistant view, commands, and ribbon icon
- Handles multiple commands for productivity features (summarize, research, create content, generate tags, find related notes)
- Uses a 500ms timeout pattern when opening views to ensure initialization

**AI Assistant View (`src/view.ts`)**
- `AIAssistantView` extends Obsidian's `ItemView`
- Main chat interface with WhatsApp-style UI
- Handles multi-provider AI communication (Ollama, OpenAI, Anthropic, Gemini, Groq)
- Features productivity action buttons and context management
- Uses `requestUrl` for all HTTP requests (Obsidian's built-in method)
- Implements markdown rendering for AI responses

**Settings System (`src/settings.ts` + `src/settings-tab.ts`)**
- Centralized configuration for API keys, model preferences, and parameters
- Default settings point to local Ollama instance at localhost:11434
- Temperature and maxTokens configuration for model behavior

### Key Design Patterns

**Multi-Provider AI Support**
- Provider selection via dropdown with emoji prefixes (🦙 Ollama, 🧠 OpenAI, etc.)
- Dynamic model population based on available providers and API keys
- Separate response handlers for each provider with error handling

**Productivity Features Integration**
- Each productivity feature (research, summarize, etc.) can be triggered from:
  - Action buttons in the chat interface
  - Obsidian commands (Cmd+P)
  - Ribbon icon access
- Features operate on the active note and inject results into chat history

**Context Management**
- Chat messages stored in `messages: Message[]` array
- Support for adding current note content to conversation context
- Clear context functionality to start fresh conversations

## Technical Details

### Build System
- Uses ESBuild for bundling (`esbuild.config.mjs`)
- TypeScript compilation with strict settings
- Development mode includes inline source maps and file watching
- Production build includes minification and tree shaking

### Code Quality
- Comprehensive ESLint configuration with TypeScript rules
- Strict TypeScript configuration with multiple checks enabled
- Complex function limits (max 50 lines, max 4 nested levels)

### AI Provider Integration Patterns
- All HTTP requests use Obsidian's `requestUrl` method
- Error handling includes provider-specific status code interpretation
- Request format differs by provider but follows consistent async/await pattern
- Groq includes special handling for preview models and rate limiting

### UI Architecture
- CSS classes prefixed with `ai-assistant-`
- Message rendering includes markdown support via custom `renderMarkdownContent`
- Typing indicators and timestamps for better UX
- Responsive textarea with auto-resize functionality

## Important Development Notes

### Obsidian-Specific Considerations
- External modules (obsidian, electron, @codemirror/*) are excluded from bundle
- Plugin must be compatible with Obsidian's security model
- Uses Obsidian's API methods (Notice, requestUrl, vault operations)
- Desktop-only plugin (`"isDesktopOnly": true` in manifest)

### AI Provider API Keys
- All API keys stored in settings with empty string defaults
- Provider availability checked via presence of API key
- Local Ollama doesn't require API key but needs service running

### Error Handling Strategy
- Try-catch blocks around all AI API calls
- User-friendly error messages in chat interface
- Provider-specific error interpretation (rate limits, auth errors, etc.)
- Graceful degradation when providers are unavailable

## Common Development Tasks

When adding new AI providers:
1. Add API key field to `AIAssistantSettings` interface
2. Update model selector in `populateModelSelector()`
3. Add new response handler method following existing pattern
4. Update `getAIResponse()` switch statement
5. Add provider-specific error handling

When modifying productivity features:
1. Update the corresponding method in `AIAssistantView`
2. Consider adding a new Obsidian command in `main.ts`
3. Test with the 500ms timeout pattern for view initialization
4. Ensure proper error handling and user feedback via `Notice`