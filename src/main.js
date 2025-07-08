"use strict";

import './css/style.css'
import { ShaderViewUI } from "./js/ui.js";
import { ShaderHistoryManager, getShaderData } from "./js/history.js";

window.mIsPaused = true;
window.API_CONFIG = "https://shaderviewproxy.vercel.app/api"; 
let previewImg = document.getElementById("preview");

document.addEventListener("DOMContentLoaded", () => {
  fetch(window.API_CONFIG, { method: 'GET', headers: { 'X-Extension-ID': chrome.runtime.id } })
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    window.gShaderID = data.shaderId;
    previewImg.src = `https://www.shadertoy.com/media/shaders/${data.shaderId}.jpg`
  }).then(() => {
    window.shaderHistoryManager = new ShaderHistoryManager();
    window.shaderHistoryManager.init().then(() => {
      window.shaderViewUI = new ShaderViewUI();
      window.shaderViewUI.init().then(() => {
        window.shaderHistoryManager.addToHistory(window.gShaderID);
        window.shaderHistoryManager.saveHistory().then(() => {
          getShaderData(window.shaderHistoryManager.getHistory()).then(newData => {
          window.shaderViewUI.populateHistoryItems(newData);
        });
        });
        
      });
    });
  }).catch(error => {
    console.error("Error loading random shader from proxy:", error);
  });
});