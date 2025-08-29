import { ItemView, WorkspaceLeaf, Notice, TFile, requestUrl } from 'obsidian';
import AIAssistantPlugin from './main';

export const VIEW_TYPE_AI_ASSISTANT = 'ai-assistant-view';

interface Message {
	role: 'user' | 'assistant';
	content: string;
}

export class AIAssistantView extends ItemView {
	plugin: AIAssistantPlugin;
	messages: Message[] = [];
	currentModel: string = '';
	currentProvider: string = '';
	isProcessing: boolean = false;

	constructor(leaf: WorkspaceLeaf, plugin: AIAssistantPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.currentModel = plugin.settings.defaultModel;
		this.currentProvider = plugin.settings.defaultModelProvider;
	}

	getViewType(): string {
		return VIEW_TYPE_AI_ASSISTANT;
	}

	getDisplayText(): string {
		return 'AI Assistant';
	}

	async onOpen() {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('ai-assistant-container');

		// Create chat interface
		const chatContainer = container.createDiv('ai-assistant-chat-container');

		// Header with title and export button
		const header = chatContainer.createDiv('ai-assistant-header');
		const titleDiv = header.createDiv('ai-assistant-title');
		titleDiv.createEl('span', { text: '🤖', cls: 'ai-assistant-title-icon' });
		titleDiv.createEl('span', { text: 'AI Assistant' });
		
		const exportButton = header.createEl('button', {
			text: 'Export Chat',
			cls: 'ai-assistant-export-button'
		});
		exportButton.addEventListener('click', async () => {
			await this.exportChatToNote();
		});

		// Model selector
		const modelSelectorContainer = chatContainer.createDiv('ai-assistant-model-selector');
		modelSelectorContainer.createEl('label', { text: 'Select Model' });
		const modelSelector = modelSelectorContainer.createEl('select');
		this.populateModelSelector(modelSelector);

		// Action buttons
		const actionButtonsContainer = chatContainer.createDiv('ai-assistant-actions');
		this.createActionButtons(actionButtonsContainer);

		// Context buttons
		const contextButtonsContainer = chatContainer.createDiv('ai-assistant-context-actions');
		this.createContextButtons(contextButtonsContainer);

		// Messages container
		const messagesContainer = chatContainer.createDiv('ai-assistant-messages');
		messagesContainer.id = 'ai-assistant-messages';

		// Input container
		const inputContainer = chatContainer.createDiv('ai-assistant-input-container');
		
		const input = inputContainer.createEl('textarea', {
			placeholder: 'Type your message here...\n(Use Shift+Enter for new line, Enter to send)',
			cls: 'ai-assistant-input'
		});
		
		const sendButton = inputContainer.createEl('button', {
			text: '➤',
			cls: 'ai-assistant-send-button'
		});

		// Auto-resize textarea
		input.addEventListener('input', () => {
			input.style.height = 'auto';
			input.style.height = Math.min(input.scrollHeight, 150) + 'px';
		});

		// Event listeners
		sendButton.addEventListener('click', async () => {
			if (input.value.trim() !== '' && !this.isProcessing) {
				sendButton.disabled = true;
				await this.sendMessage(input.value, messagesContainer);
				input.value = '';
				input.style.height = 'auto';
				sendButton.disabled = false;
			}
		});

		input.addEventListener('keydown', async (e) => {
			if (e.key === 'Enter' && !e.shiftKey) {
				e.preventDefault();
				if (input.value.trim() !== '' && !this.isProcessing) {
					sendButton.disabled = true;
					await this.sendMessage(input.value, messagesContainer);
					input.value = '';
					input.style.height = 'auto';
					sendButton.disabled = false;
				}
			}
		});

		modelSelector.addEventListener('change', (e) => {
			const selectedValue = (e.target as HTMLSelectElement).value;
			const [provider, model] = selectedValue.split(':');
			this.currentProvider = provider;
			this.currentModel = model;
		});
	}

	async onClose() {
		// Cleanup
	}

