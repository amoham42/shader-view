"use strict";

import './css/style.css'
import { ShaderViewUI } from "./js/ui.js";
import { ShaderHistoryManager } from "./js/history.js";

// 3. Handle global variables
window.gShaderID = "WcKXDV";

document.addEventListener("DOMContentLoaded", () => {
  window.shaderViewUI = new ShaderViewUI();
  window.shaderHistoryManager = new ShaderHistoryManager();
  window.shaderViewUI.init();
});

window.addEventListener('beforeunload', () => {
  if (window.shaderViewUI) {
    window.shaderViewUI.dispose();
  }
  
  if (window.gShaderToy && window.gShaderToy.mCreated) {
    window.gShaderToy.dispose();
  }
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

// shaderHistoryManager.loadHistory().then(data => {
//   getShaderData(data).then(newData => {
//     if (shaderViewUI) shaderViewUI.populateHistoryItems(newData);
//     shaderHistoryManager.addToHistory(newData[0].id);
//     shaderHistoryManager.saveHistory();
//   }).catch(error => {
//     console.error("Error fetching shader data:", error);
//   });
// }).catch(error => {
//   console.error("Error loading shader history:", error);
// });

getShaderData([
  "WcKXDV", "MsXfz4", "NslGRN", "Ms2SD1", "tdG3Rd", "33tGzN", "WsSBzh", "3lsSzf", "4ttSWf", "XfyXRV"
]).then(data => {
    if (window.shaderViewUI) {
      window.shaderViewUI.populateHistoryItems(data);
    }
  }).catch(error => {
    console.error("Error fetching shader data:", error);
});