import { Plugin } from 'obsidian';
import { AIAssistantSettings, DEFAULT_SETTINGS } from './settings';
import { AIAssistantSettingTab } from './settings-tab';
import { AIAssistantView, VIEW_TYPE_AI_ASSISTANT } from './view';

export default class AIAssistantPlugin extends Plugin {
  settings!: AIAssistantSettings;

  override async onload() {
    console.log('Loading AI Assistant plugin');

    // Load settings
    await this.loadSettings();

    // Add setting tab
    this.addSettingTab(new AIAssistantSettingTab(this.app, this));

    // Register view
    this.registerView(
      VIEW_TYPE_AI_ASSISTANT,
      (leaf) => new AIAssistantView(leaf, this)
    );

    // Add command to open AI Assistant view
    this.addCommand({
      id: 'open-ai-assistant',
      name: 'Open AI Assistant',
      callback: () => {
        this.openAIAssistantView();
      }
    });

    // Add command to summarize current note
    this.addCommand({
      id: 'summarize-current-note',
      name: 'Summarize Current Note',
      callback: async () => {
        const view = this.getActiveAIView();
        if (view) {
          await view.summarizeNote();
        } else {
          await this.openAIAssistantView();
          // Wait a bit for the view to initialize
          setTimeout(async () => {
            const newView = this.getActiveAIView();
            if (newView) {
              await newView.summarizeNote();
            }
          }, 500);
        }
      }
    });

    // Add command to research current note
    this.addCommand({
      id: 'research-current-note',
      name: 'Research Current Note',
      callback: async () => {
        const view = this.getActiveAIView();
        if (view) {
          await view.performResearch();
        } else {
          await this.openAIAssistantView();
          // Wait a bit for the view to initialize
          setTimeout(async () => {
            const newView = this.getActiveAIView();
            if (newView) {
              await newView.performResearch();
            }
          }, 500);
        }
      }
    });

    // Add command to create content from current note
    this.addCommand({
      id: 'create-content-from-note',
      name: 'Create Content from Note',
      callback: async () => {
        const view = this.getActiveAIView();
        if (view) {
          await view.createContent();
        } else {
          await this.openAIAssistantView();
          // Wait a bit for the view to initialize
          setTimeout(async () => {
            const newView = this.getActiveAIView();
            if (newView) {
              await newView.createContent();
            }
          }, 500);
        }
      }
    });

    // Add command to generate tags for current note
    this.addCommand({
      id: 'generate-tags',
      name: 'Generate Tags for Current Note',
      callback: async () => {
        const view = this.getActiveAIView();
        if (view) {
          await view.generateTags();
        } else {
          await this.openAIAssistantView();
          // Wait a bit for the view to initialize
          setTimeout(async () => {
            const newView = this.getActiveAIView();
            if (newView) {
              await newView.generateTags();
            }
          }, 500);
        }
      }
    });

    // Add command to find related notes
    this.addCommand({
      id: 'find-related-notes',
      name: 'Find Related Notes',
      callback: async () => {
        const view = this.getActiveAIView();
        if (view) {
          await view.findRelatedNotes();
        } else {
          await this.openAIAssistantView();
          // Wait a bit for the view to initialize
          setTimeout(async () => {
            const newView = this.getActiveAIView();
            if (newView) {
              await newView.findRelatedNotes();
            }
          }, 500);
        }
      }
    });

    // Add ribbon icon
    this.addRibbonIcon('message-square', 'AI Assistant', () => {
      this.openAIAssistantView();
    });
  }

  override async onunload() {
    console.log('Unloading AI Assistant plugin');
    
    // Detach view
    this.app.workspace.detachLeavesOfType(VIEW_TYPE_AI_ASSISTANT);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // Open AI Assistant view
  async openAIAssistantView() {
    // Check if view already exists
    const existingLeaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT);
    if (existingLeaves.length > 0 && existingLeaves[0]) {
      // Reveal existing view
      this.app.workspace.revealLeaf(existingLeaves[0]);
      return;
    }

    // Create new view
    const leaf = this.app.workspace.getRightLeaf(false);
    if (leaf) {
      leaf.setViewState({
        type: VIEW_TYPE_AI_ASSISTANT,
        active: true,
      });
    }
  }

  // Get active AI view
  getActiveAIView(): AIAssistantView | null {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_AI_ASSISTANT);
    if (leaves.length > 0) {
      const view = leaves[0]?.view;
      if (view instanceof AIAssistantView) {
        return view;
      }
    }
    return null;
  }
}