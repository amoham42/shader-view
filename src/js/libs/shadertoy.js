"use strict"

const DEBUG = false;

import { 
    piGetCoords,
    piIsFullScreen,
    piRequestFullScreen,
    piExitFullScreen,
    piGetSourceElement
} from './piLibs.js';
import { Effect } from "./effect.js";
window.gShaderToy = null;

class ShaderToy {
    constructor(parentElement) {
        if (parentElement === null) return;

        this.mAudioContext = null;
        this.mCreated = false;
        this.mHttpReq = null;
        this.mEffect = null;
        this.mTo = null;
        this.mTOffset = 10 * 1000;
        this.mCanvas = null;
        this.mFpsFrame = 0;
        this.mFpsTo = null;
        this.mIsPaused = window.mIsPaused || false;
        this.mForceFrame = true;
        this.mInfo = null;
        this.mCode = null;
        this.mAnimationFrameId = null;
        this.mDisposed = false;

        this.mCanvas = document.getElementById("demogl");
        this.previewImg = document.getElementById("preview");

        this.mCanvas.tabIndex = "0";

        var ww = parentElement.offsetWidth;
        var hh = parentElement.offsetHeight;

        var me = this;
        this.mCanvas.width = ww;
        this.mCanvas.height = hh;

        this.mHttpReq = new XMLHttpRequest();
        this.mTo = getRealTime();
        this.mTf = this.mTOffset;
        this.mFpsTo = this.mTo;
        this.mMouseIsDown = false;
        this.mMouseOriX = 0;
        this.mMouseOriY = 0;
        this.mMousePosX = 0;
        this.mMousePosY = 0;

        this.mCanvas.onmousedown = function (ev) {
            var pos = piGetCoords(me.mCanvas);
            me.mMouseOriX = (ev.pageX - pos.mX) * me.mCanvas.width / me.mCanvas.offsetWidth;
            me.mMouseOriY = me.mCanvas.height - (ev.pageY - pos.mY) * me.mCanvas.height / me.mCanvas.offsetHeight;
            me.mMousePosX = me.mMouseOriX;
            me.mMousePosY = me.mMouseOriY;
            me.mMouseIsDown = true;
            if (me.mIsPaused) me.mForceFrame = true;
        };
        this.mCanvas.onmousemove = function (ev) {
            if (me.mMouseIsDown) {
                var pos = piGetCoords(me.mCanvas);
                me.mMousePosX = (ev.pageX - pos.mX) * me.mCanvas.width / me.mCanvas.offsetWidth;
                me.mMousePosY = me.mCanvas.height - (ev.pageY - pos.mY) * me.mCanvas.height / me.mCanvas.offsetHeight;
                if (me.mIsPaused) me.mForceFrame = true;
            }
        };
        this.mCanvas.onmouseup = function (ev) {
            me.mMouseIsDown = false;
            me.mMouseOriX = -Math.abs(me.mMouseOriX);
            me.mMouseOriY = -Math.abs(me.mMouseOriY);
            if (me.mIsPaused) me.mForceFrame = true;
        };

        this.mCanvas.onkeydown = function (ev) {
            if (me.mEffect && !me.mDisposed) {
                me.mEffect.SetKeyDown(0, ev.keyCode);
                if (me.mIsPaused) me.mForceFrame = true;
            }
        };
        this.mCanvas.onkeyup = function (ev) {
            if (me.mEffect && !me.mDisposed) {
                me.mEffect.SetKeyUp(0, ev.keyCode);
                if (me.mIsPaused) me.mForceFrame = true;
            }
        };

        this.mCanvas.ondblclick = function (ev) {
            if (piIsFullScreen() == false) {
                piRequestFullScreen(me.mCanvas);
                me.mCanvas.focus();
            } else {
                piExitFullScreen();
            }
            if (me.mIsPaused) me.mForceFrame = true;
        };

        var resizeCB = function (xres, yres) { me.mForceFrame = true; };
        var crashCB = function () { console.error("ShaderToy: Effect crashed!"); };
        this.mEffect = new Effect(null, this.mAudioContext, this.mCanvas, this.RefreshTexturThumbail, this, true, false, resizeCB, crashCB);
        this.mCreated = true;
    }
    startRendering() {
        var me = this;
        function renderLoop2() {
            if (me.mDisposed || !me.mCreated || !me.mEffect) {
                return;
            }
            
            me.mAnimationFrameId = requestAnimFrame(renderLoop2);
            if (me.mIsPaused && !me.mForceFrame) {
                if (me.mEffect && !me.mDisposed) {
                    me.mEffect.UpdateInputs(0, false);
                }
                return;
            }
            me.mForceFrame = false;
            var time = getRealTime();
            var ltime = me.mTOffset + time - me.mTo;
            if (me.mIsPaused) ltime = me.mTf; else me.mTf = ltime;
            var dtime = 1000.0 / 60.0;
            
            if (me.mEffect && !me.mDisposed) {
                me.mEffect.Paint(ltime / 1000.0, dtime / 1000.0, 60, me.mMouseOriX, me.mMouseOriY, me.mMousePosX, me.mMousePosY, me.mIsPaused);
                if (me.mFpsFrame === 0) me.RemovePreview();
                me.mFpsFrame++;
            }
        }

        renderLoop2();
    }

    RemovePreview() {
        this.previewImg.classList.remove("opacity-100");
        this.previewImg.classList.add("opacity-0");
        setTimeout(() => {
            this.previewImg.classList.add("hidden");
        }, 500);
    }
    
