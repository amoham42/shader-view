"use strict"

import { 
    piGetCoords,
    piIsFullScreen,
    piRequestFullScreen,
    piExitFullScreen,
    piGetSourceElement
} from './piLibs.js';
import { Effect } from "./effect.js";
window.gShaderToy = null;

export class ShaderToy {
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
        this.mIsPaused = false;
        this.mForceFrame = true;
        this.mInfo = null;
        this.mCode = null;
        this.mAnimationFrameId = null;
        this.mDisposed = false;

        this.mCanvas = document.getElementById("demogl");
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
        var crashCB = function () { };
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
                me.mFpsFrame++;
            }
        }

        renderLoop2();
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

export function iCompileAndStart( viewerParent, jsnShader ) {

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
            
            if (window.shaderViewUI) {
                window.shaderViewUI.applyQuality();
            }
            
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
    if (window.gShaderToy.mIsPaused) window.gShaderToy.mForceFrame = true;
}

export function loadShader(shaderID) {
    window.gShaderID = shaderID;

    if (window.gShaderToy && window.gShaderToy.mCreated) {
        window.gShaderToy.dispose();
    }
    
    let viewerParent = document.getElementById("player");
    const existingImages = viewerParent.querySelectorAll('img:not(#noWebGL_ShaderImage)');
    existingImages.forEach(img => img.remove());

    let httpReq = new XMLHttpRequest();
    httpReq.open("POST", "http://localhost:3000/shadertoy", true);
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

        if (window.shaderViewUI) window.shaderViewUI.updateShaderInfo(jsnShader[0].info);
        
        if (jsnShader[0].info.usePreview === 1) {
            let url = "/media/shaders/" + shaderID + ".jpg";
            let img = new Image();
            img.style = "width:100%;";
            img.onload = function () {
                viewerParent.appendChild(img);
            };
            img.onerror = function (ev) { 
                iCompileAndStart(viewerParent, jsnShader); 
            };
            img.src = url;
        } else {
            iCompileAndStart(viewerParent, jsnShader);
        }
    }
    
    httpReq.onerror = function() {
        console.error("Network error when fetching shader data");
    };
    
    httpReq.send(str);
}