	createActionButtons(container: HTMLElement) {
		// Research button
		const researchButton = container.createEl('button', {
			text: 'Research',
			cls: 'ai-assistant-action-button'
		});
		researchButton.addEventListener('click', async () => {
			if (!this.isProcessing) {
				await this.performResearch();
			}
		});

		// Summarize button
		const summarizeButton = container.createEl('button', {
			text: 'Summarize',
			cls: 'ai-assistant-action-button'
		});
		summarizeButton.addEventListener('click', async () => {
			if (!this.isProcessing) {
				await this.summarizeNote();
			}
		});

		// Create content button
		const contentButton = container.createEl('button', {
			text: 'Create Content',
			cls: 'ai-assistant-action-button'
		});
		contentButton.addEventListener('click', async () => {
			if (!this.isProcessing) {
				await this.createContent();
			}
		});

		// Generate tags button
		const tagsButton = container.createEl('button', {
			text: 'Generate Tags',
			cls: 'ai-assistant-action-button'
		});
		tagsButton.addEventListener('click', async () => {
			if (!this.isProcessing) {
				await this.generateTags();
			}
		});

		// Find related notes button
		const relatedButton = container.createEl('button', {
			text: 'Find Related',
			cls: 'ai-assistant-action-button'
		});
		relatedButton.addEventListener('click', async () => {
			if (!this.isProcessing) {
				await this.findRelatedNotes();
			}
		});
	}

	createContextButtons(container: HTMLElement) {
		// Add current note to context button
		const addContextButton = container.createEl('button', {
			text: 'Add Current Note to Context',
			cls: 'ai-assistant-context-button'
		});
		addContextButton.addEventListener('click', async () => {
			if (!this.isProcessing) {
				await this.addCurrentNoteToContext();
			}
		});

		// Clear context button
		const clearContextButton = container.createEl('button', {
			text: 'Clear Context',
			cls: 'ai-assistant-context-button'
		});
		clearContextButton.addEventListener('click', async () => {
			this.clearContext();
		});
	}

