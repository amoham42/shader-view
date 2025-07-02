import { loadShader } from './libs/shadertoy.js';
// import { QualityManager } from './quality.js';

function setupToggle({
    containerSelector,
    toggleSelector,
    closeSelector,
    openClass,
    contentSelector,
    additionalToggleSelectors = [],
    additionalToggleClass = null
}) {
    const container = document.querySelector(containerSelector);
    const toggleBtn = document.querySelector(toggleSelector);
    const closeBtn = document.querySelector(closeSelector);
    const content = document.querySelector(contentSelector);
    
    // Get additional elements to toggle classes on
    const additionalElements = additionalToggleSelectors
        .map(selector => document.querySelector(selector))
        .filter(Boolean);
  
    if (!container || !toggleBtn || !closeBtn || !content) return;
    
    [toggleBtn, closeBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            const isNowOpen = container.classList.toggle(openClass);
            toggleBtn.classList.toggle('hidden', isNowOpen);
            closeBtn.classList.toggle('hidden', !isNowOpen);
            content.classList.toggle('hidden', !isNowOpen);
            
            // Toggle class on additional elements
            const classToToggle = additionalToggleClass || openClass;
            additionalElements.forEach(element => {
                element.classList.toggle(classToToggle, isNowOpen);
            });
        });
    });
}

export function populateHistoryItems(data) {
    const historyContent = document.querySelector('.history__content');
    
    data.forEach((item, index) => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history__item cursor-pointer hover:opacity-80 transition-opacity';
      
      const img = document.createElement('img');
      img.src = item.imageUrl;
      img.alt = `Item ${index + 1}`;
      img.className = 'item__image';
      
      const textOverlay = document.createElement('div');
      textOverlay.className = 'item__text-overlay';
      textOverlay.textContent = item.text;
      
      // Add click event listener to change shader
      historyItem.addEventListener('click', () => {
        console.log(`Loading shader: ${item.id}`);
        loadShader(item.id);
        
        // Properly close the history panel by managing toggle state
        const historyContainer = document.querySelector('.history');
        const toggleBtn = document.querySelector('.history__toggle');
        const closeBtn = document.querySelector('.history__close');
        const content = document.querySelector('.history__content');
        const masterContainer = document.querySelector('.master__container');
        
        if (historyContainer && toggleBtn && closeBtn && content) {
          // Remove the open state
          historyContainer.classList.remove('history--open');
          toggleBtn.classList.remove('hidden');
          closeBtn.classList.add('hidden');
          content.classList.add('hidden');
          
          // Remove additional toggle classes
          if (masterContainer) {
            masterContainer.classList.remove('history-open');
          }
          content.classList.remove('history-open');
        }
      });
      
      historyItem.appendChild(img);
      historyItem.appendChild(textOverlay);
      historyContent.appendChild(historyItem);
    });
  }

export function uiInit(info) {
    const nameEl = document.querySelector('.shader__name');
    if (nameEl) nameEl.textContent = info.name;

    const authorEl = document.querySelector('.shader__author');
    if (authorEl) authorEl.textContent = `by ${info.username}`;

    const linkEl = document.querySelector('.shader__link');
    if (linkEl) linkEl.href = `https://www.shadertoy.com/view/${gShaderID}`;

    const likeEl = document.querySelector('.like__impressions');
    if (likeEl) likeEl.textContent = info.likes;

    const viewEl = document.querySelector('.view__impressions');
    if (viewEl) viewEl.textContent = info.viewed;

    let timeout;
    const body = document.body;

    function showUI() {
        body.classList.add('ui-active');
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            body.classList.remove('ui-active');
        }, 2000);
    }

    document.addEventListener('mousemove', showUI);
    document.addEventListener('touchstart', showUI);
    showUI();
      
    setupToggle({
        containerSelector: '.menu',
        toggleSelector: '.menu__toggle',
        closeSelector: '.menu__close',
        openClass: 'menu--open',
        contentSelector: '.menu__content'
    });
    
    setupToggle({
        containerSelector: '.history',
        toggleSelector: '.history__toggle',
        closeSelector: '.history__close',
        openClass: 'history--open',
        contentSelector: '.history__content',
        additionalToggleSelectors: ['.master__container', '.history__content'],
        additionalToggleClass: 'history-open'
    });

    // window.qualityManager = new QualityManager();

    // const qualityButton = document.querySelector('#quality__value');
    // qualityButton.addEventListener('click', () => window.qualityManager.cycleQuality());
}