// Default settings for the plugin
export interface AIAssistantSettings {
  // Ollama settings
  ollamaUrl: string;
  ollamaModels: string[];
  
  // API keys
  openaiApiKey: string;
  anthropicApiKey: string;
  geminiApiKey: string;
  groqApiKey: string;
  
  // Default model
  defaultModel: string;
  defaultModelProvider: string;
  
  // Model configurations
  temperature: number;
  maxTokens: number;
}

export const DEFAULT_SETTINGS: AIAssistantSettings = {
  ollamaUrl: 'http://localhost:11434',
  ollamaModels: [],
  
  openaiApiKey: '',
  anthropicApiKey: '',
  geminiApiKey: '',
  groqApiKey: '',
  
  defaultModel: 'llama3',
  defaultModelProvider: 'ollama',
  
  temperature: 0.7,
  maxTokens: 2048,
};