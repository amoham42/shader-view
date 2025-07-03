import { loadShader } from './libs/shadertoy.js';
import { initQualityManager } from './quality.js';

function setupToggle({
    toggleSelector,
    closeSelector,
    contentSelector,
}) {
    const toggleBtn = document.querySelector(toggleSelector);
    const closeBtn = document.querySelector(closeSelector);
    const content = document.querySelector(contentSelector);
    
    if (!toggleBtn || !closeBtn || !content) return;
    
    [toggleBtn, closeBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtn.classList.toggle('hidden');
            closeBtn.classList.toggle('hidden');
            content.classList.toggle('hidden');
        });
    });
}

export function populateHistoryItems(data) {
    const historyContent = document.querySelector('.history__content');
    // clear any existing items
    historyContent.innerHTML = '';
  
    // always render 10 slots
    for (let i = 0; i < 10; i++) {
      const historyItem = document.createElement('div');
      historyItem.className = 'history__item transition-opacity';
  
      const item = data[i];
      if (item) {
        // real data → clickable
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
  
          const closeBtn = document.querySelector('.history__close');
          if (closeBtn) closeBtn.click();
        });
  
        historyItem.appendChild(img);
        historyItem.appendChild(textOverlay);
      } else {
        // placeholder → non-clickable
        historyItem.classList.add('cursor-default');

        const img = document.createElement('img');
        img.src = '/placeholder-600x400.png';
        img.className = 'item__image';
        historyItem.appendChild(img);
      }
  
      historyContent.appendChild(historyItem);
    }
  }

export function uiSetup() {
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
        toggleSelector: '.menu__toggle',
        closeSelector: '.menu__close',
        contentSelector: '.menu__content'
    });
    
    setupToggle({
        toggleSelector: '.history__toggle',
        closeSelector: '.history__close',
        contentSelector: '.history__content',
    });

}

export function updateShaderInfo(info) {
    const nameEl = document.querySelector('.shader__name');
    if (nameEl) nameEl.textContent = info.name;

    const authorEl = document.querySelector('.shader__author');
    if (authorEl) authorEl.textContent = `by ${info.username}`;

    const linkEl = document.querySelector('.shader__link');
    if (linkEl) linkEl.href = `https://www.shadertoy.com/view/${window.gShaderID}`;

    const likeEl = document.querySelector('.like__impressions');
    if (likeEl) likeEl.textContent = info.likes;

    const viewEl = document.querySelector('.view__impressions');
    if (viewEl) viewEl.textContent = info.viewed;
}

export function uiInit(info) {
    updateShaderInfo(info);
}