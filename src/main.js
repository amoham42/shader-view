"use strict";

import './css/style.css'

import "./js/libs/piLibs.js";
import "./js/libs/effect.js";
import { watchInit } from "./js/libs/shadertoy.js";

// 3. Handle global variables
window.gShaderID = "WcKXDV";
window.gInvisIfFail = null;
window.gTime = "10";
window.gShowGui = false;
window.gPaused = false;
window.gMuted = true;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof watchInit === "function") watchInit();
  else console.error("watchInit function not found!");
});

document.addEventListener('DOMContentLoaded', () => {
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
});