"use strict";

import './css/style.css'

import "./js/libs/piLibs.js";
import "./js/libs/effect.js";
import { initQualityManager } from "./js/quality.js";
import { watchInit } from "./js/libs/shadertoy.js";
import { populateHistoryItems, uiSetup } from "./js/ui.js";

// 3. Handle global variables
window.gShaderID = "WcKXDV";
window.gInvisIfFail = null;
window.gTime = "10";
window.gShowGui = false;
window.gPaused = false;
window.gMuted = true;

document.addEventListener("DOMContentLoaded", () => {
  uiSetup();
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

getShaderData([
  "WcKXDV", "MsXfz4", "NslGRN", "Ms2SD1", "tdG3Rd", "33tGzN", "WsSBzh", "3lsSzf", "4ttSWf", "XfyXRV"
]).then(data => {
    populateHistoryItems(data);
  }).catch(error => {
    console.error("Error fetching shader data:", error);
});