    Stop() {
        this.mIsPaused = true;
        if (this.mEffect && !this.mDisposed) {
            this.mEffect.StopOutputs();
        }
    }
    pauseTime() {
        var time = getRealTime();
        if (!this.mIsPaused) {
            this.Stop();
        }

        else {
            this.mTOffset = this.mTf;
            this.mTo = time;
            this.mIsPaused = false;
            this.mEffect.ResumeOutputs();
            this.mCanvas.focus();
        }
    }
    resetTime() {
        this.mTOffset = 0;
        this.mTo = getRealTime();
        this.mTf = 0;
        this.mFpsTo = this.mTo;
        this.mFpsFrame = 0;
        this.mForceFrame = true;
        this.mEffect.ResetTime();
        this.mCanvas.focus();
    }
    PauseInput(id) {
        return this.mEffect.PauseInput(0, id);
    }
    RewindInput(id) {
        this.mEffect.RewindInput(0, id);
        this.mCanvas.focus();
    }
    SetTexture(slot, url) {
        this.mEffect.NewTexture(0, slot, url);
    }
    RefreshTexturThumbail(myself, slot, img, forceFrame, gui, guiID, time) {
        myself.mForceFrame = forceFrame;
    }
    GetTotalCompilationTime() {
        return this.mEffect.GetTotalCompilationTime();
    }
    Load(jsn) {
        try {
            var res = this.mEffect.Load(jsn, false);
            this.mCode = res.mShader;

            if (res.mFailed === false) {
                this.mForceFrame = true;
            }

            this.mInfo = jsn.info;
            return {
                mFailed: false,
                mDate: jsn.info.date,
                mViewed: jsn.info.viewed,
                mName: jsn.info.name,
                mUserName: jsn.info.username,
                mDescription: jsn.info.description,
                mLikes: jsn.info.likes,
                mPublished: jsn.info.published,
                mHasLiked: jsn.info.hasliked,
                mTags: jsn.info.tags
            };
        }
        catch (e) {
            return { mFailed: true };
        }
    }
    Compile(onResolve) {
        this.mEffect.Compile(true, onResolve);
    }

    OneFrame() {
        if (this.mIsPaused) this.mForceFrame = true;
    }

    dispose() {
        if (!this.mCreated || this.mDisposed) return;
        
        this.mDisposed = true;
        
        if (this.mAnimationFrameId) {
            cancelAnimationFrame(this.mAnimationFrameId);
            this.mAnimationFrameId = null;
        }
        
        this.Stop();
        if (this.mEffect) {
            this.mEffect.StopOutputs();
            this.mEffect.dispose();
            this.mEffect = null;
        }

        this.mCreated = false;
    }
}

function iCompileAndStart( viewerParent, jsnShader ) {

    if (window.gShaderToy && window.gShaderToy.mCreated) {
        window.gShaderToy.dispose();
    }
    
    window.gShaderToy = new ShaderToy( viewerParent, null );
    if( !window.gShaderToy.mCreated ) {
        if( gInvisIfFail!==null ) {
          var div = document.createElement("img");
          div.src = gInvisIfFail;
          var root = document.getElementsByTagName("body")[0];
          root.replaceChild( div, viewerParent );
        }
        return;
    }

    var gRes = window.gShaderToy.Load(jsnShader[0])
    if (gRes.mFailed) {
        window.gShaderToy.pauseTime();
        window.gShaderToy.resetTime();
    } else {
        window.gShaderToy.Compile( function (worked) {
            if (!worked) return;
            if (window.gShaderToy.mIsPaused) window.gShaderToy.Stop();
            if (window.shaderViewUI) window.shaderViewUI.applyQuality();
            
            window.gShaderToy.startRendering();
        });
    }
}

export function toggleFullscreen() {
    const canvas = window.gShaderToy.mCanvas;
    if (piIsFullScreen() == false) {
        piRequestFullScreen(canvas);
        canvas.focus();
    } else {
        piExitFullScreen();
    }
}

function processShaderData(jsnShader) {
    let viewerParent = document.getElementById("player");
    window.shaderViewUI.updateShaderInfo(jsnShader[0].info);
    iCompileAndStart(viewerParent, jsnShader);
}

function fetchShaderFromServer(shaderID) {
    let httpReq = new XMLHttpRequest();
    httpReq.open("POST", window.API_CONFIG, true);
    httpReq.responseType = "json";
    httpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    let str = "{ \"shaders\" : [\"" + shaderID + "\"] }";
    str = "s=" + encodeURIComponent(str) + "&nt=0&nl=0&np=0";
    
    httpReq.onload = function() {
        let jsnShader = httpReq.response;
        if (!jsnShader || !jsnShader[0] || !jsnShader[0].info) {
            console.error("Failed to load shader data:", httpReq.status, httpReq.statusText);
            return;
        }

        const storageKey = `shader_${shaderID}`;
        const dataToStore = {
            data: jsnShader,
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

        processShaderData(jsnShader);
    }
    
    httpReq.onerror = function() {
        console.error("Network error when fetching shader data");
    };
    
    httpReq.send(str);
}

export function loadShader(shaderID) {
    window.gShaderID = shaderID;

    if (window.gShaderToy && window.gShaderToy.mCreated) {
        window.gShaderToy.dispose();
    }
    
    const storageKey = `shader_${shaderID}`;
    chrome.storage.local.get([storageKey], function(result) {
        if (chrome.runtime.lastError) {
            if (DEBUG) console.warn("Storage access error:", chrome.runtime.lastError);
            fetchShaderFromServer(shaderID);
            return;
        }

        const cachedData = result[storageKey];
        if (cachedData && cachedData.data) {
            if (DEBUG) console.log("Loading shader from cache:", shaderID);
            processShaderData(cachedData.data);
        } else {
            if (DEBUG) console.log("Shader not in cache, fetching from server:", shaderID);
            fetchShaderFromServer(shaderID);
        }
    });
}