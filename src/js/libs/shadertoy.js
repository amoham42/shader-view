"use strict"

import { 
    piGetCoords,
    piIsFullScreen,
    piRequestFullScreen,
    piExitFullScreen,
    piGetSourceElement
} from './piLibs.js';
import { uiInit } from "../ui.js";
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
        this.mTOffset = gTime * 1000;
        this.mCanvas = null;
        this.mFpsFrame = 0;
        this.mFpsTo = null;
        this.mIsPaused = gPaused;
        this.mForceFrame = true;
        this.mInfo = null;
        this.mCode = null;

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

        // --- audio context ---------------------
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
            me.mEffect.SetKeyDown(0, ev.keyCode);
            if (me.mIsPaused) me.mForceFrame = true;
        };
        this.mCanvas.onkeyup = function (ev) {
            me.mEffect.SetKeyUp(0, ev.keyCode);
            if (me.mIsPaused) me.mForceFrame = true;
        };

        this.mCanvas.ondblclick = function (ev) {
            if (piIsFullScreen() == false) {
                piRequestFullScreen(me.mCanvas);
                me.mCanvas.focus(); // put mouse/keyboard focus on canvas
            } else {
                piExitFullScreen();
            }
        };

        var resizeCB = function (xres, yres) { me.mForceFrame = true; };
        var crashCB = function () { };
        this.mEffect = new Effect(null, this.mAudioContext, this.mCanvas, this.RefreshTexturThumbail, this, gMuted, false, resizeCB, crashCB);
        this.mCreated = true;
    }
    startRendering() {
        var me = this;
        function renderLoop2() {
            requestAnimFrame(renderLoop2);
            if (me.mIsPaused && !me.mForceFrame) {
                me.mEffect.UpdateInputs(0, false);
                return;
            }

            me.mForceFrame = false;
            var time = getRealTime();
            var ltime = me.mTOffset + time - me.mTo;
            if (me.mIsPaused) ltime = me.mTf; else me.mTf = ltime;
            var dtime = 1000.0 / 60.0;
            me.mEffect.Paint(ltime / 1000.0, dtime / 1000.0, 60, me.mMouseOriX, me.mMouseOriY, me.mMousePosX, me.mMousePosY, me.mIsPaused);
            me.mFpsFrame++;
        }

        renderLoop2();
    }
    //---------------------------------
    Stop() {
        document.getElementById("myPauseButton").style.background = "url('/img/playEmbed.png')";
        this.mIsPaused = true;
        this.mEffect.StopOutputs();
    }
    pauseTime() {
        var time = getRealTime();
        if (!this.mIsPaused) {
            this.Stop();
        }

        else {
            document.getElementById("myPauseButton").style.background = "url('/img/pauseEmbed.png')";
            this.mTOffset = this.mTf;
            this.mTo = time;
            this.mIsPaused = false;
            this.mEffect.ResumeOutputs();
            this.mCanvas.focus(); // put mouse/keyboard focus on canvas
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
        this.mCanvas.focus(); // put mouse/keyboard focus on canvas
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
}

export function iCompileAndStart( viewerParent, jsnShader ) {
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
            window.gShaderToy.startRendering();
        });
    }
}

export function watchInit() {
      //-- shadertoy --------------------------------------------------------
    var viewerParent = document.getElementById("player");
    document.body.addEventListener( "keydown", function(e) {
        var ele = piGetSourceElement(e)
        if( e.key === 8 && ele === document.body )
            e.preventDefault();
    });
    //-- get info --------------------------------------------------------

    var httpReq = new XMLHttpRequest();
    httpReq.open( "POST", "http://localhost:3000/shadertoy", true );
    httpReq.responseType = "json";
    httpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var str = "{ \"shaders\" : [\"" + gShaderID + "\"] }";
    str = "s=" + encodeURIComponent(str) + "&nt=0&nl=0&np=0";;
    httpReq.onload = function() {
        var jsnShader = httpReq.response;
        if (!jsnShader || !jsnShader[0] || !jsnShader[0].info) {
            console.error("Failed to load shader data:", httpReq.status, httpReq.statusText);
            return;
        }

        uiInit(jsnShader[0].info);
        if (jsnShader[0].info.usePreview === 1) {
            let url = "/media/shaders/" + gShaderID + ".jpg";
            var img = new Image();
            img.style = "width:100%;";
            img.onload = function () {
                viewerParent.appendChild(img);
            };
            img.onerror = function (ev) { iCompileAndStart(viewerParent, jsnShader); };
            img.src = url;
        } else {
            iCompileAndStart(viewerParent, jsnShader);
        }
    }
    
    httpReq.onerror = function() {
        console.error("Network error when fetching shader data");
    };
    httpReq.send( str );
}