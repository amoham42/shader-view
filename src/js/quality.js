class QualityManager {
  constructor() {
    this.canvas = document.getElementById('demogl');
    this.qualitySelect = document.getElementById('quality-select');

    this.qualities = ['Low', 'Medium', 'High', 'Ultra'];
    this.currentQuality = 'High';
    this.boundOnSelectChange = this.onSelectChange.bind(this);
    this.boundApplyQuality = this.applyQuality.bind(this);

    this.init();
  }

  async init() {
    await this.loadQualitySetting();
    this.qualitySelect.value = this.currentQuality;

    this.qualitySelect.addEventListener(
      'change', this.boundOnSelectChange
    );
  }

  dispose() {
    if (this.qualitySelect) {
      this.qualitySelect.removeEventListener('change', this.boundOnSelectChange);
    }
    
    if (this.boundResizeHandler) {
      window.removeEventListener('resize', this.boundResizeHandler);
    }
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
    if (window.gShaderToy && window.gShaderToy.mEffect && window.gShaderToy.mCreated && !window.gShaderToy.mDisposed) {
      window.gShaderToy.mEffect.SetQualityScale(resScale);
    }
    this.canvas.style.width = `100%`;
    this.canvas.style.height = `100%`;
  }
}

export function initQualityManager() {
  window.qualityManager = new QualityManager();
  
  // Store bound function for cleanup
  window.qualityManager.boundResizeHandler = () => {
    if (window.qualityManager) {
      window.qualityManager.applyQuality();
    }
  };
  
  window.addEventListener('resize', window.qualityManager.boundResizeHandler);
  window.qualityManager.qualitySelect.value = window.qualityManager.currentQuality;
}