	async populateModelSelector(selectElement: HTMLSelectElement) {
		// Clear existing options
		selectElement.empty();

		// Add Ollama models
		try {
			const response = await requestUrl({
				url: `${this.plugin.settings.ollamaUrl}/api/tags`,
				method: 'GET',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.status === 200) {
				const data = response.json;
				data.models.forEach((model: any) => {
					const modelName = model.name;
					const option = selectElement.createEl('option', {
						text: `🦙 Ollama: ${modelName}`,
						value: `ollama:${modelName}`
					});
					if (this.currentProvider === 'ollama' && this.currentModel === modelName) {
						option.selected = true;
					}
				});
			} else {
				// Fallback to default model if API call fails
				const ollamaOption = selectElement.createEl('option', {
					text: `🦙 Ollama: ${this.plugin.settings.defaultModel}`,
					value: `ollama:${this.plugin.settings.defaultModel}`
				});
				if (this.currentProvider === 'ollama' && this.currentModel === this.plugin.settings.defaultModel) {
					ollamaOption.selected = true;
				}
			}
		} catch (error) {
			// Fallback to default model if API call fails
			const ollamaOption = selectElement.createEl('option', {
				text: `🦙 Ollama: ${this.plugin.settings.defaultModel}`,
				value: `ollama:${this.plugin.settings.defaultModel}`
			});
			if (this.currentProvider === 'ollama' && this.currentModel === this.plugin.settings.defaultModel) {
				ollamaOption.selected = true;
			}
		}

		// Add OpenAI models
		if (this.plugin.settings.openaiApiKey) {
			['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'].forEach(model => {
				const option = selectElement.createEl('option', {
					text: `🧠 OpenAI: ${model}`,
					value: `openai:${model}`
				});
				if (this.currentProvider === 'openai' && this.currentModel === model) {
					option.selected = true;
				}
			});
		}

		// Add Anthropic models
		if (this.plugin.settings.anthropicApiKey) {
			['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229'].forEach(model => {
				const option = selectElement.createEl('option', {
					text: `🤖 Anthropic: ${model}`,
					value: `anthropic:${model}`
				});
				if (this.currentProvider === 'anthropic' && this.currentModel === model) {
					option.selected = true;
				}
			});
		}

		// Add Gemini models
		if (this.plugin.settings.geminiApiKey) {
			['gemini-1.5-pro', 'gemini-1.5-flash'].forEach(model => {
				const option = selectElement.createEl('option', {
					text: `⭐ Gemini: ${model}`,
					value: `gemini:${model}`
				});
				if (this.currentProvider === 'gemini' && this.currentModel === model) {
					option.selected = true;
				}
			});
		}

		// Add Groq models (note: they don't search the internet)
		if (this.plugin.settings.groqApiKey) {
			// Production models
			const productionModels = [
				'llama-3.1-8b-instant',
				'llama-3.3-70b-versatile',
				'meta-llama/llama-guard-4-12b',
				'openai/gpt-oss-120b',
				'openai/gpt-oss-20b'
			];
			
			productionModels.forEach(model => {
				const option = selectElement.createEl('option', {
					text: `⚡ Groq: ${model} (Production)`,
					value: `groq:${model}`
				});
				if (this.currentProvider === 'groq' && this.currentModel === model) {
					option.selected = true;
				}
			});
			
			// Audio models (special handling needed)
			const audioModels = [
				'whisper-large-v3',
				'whisper-large-v3-turbo'
			];
			
			audioModels.forEach(model => {
				const option = selectElement.createEl('option', {
					text: `🎵 Groq: ${model} (Audio Transcription)`,
					value: `groq:${model}`
				});
				if (this.currentProvider === 'groq' && this.currentModel === model) {
					option.selected = true;
				}
			});
			
			// Preview models
			const previewGroup = document.createElement('optgroup');
			previewGroup.label = ' Groq Preview Models (Evaluation Only)';
			selectElement.appendChild(previewGroup);
			
			const previewModels = [
				'deepseek-r1-distill-llama-70b',
				'meta-llama/llama-4-maverick-17b-128e-instruct',
				'meta-llama/llama-4-scout-17b-16e-instruct',
				'meta-llama/llama-prompt-guard-2-22m',
				'meta-llama/llama-prompt-guard-2-86m',
				'moonshotai/kimi-k2-instruct',
				'playai-tts',
				'playai-tts-arabic',
				'qwen/qwen3-32b'
			];
			
			previewModels.forEach(model => {
				const option = previewGroup.createEl('option', {
					text: `🧪 Groq: ${model} (Preview)`,
					value: `groq:${model}`
				});
				if (this.currentProvider === 'groq' && this.currentModel === model) {
					option.selected = true;
				}
			});
			
			// Preview systems
			const systemsGroup = document.createElement('optgroup');
			systemsGroup.label = ' Groq Preview Systems';
			selectElement.appendChild(systemsGroup);
			
			const previewSystems = [
				'compound-beta',
				'compound-beta-mini'
			];
			
			previewSystems.forEach(model => {
				const option = systemsGroup.createEl('option', {
					text: `⚙️ Groq: ${model} (System)`,
					value: `groq:${model}`
				});
				if (this.currentProvider === 'groq' && this.currentModel === model) {
					option.selected = true;
				}
			});
		}
	}

	async sendMessage(message: string, messagesContainer: HTMLElement) {
		// Add user message to UI
		this.addMessageToUI('user', message, messagesContainer);
		
		// Add user message to history
		this.messages.push({ role: 'user', content: message });

		// Show typing indicator
		const typingIndicator = this.addTypingIndicator(messagesContainer);
		this.isProcessing = true;

		try {
			// Get AI response
			const response = await this.getAIResponse(message);
			
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Add AI response to UI
			this.addMessageToUI('assistant', response, messagesContainer);
			
			// Add AI response to history
			this.messages.push({ role: 'assistant', content: response });
		} catch (error: any) {
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Show error message with better formatting
			const errorMessage = `Error: ${error.message || 'Unknown error occurred. Please check your API key and internet connection.'}`;
			this.addMessageToUI('assistant', errorMessage, messagesContainer);
			
			// Add error to history
			this.messages.push({ role: 'assistant', content: errorMessage });
		}
	}

	async performResearch() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('Please open a note to research.');
			return;
		}

		const content = await this.app.vault.read(activeFile);
		if (!content.trim()) {
			new Notice('The current note is empty.');
			return;
		}

		const messagesContainer = document.getElementById('ai-assistant-messages');
		if (!messagesContainer) return;

		// Add research prompt to UI
		this.addMessageToUI('user', `Researching topic: ${activeFile.basename}`, messagesContainer);
		
		// Show typing indicator
		const typingIndicator = this.addTypingIndicator(messagesContainer);
		this.isProcessing = true;

