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

// fetch("https://raw.githubusercontent.com/amoham42/shader-view/main/public/shaders.txt")
//   .then(res => res.text())
//   .then(text => {
//     const shaderIDs = JSON.parse(`[${text.trim()}]`);
//     const randomIndex = Math.floor(Math.random() * shaderIDs.length);
//     window.shaderHistoryManager.addToHistory(shaderIDs[randomIndex]);
//     window.shaderHistoryManager.saveHistory();
    
//   }).then(() => {
//     window.shaderHistoryManager.loadHistory().then(data => {
//       getShaderData(data).then(newData => {
//         if (window.shaderViewUI) window.shaderViewUI.populateHistoryItems(newData);
//       }); 
//     });
//   }).catch(error => {
//     console.error("Error loading shader history:", error);
//   });

fetch("https://raw.githubusercontent.com/amoham42/shader-view/main/public/shaders.txt")
  .then(res => res.text())
  .then(text => {
    const shaderIDs = JSON.parse(`[${text.trim()}]`);
    return getShaderData(shaderIDs);
  })
  .then(data => {
    window.shaderViewUI?.populateHistoryItems(data);
  })
  .catch(console.error);