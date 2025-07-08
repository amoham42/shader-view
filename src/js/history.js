const DEBUG = false;
const MAX_HISTORY_SIZE = 10;
const HISTORY_STORAGE_KEY = 'shaderHistory';
const QUALITY_STORAGE_KEY = 'canvasQuality';
const RENDER_MODE_STORAGE_KEY = 'renderMode';

export class ShaderHistoryManager {
  constructor() {
    this.history = [];
  }

  async init() {
    this.history = await this.loadHistory();
  }

  async loadHistory() {
    try {
      const { shaderHistory } = await chrome.storage.local.get([HISTORY_STORAGE_KEY]);
      this.history = shaderHistory || [];
      if(this.history.length >= MAX_HISTORY_SIZE) {
        this.history = this.history.slice(0, MAX_HISTORY_SIZE);
      }
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
    if (this.history.length >= MAX_HISTORY_SIZE) {
      this.history = this.history.slice(0, MAX_HISTORY_SIZE);
    }
  }

  getHistory() {
    return this.history;
  }

  async loadQuality() {
    try {
        const { canvasQuality } = await chrome.storage.local.get([QUALITY_STORAGE_KEY]);
        return canvasQuality || 'High';
    } catch (err) {
        if (DEBUG) console.warn('Could not load quality:', err);
        await this.saveQuality();
    }
  }

  async saveQuality(currentQuality = 'High') {
    try {
      await chrome.storage.local.set({ canvasQuality: currentQuality });
    } catch (err) {
      if (DEBUG) console.warn('Could not save quality:', err);
    }
  }

  async loadRenderMode() {
    try {
      const { renderMode } = await chrome.storage.local.get([RENDER_MODE_STORAGE_KEY]);
      return renderMode || 'Pause';
    } catch (err) {
      if (DEBUG) console.warn('Could not load render mode:', err);
      await this.saveRenderMode();
      return 'Pause';
    }
  }

  async saveRenderMode(currentRenderMode = 'Pause') {
    try {
      await chrome.storage.local.set({ renderMode: currentRenderMode });
    } catch (err) {
      if (DEBUG) console.warn('Could not save render mode:', err);
    }
  }
}

export async function getShaderData(shaderIDs) {
  return new Promise((resolve, reject) => {
    function processShaderInfo(shaderData, shaderID) {
      const imageUrl = "https://www.shadertoy.com/media/shaders/" + shaderID + ".jpg";
      const name = shaderData.info.name || "Unnamed Shader";
      const username = shaderData.info.username || "Unknown User";
      const text = `${name} by ${username}`;

      return {
        id: shaderID,
        imageUrl: imageUrl,
        text: text,
      };
    }

    function fetchUncachedShaders(uncachedIDs, cachedResults) {
      if (uncachedIDs.length === 0) {
        const orderedResults = shaderIDs.map(id => cachedResults[id]);
        resolve(orderedResults);
        return;
      }

      const httpReq = new XMLHttpRequest();
      httpReq.open("POST", window.API_CONFIG, true);
      httpReq.responseType = "json";
      httpReq.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      httpReq.setRequestHeader("X-Extension-ID", chrome.runtime.id);

      const str = "s=" + encodeURIComponent(JSON.stringify({ shaders: uncachedIDs })) + "&nt=0&nl=0&np=0";
      
      httpReq.onload = function () {
        const jsnShaders = httpReq.response;
        if (!jsnShaders || !Array.isArray(jsnShaders)) {
          reject(new Error(`Failed to load shader data: ${httpReq.status} ${httpReq.statusText}`));
          return;
        }

        jsnShaders.forEach((shader, index) => {
          const shaderID = uncachedIDs[index];
          
          const storageKey = `shader_${shaderID}`;
          const dataToStore = {
            data: [shader],
            timestamp: Date.now(),
            version: 1
          };

          chrome.storage.local.set({
            [storageKey]: dataToStore
          }, function() {
            if (chrome.runtime.lastError) {
              if (DEBUG) console.warn("Failed to cache shader data:", chrome.runtime.lastError);
            } else {
              if (DEBUG) console.log("Shader data cached successfully for:", shaderID);
            }
          });

          cachedResults[shaderID] = processShaderInfo(shader, shaderID);
        });

        const orderedResults = shaderIDs.map(id => cachedResults[id]);
        resolve(orderedResults);
      };

      httpReq.onerror = function () {
        reject(new Error("Network error when fetching shader data"));
      };

      httpReq.send(str);
    }

    const storageKeys = shaderIDs.map(id => `shader_${id}`);
    chrome.storage.local.get(storageKeys, function(result) {
      if (chrome.runtime.lastError) {
        if (DEBUG) console.warn("Storage access error:", chrome.runtime.lastError);
        fetchUncachedShaders(shaderIDs, {});
        return;
      }

      const cachedResults = {};
      const uncachedIDs = [];

      shaderIDs.forEach(shaderID => {
        const storageKey = `shader_${shaderID}`;
        const cachedData = result[storageKey];
        
        if (cachedData && cachedData.data && cachedData.data[0] && cachedData.data[0].info) {
          if (DEBUG) console.log("Loading shader from cache for history:", shaderID);
          cachedResults[shaderID] = processShaderInfo(cachedData.data[0], shaderID);
        } else {
          uncachedIDs.push(shaderID);
        }
      });

      if (uncachedIDs.length > 0) {
        if (DEBUG) console.log(`Fetching ${uncachedIDs.length} uncached shaders from server for history`);
      }


      fetchUncachedShaders(uncachedIDs, cachedResults);
    });
  });
}