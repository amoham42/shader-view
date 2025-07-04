import { loadShader, toggleFullscreen } from './libs/shadertoy.js';

export class ShaderViewUI {
  constructor() {
    this.body = document.body;
    this.timeout = null;
    this.eventListenersAdded = false;
    this.boundShowUI = this.showUI.bind(this);

    this.nameEl = document.querySelector('.shader__name');
    this.authorEl = document.querySelector('.shader__author');
    this.linkEl = document.querySelector('.shader__link');
    this.likeEl = document.querySelector('.like__impressions');
    this.viewEl = document.querySelector('.view__impressions');

    this.historyContent = document.querySelector('.history__content');
    this.closeBtn = document.querySelector('.history__close');

    this.canvas = document.getElementById('demogl');
    this.qualitySelect = document.getElementById('quality-select');

    this.snapshotBtn = document.querySelector('button[title="Snapshot"]');

    this.rewindBtn     = document.querySelector('button[title="Rewind"]');
    this.pauseBtn      = document.querySelector('button[title="Pause"]');
    this.fullscreenBtn = document.querySelector('button[title="Fullscreen"]');
  
    this.pauseIcon = document.getElementById('pause__icon');
    this.playIcon = document.getElementById('play__icon');
    
    // Quality management properties
    this.qualities = ['Low', 'Medium', 'High', 'Ultra'];
    this.currentQuality = 'High';
    this.boundOnQualityChange = this.onQualityChange.bind(this);
    this.boundApplyQuality = this.applyQuality.bind(this);
    this.boundResizeHandler = this.applyQuality.bind(this);
  }

  async init() {
    if (!this.eventListenersAdded) {
      document.addEventListener('mousemove', this.boundShowUI);
      document.addEventListener('touchstart', this.boundShowUI);
      this.eventListenersAdded = true;
    }

    this.showUI();

    this.setupToggle({
      toggle: '.menu__toggle',
      close: '.menu__close',
      content: '.menu__content'
    });
    
    this.setupToggle({
      toggle: '.history__toggle',
      close: '.history__close',
      content: '.history__content',
    });

    this.initSnapshot();
    await this.initQuality();

    loadShader(window.gShaderID);
    this.interactionButtonsInit();
  }

