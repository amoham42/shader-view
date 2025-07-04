"use strict";

import './css/style.css'

import "./js/libs/piLibs.js";
import "./js/libs/effect.js";
import { initQualityManager } from "./js/quality.js";
import { watchInit } from "./js/libs/shadertoy.js";
import {  ShaderViewUI } from "./js/ui.js";

// 3. Handle global variables
window.gShaderID = "WcKXDV";
window.gInvisIfFail = null;
window.gTime = "10";
window.gShowGui = false;
window.gPaused = false;
window.gMuted = true;

let shaderViewUI = null;

document.addEventListener("DOMContentLoaded", () => {
  shaderViewUI = new ShaderViewUI();
  window.shaderViewUI = shaderViewUI; // Make it globally accessible
  shaderViewUI.init();
  
  // Add fallback event listener for updateShaderInfo
  document.addEventListener('updateShaderInfo', (event) => {
    if (shaderViewUI && shaderViewUI.updateShaderInfo) {
      shaderViewUI.updateShaderInfo(event.detail);
    }
  });
  
  watchInit();

  const btn = document.querySelector('button[title="Snapshot"]');
  const canvas = document.getElementById('demogl');

  btn.addEventListener('click', () => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        link.download = 'snapshot.png';
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      },
      'image/png',
      1 
    );
  });

  initQualityManager();
});

// Add cleanup when page unloads
window.addEventListener('beforeunload', () => {
  if (shaderViewUI) {
    shaderViewUI.dispose();
  }
  
  if (window.gShaderToy && window.gShaderToy.mCreated) {
    window.gShaderToy.dispose();
  }
  
  if (window.qualityManager) {
    window.qualityManager.dispose();
    window.qualityManager = null;
  }
  
  // Clean up global references
  window.shaderViewUI = null;
});

async function getShaderData(shaderIDs) {
  return new Promise((resolve, reject) => {
    var httpReq = new XMLHttpRequest();
    httpReq.open("POST", "http://localhost:3000/shadertoy", true);
    httpReq.responseType = "json";
    httpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    var str = "{ \"shaders\" : [\"" + shaderIDs.join('","') + "\"] }";
    str = "s=" + encodeURIComponent(str) + "&nt=0&nl=0&np=0";
    
    httpReq.onload = function() {
      var jsnShaders = httpReq.response;
      
      if (!jsnShaders || !Array.isArray(jsnShaders)) {
        reject(new Error("Failed to load shader data: " + httpReq.status + " " + httpReq.statusText));
        return;
      }
      
      const result = jsnShaders.map((shader, index) => {
        
        let imageUrl;
        imageUrl = "https://www.shadertoy.com/media/shaders/" + shaderIDs[index] + ".jpg";
        const name = shader.info.name || 'Unnamed Shader';
        const username = shader.info.username || 'Unknown User';
        const text = `${name} by ${username}`;
        
        return {
          id: shaderIDs[index],
          imageUrl: imageUrl,
          text: text
        };
      });
      
      resolve(result);
    };
    
    httpReq.onerror = function() {
      reject(new Error("Network error when fetching shader data"));
    };
    
    httpReq.send(str);
  });
}

// const { shaderHistory } = await chrome.storage.local.get(['shaderHistory']);
// if(shaderHistory.length >= 10) {
//   shaderHistory = shaderHistory.slice(0, 9);
// }
// getShaderData(shaderHistory).then(data => {
//   populateHistoryItems(data);
// }).catch(error => {
//   console.error("Error fetching shader history:", error);
// });

getShaderData([
  "WcKXDV", "MsXfz4", "NslGRN", "Ms2SD1", "tdG3Rd", "33tGzN", "WsSBzh", "3lsSzf", "4ttSWf", "XfyXRV"
]).then(data => {
    if (shaderViewUI) {
      shaderViewUI.populateHistoryItems(data);
    }
  }).catch(error => {
    console.error("Error fetching shader data:", error);
});

// const { shaderHistory } = await chrome.storage.local.get(['shaderHistory']);
// getShaderData(shaderHistory).then(data => {
//     populateHistoryItems(data);
//   }).catch(error => {
//     console.error("Error fetching shader history:", error);
// });