		try {
			// Get AI research response
			const researchPrompt = `Perform comprehensive research on the following topic:

${content}

Provide detailed findings, key points, and relevant information.`;
			const response = await this.getAIResponse(researchPrompt);
			
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Add AI response to UI
			this.addMessageToUI('assistant', response, messagesContainer);
			
			// Add to history
			this.messages.push({ role: 'user', content: researchPrompt });
			this.messages.push({ role: 'assistant', content: response });
		} catch (error: any) {
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Show error message
			const errorMessage = `Research Error: ${error.message || 'Unknown error occurred'}`;
			this.addMessageToUI('assistant', errorMessage, messagesContainer);
		}
	}

	async summarizeNote() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('Please open a note to summarize.');
			return;
		}

		const content = await this.app.vault.read(activeFile);
		if (!content.trim()) {
			new Notice('The current note is empty.');
			return;
		}

		const messagesContainer = document.getElementById('ai-assistant-messages');
		if (!messagesContainer) return;

		// Add summary prompt to UI
		this.addMessageToUI('user', `Summarizing note: ${activeFile.basename}`, messagesContainer);
		
		// Show typing indicator
		const typingIndicator = this.addTypingIndicator(messagesContainer);
		this.isProcessing = true;

		try {
			// Get AI summary response
			const summaryPrompt = `Please provide a concise summary of the following note:

${content}`;
			const response = await this.getAIResponse(summaryPrompt);
			
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Add AI response to UI
			this.addMessageToUI('assistant', response, messagesContainer);
			
			// Add to history
			this.messages.push({ role: 'user', content: summaryPrompt });
			this.messages.push({ role: 'assistant', content: response });
		} catch (error: any) {
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Show error message
			const errorMessage = `Summary Error: ${error.message || 'Unknown error occurred'}`;
			this.addMessageToUI('assistant', errorMessage, messagesContainer);
		}
	}

	async createContent() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('Please open a note to create content from.');
			return;
		}

		const content = await this.app.vault.read(activeFile);
		if (!content.trim()) {
			new Notice('The current note is empty.');
			return;
		}

		const messagesContainer = document.getElementById('ai-assistant-messages');
		if (!messagesContainer) return;

		// Add content creation prompt to UI
		this.addMessageToUI('user', `Creating content from note: ${activeFile.basename}`, messagesContainer);
		
		// Show typing indicator
		const typingIndicator = this.addTypingIndicator(messagesContainer);
		this.isProcessing = true;

		try {
			// Get AI content creation response
			const contentPrompt = `Using the following information, create a well-structured article or blog post:

${content}

Please format the output in Markdown with appropriate headings, bullet points, and paragraphs.`;
			const response = await this.getAIResponse(contentPrompt);
			
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Add AI response to UI
			this.addMessageToUI('assistant', response, messagesContainer);
			
			// Add to history
			this.messages.push({ role: 'user', content: contentPrompt });
			this.messages.push({ role: 'assistant', content: response });
			
			// Offer to save the content as a new note
			const saveButton = messagesContainer.createEl('button', {
				text: 'Save as New Note',
				cls: 'ai-assistant-save-button'
			});
			saveButton.addEventListener('click', async () => {
				await this.saveContentAsNote(response, activeFile.basename);
				saveButton.remove();
			});
		} catch (error: any) {
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Show error message
			const errorMessage = `Content Creation Error: ${error.message || 'Unknown error occurred'}`;
			this.addMessageToUI('assistant', errorMessage, messagesContainer);
		}
	}

	async generateTags() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('Please open a note to generate tags for.');
			return;
		}

		const content = await this.app.vault.read(activeFile);
		if (!content.trim()) {
			new Notice('The current note is empty.');
			return;
		}

		const messagesContainer = document.getElementById('ai-assistant-messages');
		if (!messagesContainer) return;

		// Add tags prompt to UI
		this.addMessageToUI('user', `Generating tags for note: ${activeFile.basename}`, messagesContainer);
		
		// Show typing indicator
		const typingIndicator = this.addTypingIndicator(messagesContainer);
		this.isProcessing = true;

		try {
			// Get AI tags response
			const tagsPrompt = `Generate 5-10 relevant tags for the following note. Return only the tags, separated by commas:

${content}`;
			const response = await this.getAIResponse(tagsPrompt);
			
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Add AI response to UI
			this.addMessageToUI('assistant', `Suggested tags: ${response}`, messagesContainer);
			
			// Add to history
			this.messages.push({ role: 'user', content: tagsPrompt });
			this.messages.push({ role: 'assistant', content: response });
			
			// Offer to add tags to the note
			const addTagsButton = messagesContainer.createEl('button', {
				text: 'Add Tags to Note',
				cls: 'ai-assistant-save-button'
			});
			addTagsButton.addEventListener('click', async () => {
				await this.addTagsToNote(response);
				addTagsButton.remove();
			});
		} catch (error: any) {
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Show error message
			const errorMessage = `Tags Generation Error: ${error.message || 'Unknown error occurred'}`;
			this.addMessageToUI('assistant', errorMessage, messagesContainer);
		}
	}

	async findRelatedNotes() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('Please open a note to find related notes for.');
			return;
		}

		const content = await this.app.vault.read(activeFile);
		if (!content.trim()) {
			new Notice('The current note is empty.');
			return;
		}

		const messagesContainer = document.getElementById('ai-assistant-messages');
		if (!messagesContainer) return;

		// Add related notes prompt to UI
		this.addMessageToUI('user', `Finding related notes for: ${activeFile.basename}`, messagesContainer);
		
		// Show typing indicator
		const typingIndicator = this.addTypingIndicator(messagesContainer);
		this.isProcessing = true;

		try {
			// Get all markdown files in the vault
			const allFiles = this.app.vault.getMarkdownFiles();
			
			// Get content of up to 10 other files for context
			let context = "";
			let count = 0;
			for (const file of allFiles) {
				if (file.path !== activeFile.path && count < 10) {
					const fileContent = await this.app.vault.read(file);
					if (fileContent.trim()) {
						context += `
---
File: ${file.basename}
Content: ${fileContent.substring(0, 500)}
`;
						count++;
					}
				}
			}
			
			// Get AI related notes response
			const relatedPrompt = `Find related notes in the vault for the following note:

${content}

Available notes in the vault:${context}

Return a list of 3-5 related notes with brief explanations why they are related. Format as a bulleted list.`;
			const response = await this.getAIResponse(relatedPrompt);
			
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Add AI response to UI
			this.addMessageToUI('assistant', response, messagesContainer);
			
			// Add to history
			this.messages.push({ role: 'user', content: relatedPrompt });
			this.messages.push({ role: 'assistant', content: response });
		} catch (error: any) {
			// Remove typing indicator
			typingIndicator.remove();
			this.isProcessing = false;
			
			// Show error message
			const errorMessage = `Related Notes Error: ${error.message || 'Unknown error occurred'}`;
			this.addMessageToUI('assistant', errorMessage, messagesContainer);
		}
	}

	async saveContentAsNote(content: string, sourceName: string) {
		try {
			const fileName = `${sourceName}-content-${Date.now()}.md`;
			await this.app.vault.create(fileName, content);
			new Notice(`Content saved as ${fileName}`);
		} catch (error: any) {
			new Notice(`Error saving note: ${error.message}`);
		}
	}

	async addCurrentNoteToContext() {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('Please open a note to add to context.');
			return;
		}

		const content = await this.app.vault.read(activeFile);
		if (!content.trim()) {
			new Notice('The current note is empty.');
			return;
		}

		// Add note content to context
		const contextMessage = `Context from note "${activeFile.basename}":

${content}`;
		this.messages.push({ role: 'user', content: contextMessage });

		// Update UI
		const messagesContainer = document.getElementById('ai-assistant-messages');
		if (messagesContainer) {
			this.addMessageToUI('user', `Added note "${activeFile.basename}" to context`, messagesContainer);
		}

		new Notice(`Added "${activeFile.basename}" to conversation context.`);
	}

	clearContext() {
		// Clear all messages except system messages (if any)
		this.messages = [];

		// Update UI
		const messagesContainer = document.getElementById('ai-assistant-messages');
		if (messagesContainer) {
			messagesContainer.empty();
			this.addMessageToUI('assistant', 'Context cleared. Starting fresh conversation.', messagesContainer);
		}

		new Notice('Conversation context cleared.');
	}

	async exportChatToNote() {
		if (this.messages.length === 0) {
			new Notice('No chat history to export.');
			return;
		}

		try {
			// Format chat history
			let chatContent = `# AI Assistant Chat Export

`;
			chatContent += `Exported on: ${new Date().toLocaleString()}

`;
			chatContent += `---

`;

			for (const message of this.messages) {
				const role = message.role === 'user' ? 'You' : 'AI Assistant';
				const timestamp = new Date().toLocaleTimeString();
				chatContent += `## ${role} (${timestamp})

`;
				chatContent += `${message.content}

`;
				chatContent += `---

`;
			}

			// Create new note
			const fileName = `AI_Chat_Export_${Date.now()}.md`;
			await this.app.vault.create(fileName, chatContent);

			new Notice(`Chat exported to "${fileName}"`);
		} catch (error: any) {
			console.error('Error exporting chat:', error);
			new Notice(`Error exporting chat: ${error.message}`);
		}
	}

	async addTagsToNote(tagsString: string) {
		const activeFile = this.app.workspace.getActiveFile();
		if (!activeFile) {
			new Notice('No active file to add tags to.');
			return;
		}

		try {
			// Parse tags from the response
			const tags = tagsString.split(',').map(tag => tag.trim().replace(/[^a-zA-Z0-9\-_]/g, ''));
			
			// Read current file content
			const content = await this.app.vault.read(activeFile);
			
			// Check if frontmatter already exists
			let newContent = content;
			// Split the content into lines to check for frontmatter
			const lines = content.split('\n');
			let hasFrontmatter = false;
			let frontmatterEndIndex = -1;
			
			// Check if the first line is ---
			if (lines[0] === '---') {
				// Look for the closing ---
				for (let i = 1; i < lines.length; i++) {
					if (lines[i] === '---') {
						hasFrontmatter = true;
						frontmatterEndIndex = i;
						break;
					}
				}
			}
			
			if (hasFrontmatter) {
				// Frontmatter exists, add tags
				const frontmatterLines = lines.slice(1, frontmatterEndIndex);
				const restOfContent = lines.slice(frontmatterEndIndex + 1).join('\n');
				
				// Check if tags already exist in frontmatter
				let tagsLineIndex = -1;
				for (let i = 0; i < frontmatterLines.length; i++) {
					if (frontmatterLines[i].startsWith('tags:')) {
						tagsLineIndex = i;
						break;
					}
				}
				
				if (tagsLineIndex !== -1) {
					// Tags field exists, update it
					const existingTagsMatch = frontmatterLines[tagsLineIndex].match(/tags:\s*\[([^\]]*)\]/);
					if (existingTagsMatch) {
						const existingTags = existingTagsMatch[1].split(',').map(tag => tag.trim().replace(/['"]/g, ''));
						const combinedTags = [...new Set([...existingTags, ...tags])]; // Combine and dedupe
						frontmatterLines[tagsLineIndex] = `tags: [${combinedTags.map(tag => `"${tag}"`).join(', ')}]`;
					}
				} else {
					// No tags field, add it
					frontmatterLines.push(`tags: [${tags.map(tag => `"${tag}"`).join(', ')}]`);
				}
				
				newContent = `---\n${frontmatterLines.join('\n')}\n---\n${restOfContent}`;
			} else {
				// No frontmatter, create it
				const tagsLine = `tags: [${tags.map(tag => `"${tag}"`).join(', ')}]`;
				newContent = `---\n${tagsLine}\n---\n${content}`;
			}
			
			// Save updated content
			await this.app.vault.modify(activeFile, newContent);
			new Notice('Tags added to note successfully!');
		} catch (error: any) {
			new Notice(`Error adding tags to note: ${error.message}`);
		}
	}

	addMessageToUI(role: 'user' | 'assistant', content: string, container: HTMLElement) {
		const messageDiv = container.createDiv(`ai-assistant-message ai-assistant-${role}-message`);
		
		// Add message header with icon
		const messageHeader = messageDiv.createDiv('ai-assistant-message-header');
		if (role === 'user') {
			messageHeader.setText('You');
		} else {
			messageHeader.setText('AI Assistant');
		}
		
		// Add message content with proper markdown rendering
		const contentDiv = messageDiv.createDiv('ai-assistant-message-content');
		this.renderMarkdownContent(contentDiv, content);
		
		// Add timestamp
		const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		const timestampDiv = messageDiv.createDiv('ai-assistant-message-timestamp');
		timestampDiv.setText(timestamp);
		
		container.scrollTop = container.scrollHeight;
	}

	renderMarkdownContent(container: HTMLElement, content: string) {
		// Simple markdown rendering for common elements
		let formattedContent = content
			.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
			.replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic
			.replace(/~~(.*?)~~/g, '<del>$1</del>')            // Strikethrough
			.replace(/`(.*?)`/g, '<code>$1</code>')            // Inline code
			.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')  // Code blocks
			.replace(/`([^`]+)`/g, '<code>$1</code>')          // Inline code (alternative)
			.replace(/\n/g, '<br>');                           // Line breaks
		
		// Handle headers
		formattedContent = formattedContent
			.replace(/###### (.*?)(<br>|$)/g, '<h6>$1</h6>')
			.replace(/##### (.*?)(<br>|$)/g, '<h5>$1</h5>')
			.replace(/#### (.*?)(<br>|$)/g, '<h4>$1</h4>')
			.replace(/### (.*?)(<br>|$)/g, '<h3>$1</h3>')
			.replace(/## (.*?)(<br>|$)/g, '<h2>$1</h2>')
			.replace(/# (.*?)(<br>|$)/g, '<h1>$1</h1>');
		
		// Handle lists
		formattedContent = formattedContent
			.replace(/(\d+)\. (.*?)(<br>|$)/g, '<ol><li>$2</li></ol>')
			.replace(/\* (.*?)(<br>|$)/g, '<ul><li>$1</li></ul>')
			.replace(/- (.*?)(<br>|$)/g, '<ul><li>$1</li></ul>');
		
		// Set the formatted content
		container.innerHTML = formattedContent;
		
		// Handle links
		const links = container.querySelectorAll('a');
		links.forEach(link => {
			link.setAttr('target', '_blank');
			link.setAttr('rel', 'noopener noreferrer');
		});
	}

	addTypingIndicator(container: HTMLElement) {
		const typingDiv = container.createDiv('ai-assistant-typing-indicator');
		const typingText = typingDiv.createEl('span', { 
			text: 'AI is thinking', 
			cls: 'ai-assistant-typing-text' 
		});
		const dotsContainer = typingDiv.createDiv('ai-assistant-typing-dots');
		dotsContainer.createEl('span', { cls: 'ai-assistant-typing-dot' });
		dotsContainer.createEl('span', { cls: 'ai-assistant-typing-dot' });
		dotsContainer.createEl('span', { cls: 'ai-assistant-typing-dot' });
		container.scrollTop = container.scrollHeight;
		return typingDiv;
	}

	async getAIResponse(message: string): Promise<string> {
		switch (this.currentProvider) {
			case 'ollama':
				return await this.getOllamaResponse(message);
			case 'openai':
				return await this.getOpenAIResponse(message);
			case 'anthropic':
				return await this.getAnthropicResponse(message);
			case 'gemini':
				return await this.getGeminiResponse(message);
			case 'groq':
				return await this.getGroqResponse(message);
			default:
				throw new Error(`Unsupported provider: ${this.currentProvider}`);
		}
	}

	async getOllamaResponse(message: string): Promise<string> {
		try {
			// For Ollama, we'll make a direct fetch request
			const response = await requestUrl({
				url: `${this.plugin.settings.ollamaUrl}/api/chat`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: this.currentModel,
					messages: [
						...this.messages.map(msg => ({ role: msg.role, content: msg.content })),
						{ role: 'user', content: message }
					],
					options: {
						temperature: this.plugin.settings.temperature,
					},
					stream: false
				})
			});
			
			if (response.status !== 200) {
				console.error('Ollama API error:', response.status, response.text);
				if (response.status === 404) {
					return `Model not found: ${this.currentModel}. Please check if the model is available in Ollama.`;
				}
				throw new Error(`Ollama API error: ${response.status} - ${response.text}`);
			}
			
			const data = response.json;
			if (data.error) {
				console.error('Ollama API error:', data.error);
				return `Ollama error: ${data.error}`;
			}
			
			return data.message?.content || 'No response from Ollama';
		} catch (error: any) {
			console.error('Ollama error:', error);
			if (error.message.includes('Failed to fetch') || error.message.includes('fetch')) {
				return 'Connection error: Please check if Ollama is running and accessible.';
			}
			return `Ollama error: ${error.message || 'Unknown error occurred. Please check if Ollama is running.'}`;
		}
	}

	async getOpenAIResponse(message: string): Promise<string> {
		try {
			const response = await requestUrl({
				url: 'https://api.openai.com/v1/chat/completions',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.plugin.settings.openaiApiKey}`
				},
				body: JSON.stringify({
					model: this.currentModel,
					messages: [
						...this.messages.map(msg => ({ role: msg.role, content: msg.content })),
						{ role: 'user', content: message }
					],
					temperature: this.plugin.settings.temperature,
					max_tokens: this.plugin.settings.maxTokens
				})
			});
			
			if (response.status !== 200) {
				throw new Error(`OpenAI API error: ${response.status} ${response.text}`);
			}
			
			const data = response.json;
			return data.choices?.[0]?.message?.content || 'No response from OpenAI';
		} catch (error: any) {
			throw new Error(`OpenAI error: ${error.message}`);
		}
	}

	async getAnthropicResponse(message: string): Promise<string> {
		try {
			const response = await requestUrl({
				url: 'https://api.anthropic.com/v1/messages',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'X-API-Key': this.plugin.settings.anthropicApiKey,
					'anthropic-version': '2023-06-01'
				},
				body: JSON.stringify({
					model: this.currentModel,
					messages: [
						...this.messages.map(msg => ({ role: msg.role, content: msg.content })),
						{ role: 'user', content: message }
					],
					temperature: this.plugin.settings.temperature,
					max_tokens: this.plugin.settings.maxTokens
				})
			});
			
			if (response.status !== 200) {
				throw new Error(`Anthropic API error: ${response.status} ${response.text}`);
			}
			
			const data = response.json;
			return data.content?.[0]?.text || 'No response from Anthropic';
		} catch (error: any) {
			throw new Error(`Anthropic error: ${error.message}`);
		}
	}

	async getGeminiResponse(message: string): Promise<string> {
		try {
			const response = await requestUrl({
				url: `https://generativelanguage.googleapis.com/v1beta/models/${this.currentModel}:generateContent?key=${this.plugin.settings.geminiApiKey}`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					contents: [{
						parts: [{
							text: message
						}]
					}]
				})
			});
			
			if (response.status !== 200) {
				throw new Error(`Gemini API error: ${response.status} ${response.text}`);
			}
			
			const data = response.json;
			if (data.error) {
				throw new Error(`Gemini API error: ${data.error.message}`);
			}
			
			return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini';
		} catch (error: any) {
			throw new Error(`Gemini error: ${error.message}`);
		}
	}

	async getGroqResponse(message: string): Promise<string> {
		try {
			// Check if this is an audio model (requires different handling)
			const isAudioModel = this.currentModel.includes('whisper');
			
			if (isAudioModel) {
				// For audio models, we need to handle them differently
				// This would require audio file input, which we don't currently support
				return `The model "${this.currentModel}" is an audio transcription model that requires audio input. This plugin currently only supports text-based models.`;
			}
			
			// Format messages for Groq API with size limits
			const formattedMessages = [
				...this.messages.map(msg => ({
					role: msg.role,
					content: msg.content.length > 2000 ? msg.content.substring(0, 2000) + '...' : msg.content
				})),
				{
					role: 'user',
					content: message.length > 2000 ? message.substring(0, 2000) + '...' : message
				}
			];

			// Determine appropriate max_tokens based on model
			let maxTokens = Math.min(this.plugin.settings.maxTokens, 8192);
			if (this.currentModel.includes('llama-3.3-70b')) {
				maxTokens = Math.min(maxTokens, 8192);
			} else if (this.currentModel.includes('llama-3.1-8b')) {
				maxTokens = Math.min(maxTokens, 8192);
			}

			const requestBody: any = {
				model: this.currentModel,
				messages: formattedMessages,
				temperature: this.plugin.settings.temperature,
				max_tokens: maxTokens
			};

			const response = await requestUrl({
				url: 'https://api.groq.com/openai/v1/chat/completions',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${this.plugin.settings.groqApiKey}`
				},
				body: JSON.stringify(requestBody)
			});
			
			if (response.status !== 200) {
				console.error('Groq API error:', response.status, response.text);
				if (response.status === 400) {
					return 'Bad Request: Please check your request format or model name.';
				} else if (response.status === 401) {
					return 'Authentication error: Please check your Groq API key.';
				} else if (response.status === 413) {
					return 'Request too large: Please reduce the length of your message or context.';
				} else if (response.status === 429) {
					return 'Rate limit exceeded: Please wait before sending another request.';
				} else if (response.status === 404) {
					return `Model not found: The selected Groq model "${this.currentModel}" may not be available.`;
				}
				throw new Error(`Groq API error: ${response.status} - ${response.text}`);
			}
			
			const data = response.json;
			if (data.error) {
				console.error('Groq API error:', data.error);
				return `Groq API error: ${data.error.message || JSON.stringify(data.error)}`;
			}
			
			return data.choices?.[0]?.message?.content || 'No response from Groq';
		} catch (error: any) {
			console.error('Groq API error:', error);
			if (error.message.includes('401')) {
				return 'Authentication error: Please check your Groq API key.';
			} else if (error.message.includes('404')) {
				return `Model not found: The selected Groq model "${this.currentModel}" may not be available.`;
			} else {
				return `Groq error: ${error.message || 'Unknown error occurred. Please check your API key and internet connection.'}`;
			}
		}
	}
}