const MAX_HISTORY_SIZE = 10;
const HISTORY_STORAGE_KEY = 'shaderHistory';

export class ShaderHistoryManager {
  constructor() {
    this.history = [];
  }

  async loadHistory() {
    try {
      const { shaderHistory } = await chrome.storage.local.get([HISTORY_STORAGE_KEY]);
      this.history = shaderHistory || [];
      return this.history;
    } catch (error) {
      console.error("Error loading shader history:", error);
      this.history = [];
      return this.history;
    }
  }

  async saveHistory() {
    try {
      await chrome.storage.local.set({ [HISTORY_STORAGE_KEY]: this.history });
    } catch (error) {
      console.error("Error saving shader history:", error);
    }
  }

  addToHistory(shaderID) {
    const existingIndex = this.history.indexOf(shaderID);
    if (existingIndex > -1) {
      this.history.splice(existingIndex, 1);
    }

    this.history.unshift(shaderID);
    if (this.history.length > MAX_HISTORY_SIZE) {
      this.history = this.history.slice(0, MAX_HISTORY_SIZE);
    }
  }

  getHistoryForServer() {
    if (this.history.length >= MAX_HISTORY_SIZE) {
      this.history = this.history.slice(0, MAX_HISTORY_SIZE - 1);
      return this.history;
    }
    return this.history;
  }

  shouldRequestNewShader() {
    return this.history.length < MAX_HISTORY_SIZE;
  }

  needsHistoryTrim() {
    return this.history.length >= MAX_HISTORY_SIZE;
  }

  async loadQuality() {
    try {
        const { canvasQuality } = await chrome.storage.local.get(['canvasQuality']);
        return canvasQuality || 'High';
    } catch (err) {
        console.warn('Could not load quality:', err);
        await this.saveQuality();
    }
  }

  async saveQuality() {
    try {
      await chrome.storage.local.set({ canvasQuality: this.currentQuality });
    } catch (err) {
      console.warn('Could not save quality:', err);
    }
  }
}