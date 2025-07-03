class QualityManager {
  constructor() {
    this.canvas = document.getElementById('demogl');
    this.qualitySelect = document.getElementById('quality-select');

    this.qualities = ['Low', 'Medium', 'High'];
    this.currentQuality = 'High';

    this.init();
  }

  async init() {
    await this.loadQualitySetting();
    
    // Initialize the select with the current quality
    this.qualitySelect.value = this.currentQuality;

    this.qualitySelect.addEventListener(
      'change', this.onSelectChange.bind(this)
    );
  }

  onSelectChange(e) {
    const v = e.target.value;
    this.currentQuality = v.toLowerCase();
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
    if (window.gShaderToy && window.gShaderToy.mEffect) {
      window.gShaderToy.mEffect.SetQualityScale(resScale);
    }
    this.canvas.style.width = `100%`;
    this.canvas.style.height = `100%`;
  }
}

export function initQualityManager() {
  window.qualityManager = new QualityManager();
  window.addEventListener('resize', () => {
    if (window.qualityManager) {
      window.qualityManager.applyQuality();
    }
  });
  window.qualityManager.qualitySelect.value = window.qualityManager.currentQuality;
}