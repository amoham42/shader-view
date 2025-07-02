export class QualityManager {
    constructor() {
      this.canvas = document.getElementById('demogl');
      this.qualityButton = document.getElementById('quality__button');
      this.qualityText = document.getElementById('quality-text');
      
      this.qualities = ['Low', 'Medium', 'High'];
      this.currentQuality = 'High';
      
      this.init();
    }
  
    async init() {
      await this.loadQualitySetting();
      this.qualityButton.addEventListener('click', () => {
        this.cycleQuality();
      });
      
      this.applyQuality();
    }
  
    async loadQualitySetting() {
      try {
        const result = await chrome.storage.local.get(['canvasQuality']);
        if (result.canvasQuality) {
          this.currentQuality = result.canvasQuality;
        } else {
          // Save the default quality setting if none exists
          await this.saveQualitySetting();
        }
      } catch (error) {
        console.warn('Could not load quality setting:', error);
        // Save the default quality setting even if loading failed
        await this.saveQualitySetting();
      }
    }
  
    async saveQualitySetting() {
      try {
        await chrome.storage.local.set({ canvasQuality: this.currentQuality });
      } catch (error) {
        console.warn('Could not save quality setting:', error);
      }
    }
  
    cycleQuality() {
      const currentIndex = this.qualities.indexOf(this.currentQuality);
      const nextIndex = (currentIndex + 1) % this.qualities.length;
      this.currentQuality = this.qualities[nextIndex];
      this.qualityText.textContent = this.currentQuality;
      this.saveQualitySetting();
      this.applyQuality();
    }
  
    getResolutionScale() {
      switch (this.currentQuality) {
        case 'Low':
          return 0.5;
        case 'Medium':
          return 0.75;
        case 'High':
          return 1.0;
        default:
          return 1.0;
      }
    }
  
    applyQuality() {
      const scale = this.getResolutionScale();
      const container = this.canvas.parentElement;
      
      const displayWidth = container.clientWidth;
      const displayHeight = container.clientHeight;
      
      const renderWidth = Math.floor(displayWidth * scale);
      const renderHeight = Math.floor(displayHeight * scale);
      
      this.canvas.width = renderWidth;
      this.canvas.height = renderHeight;
      
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      
      this.qualityText.textContent = this.currentQuality;
      this.onQualityChange(renderWidth, renderHeight, scale);
    }
  
    onQualityChange(width, height, scale) {
      const event = new CustomEvent('qualityChanged', {
        detail: {
          width,
          height,
          scale,
          quality: this.currentQuality
        }
      });
      this.canvas.dispatchEvent(event);
      const gl = this.canvas.getContext('webgl') || this.canvas.getContext('webgl2');
      if (gl) {
        gl.viewport(0, 0, width, height);
      }
    }
  
    getCurrentQuality() {
      return {
        quality: this.currentQuality,
        scale: this.getResolutionScale(),
        width: this.canvas.width,
        height: this.canvas.height
      };
    }
}
  
document.addEventListener('DOMContentLoaded', () => {
    window.qualityManager = new QualityManager();
});

window.addEventListener('resize', () => {
    if (window.qualityManager) {
      window.qualityManager.applyQuality();
    }
});