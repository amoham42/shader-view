"use strict";

import './css/style.css'
import { ShaderViewUI } from "./js/ui.js";
import { ShaderHistoryManager, getShaderData } from "./js/history.js";

window.mIsPaused = false;
window.API_CONFIG = "https://shaderviewproxy.vercel.app/api"; 

function waitForElement(selector, callback) {
  const element = document.querySelector(selector);
  if (element) {
    callback(element);
  } else {
    requestAnimationFrame(() => waitForElement(selector, callback));
  }
}

function startShaderLoading() {
  // Get pre-fetched shader data from background script
  chrome.runtime.sendMessage({ action: "getShaderData" }, (response) => {
    if (response && response.success && response.data) {
      const data = response.data;
      window.gShaderID = data.shaderId;
      
      // Wait for preview element to be available
      waitForElement('#preview', (previewImg) => {
        // Use the pre-computed image URL from background script
        previewImg.src = data.imageUrl || `https://www.shadertoy.com/media/shaders/${data.shaderId}.jpg`;
        
        window.shaderHistoryManager = new ShaderHistoryManager();
        window.shaderHistoryManager.init().then(() => {
          window.shaderHistoryManager.addToHistory(window.gShaderID);
          window.shaderHistoryManager.saveHistory();
          
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeFullUI);
          } else {
            initializeFullUI();
          }
        });
      });
    } else {
      // Fallback to direct API call if background script fails
      console.warn("Background script unavailable, falling back to direct API call");
      fallbackDirectFetch();
    }
  });
}

function fallbackDirectFetch() {
  fetch(window.API_CONFIG, { method: 'GET', headers: { 'X-Extension-ID': chrome.runtime.id } })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    window.gShaderID = data.shaderId;
    
    // Wait for preview element to be available
    waitForElement('#preview', (previewImg) => {
      previewImg.src = `https://www.shadertoy.com/media/shaders/${data.shaderId}.jpg`;
      
      window.shaderHistoryManager = new ShaderHistoryManager();
      window.shaderHistoryManager.init().then(() => {
        window.shaderHistoryManager.addToHistory(window.gShaderID);
        window.shaderHistoryManager.saveHistory();
        
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initializeFullUI);
        } else {
          initializeFullUI();
        }
      });
    });
  }).catch(error => {
    console.error("Error loading random shader from proxy:", error);
  });
}

function initializeFullUI() {
  window.shaderViewUI = new ShaderViewUI();
  window.shaderViewUI.init().then(() => {
    getShaderData(window.shaderHistoryManager.getHistory()).then(newData => {
      window.shaderViewUI.populateHistoryItems(newData);
    });
  });
}

startShaderLoading();