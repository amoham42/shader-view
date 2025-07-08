const API_CONFIG = "https://shaderviewproxy.vercel.app/api";
const STORAGE_KEY = "preloaded_shader_data";
const BACKUP_STORAGE_KEY = "backup_shader_data";

const DEBUG = false;

async function prefetchShaderData() {
  try {
    if (DEBUG) console.log("Background: Fetching new shader data...");
    
    const response = await fetch(API_CONFIG, { 
      method: 'GET', 
      headers: { 'X-Extension-ID': chrome.runtime.id } 
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    await chrome.storage.local.set({
      [STORAGE_KEY]: {
        shaderId: data.shaderId,
        timestamp: Date.now(),
        imageUrl: `https://www.shadertoy.com/media/shaders/${data.shaderId}.jpg`
      }
    });
    
    if (DEBUG) console.log("Background: Shader data pre-fetched and stored:", data.shaderId);
    return data;
  } catch (error) {
    console.error("Background: Error fetching shader data:", error);
    return null;
  }
}

async function consumeShaderData() {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY, BACKUP_STORAGE_KEY]);
    let shaderData = result[STORAGE_KEY];
    
    if (!shaderData) {
      shaderData = result[BACKUP_STORAGE_KEY] || await prefetchShaderData();
    }
    
    await chrome.storage.local.remove([STORAGE_KEY]);
    if (result[BACKUP_STORAGE_KEY]) {
      await chrome.storage.local.set({ [STORAGE_KEY]: result[BACKUP_STORAGE_KEY] });
      await chrome.storage.local.remove([BACKUP_STORAGE_KEY]);
    }
    
    prefetchShaderData().then(newData => {
      if (newData) {
        chrome.storage.local.get([STORAGE_KEY]).then(current => {
          const key = current[STORAGE_KEY] ? BACKUP_STORAGE_KEY : STORAGE_KEY;
          chrome.storage.local.set({
            [key]: {
              shaderId: newData.shaderId,
              timestamp: Date.now(),
              imageUrl: `https://www.shadertoy.com/media/shaders/${newData.shaderId}.jpg`
            }
          });
        });
      }
    });
    
    return shaderData;
  } catch (error) {
    if (DEBUG) console.error("Background: Error consuming shader data:", error);
    return null;
  }
}

chrome.runtime.onStartup.addListener(() => {
  if (DEBUG) console.log("Background: Extension started, pre-fetching initial shader data");
  prefetchShaderData();
});

chrome.runtime.onInstalled.addListener(() => {
  if (DEBUG) console.log("Background: Extension installed, pre-fetching initial shader data");
  prefetchShaderData();
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getShaderData") {
    consumeShaderData().then(data => {
      sendResponse({ success: true, data: data });
    }).catch(error => {
      console.error("Background: Error in getShaderData:", error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
  
  if (request.action === "prefetchNext") {
    prefetchShaderData().then(data => {
      sendResponse({ success: true, data: data });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});

setInterval(() => {
  chrome.storage.local.get([STORAGE_KEY, BACKUP_STORAGE_KEY]).then(result => {
    if (!result[STORAGE_KEY] && !result[BACKUP_STORAGE_KEY]) {
      if (DEBUG) console.log("Background: No shader data found, pre-fetching...");
      prefetchShaderData();
    }
  });
}, 60000);