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

document.querySelector(".like__impressions").innerHTML = "100";
document.querySelector(".view__impressions").innerHTML = "100";