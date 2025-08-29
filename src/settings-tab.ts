import { App, PluginSettingTab, Setting } from 'obsidian';
import AIAssistantPlugin from './main';

export class AIAssistantSettingTab extends PluginSettingTab {
	plugin: AIAssistantPlugin;

	constructor(app: App, plugin: AIAssistantPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'AI Assistant Settings' });

		// Ollama settings
		new Setting(containerEl)
			.setName('Ollama URL')
			.setDesc('URL for your local Ollama instance')
			.addText(text => text
				.setPlaceholder('http://localhost:11434')
				.setValue(this.plugin.settings.ollamaUrl)
				.onChange(async (value) => {
					this.plugin.settings.ollamaUrl = value;
					await this.plugin.saveSettings();
				}));

		// API Keys
		new Setting(containerEl)
			.setName('OpenAI API Key')
			.setDesc('API key for OpenAI models')
			.addText(text => text
				.setPlaceholder('sk-...')
				.setValue(this.plugin.settings.openaiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.openaiApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Anthropic API Key')
			.setDesc('API key for Claude models')
			.addText(text => text
				.setPlaceholder('sk-ant-...')
				.setValue(this.plugin.settings.anthropicApiKey)
				.onChange(async (value) => {
					this.plugin.settings.anthropicApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Gemini API Key')
			.setDesc('API key for Google Gemini models')
			.addText(text => text
				.setPlaceholder('AIza...')
				.setValue(this.plugin.settings.geminiApiKey)
				.onChange(async (value) => {
					this.plugin.settings.geminiApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Groq API Key')
			.setDesc('API key for Groq models')
			.addText(text => text
				.setPlaceholder('gsk_...')
				.setValue(this.plugin.settings.groqApiKey)
				.onChange(async (value) => {
					this.plugin.settings.groqApiKey = value;
					await this.plugin.saveSettings();
				}));

		// Default model settings
		new Setting(containerEl)
			.setName('Default Model')
			.setDesc('Default model to use for conversations')
			.addText(text => text
				.setPlaceholder('llama3')
				.setValue(this.plugin.settings.defaultModel)
				.onChange(async (value) => {
					this.plugin.settings.defaultModel = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default Model Provider')
			.setDesc('Default provider for the model (ollama, openai, anthropic, gemini, groq)')
			.addText(text => text
				.setPlaceholder('ollama')
				.setValue(this.plugin.settings.defaultModelProvider)
				.onChange(async (value) => {
					this.plugin.settings.defaultModelProvider = value;
					await this.plugin.saveSettings();
				}));

		// Model parameters
		new Setting(containerEl)
			.setName('Temperature')
			.setDesc('Controls randomness of responses (0.0 to 1.0)')
			.addSlider(slider => slider
				.setLimits(0, 1, 0.1)
				.setValue(this.plugin.settings.temperature)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.temperature = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Max Tokens')
			.setDesc('Maximum number of tokens to generate')
			.addText(text => text
				.setPlaceholder('2048')
				.setValue(this.plugin.settings.maxTokens.toString())
				.onChange(async (value) => {
					const numValue = parseInt(value);
					if (!isNaN(numValue)) {
						this.plugin.settings.maxTokens = numValue;
						await this.plugin.saveSettings();
					}
				}));
	}
}