  showUI() {
    this.body.classList.add('ui-active');

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
        this.body.classList.remove('ui-active');
    }, 2000);
  }

  setupToggle({toggle, close, content}) {
    const toggleBtn = document.querySelector(toggle);
    const closeBtn = document.querySelector(close);
    const contentSelector = document.querySelector(content);
    
    if (!toggleBtn || !closeBtn || !contentSelector) return;
    [toggleBtn, closeBtn].forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtn.classList.toggle('hidden');
        closeBtn.classList.toggle('hidden');
        contentSelector.classList.toggle('hidden');
      });
    });
  }

  dispose() {
    if (this.eventListenersAdded) {
      document.removeEventListener('mousemove', this.boundShowUI);
      document.removeEventListener('touchstart', this.boundShowUI);
      this.eventListenersAdded = false;
    }
    
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    // Quality management cleanup
    if (this.qualitySelect) {
      this.qualitySelect.removeEventListener('change', this.boundOnQualityChange);
    }
    
    if (this.boundResizeHandler) {
      window.removeEventListener('resize', this.boundResizeHandler);
    }
  }

  updateShaderInfo(info) {
    if (this.nameEl) this.nameEl.textContent = info.name;
    if (this.authorEl) this.authorEl.textContent = `by ${info.username}`;
    if (this.linkEl) this.linkEl.href = `https://www.shadertoy.com/view/${window.gShaderID}`;
    if (this.likeEl) this.likeEl.textContent = info.likes;
    if (this.viewEl) this.viewEl.textContent = info.viewed;
  }

  populateHistoryItems(data) {
    this.historyContent.innerHTML = '';

    for (let i = 0; i < 10; i++) {
      const historyItem = document.createElement('div');
      historyItem.className = 'history__item transition-opacity';

      const item = data[i];
      if (item) {
        historyItem.classList.add(
          'cursor-pointer',
          'hover:opacity-80'
        );

        const img = document.createElement('img');
        img.src = item.imageUrl;
        img.alt = `Item ${i + 1}`;
        img.className = 'item__image';

        const textOverlay = document.createElement('div');
        textOverlay.className = 'item__text-overlay';
        textOverlay.textContent = item.text;

        historyItem.addEventListener('click', () => {
          console.log(`Loading shader: ${item.id}`);
          loadShader(item.id);

          if (this.closeBtn) this.closeBtn.click();
        });

        historyItem.appendChild(img);
        historyItem.appendChild(textOverlay);
      } else {
        historyItem.classList.add('cursor-default');

        const img = document.createElement('img');
        img.src = '/placeholder-600x400.png';
        img.className = 'item__image';
        historyItem.appendChild(img);
      }

      this.historyContent.appendChild(historyItem);
    }
  }

  initSnapshot() {
    this.snapshotBtn.addEventListener('click', () => {
      this.canvas.toBlob(
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
  }

  // Quality management methods
  async initQuality() {
    await this.loadQualitySetting();
    if (this.qualitySelect) {
      this.qualitySelect.value = this.currentQuality;
      this.qualitySelect.addEventListener('change', this.boundOnQualityChange);
    }
    
    window.addEventListener('resize', this.boundResizeHandler);
  }

  onQualityChange(e) {
    const v = e.target.value;
    this.currentQuality = v; // Keep capitalized to match HTML options
    this.saveQualitySetting();
    this.applyQuality();
  }

  async saveQualitySetting() {
    try {
      // await chrome.storage.local.set({ canvasQuality: this.currentQuality });
    } catch (err) {
      console.warn('Could not save quality:', err);
    }
  }

  async loadQualitySetting() {
    try {
      // const res = await chrome.storage.local.get(['canvasQuality']);
      // if (res.canvasQuality) {
      //   this.currentQuality = res.canvasQuality;
      // } else {
      //   await this.saveQualitySetting();
      // }
    } catch (err) {
      console.warn('Could not load quality:', err);
      await this.saveQualitySetting();
    }
  }
  
  getResolutionScale() {
    switch (this.currentQuality.toLowerCase()) {
      case 'low':    return 0.25;
      case 'medium': return 0.5;
      case 'high':   return 0.75;
      case 'ultra':  return 1.0;
      default:       return 1.0;
    }
  }

  applyQuality() {
    const resScale = this.getResolutionScale();
    if (window.gShaderToy && window.gShaderToy.mEffect && window.gShaderToy.mCreated && !window.gShaderToy.mDisposed) {
      window.gShaderToy.mEffect.SetQualityScale(resScale);
    }
    if (this.canvas) {
      this.canvas.style.width = `100%`;
      this.canvas.style.height = `100%`;
    }
  }

  interactionButtonsInit() {
   
    if (!this.rewindBtn || !this.pauseBtn || !this.fullscreenBtn) {
        console.warn('One or more interaction buttons not found');
        return;
    }

    this.rewindBtn.addEventListener('click', () => {
        if (window.gShaderToy) {
            window.gShaderToy.resetTime();
        }
    });
  
    this.pauseBtn.addEventListener('click', () => {
        if (!window.gShaderToy) return;
        window.gShaderToy.pauseTime();
        if (window.gShaderToy.mIsPaused) {
            this.pauseIcon.classList.add('hidden');
            this.playIcon.classList.remove('hidden');
            this.pauseBtn.title = 'Play';
        } else {
            this.pauseIcon.classList.remove('hidden');
            this.playIcon.classList.add('hidden');
            this.pauseBtn.title = 'Pause';
        }
    });
  
    this.fullscreenBtn.addEventListener('click', () => {
        if (!window.gShaderToy) return;
        toggleFullscreen();
    });
}
}