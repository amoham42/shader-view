
function setupToggle({
    containerSelector,
    toggleSelector,
    closeSelector,
    openClass}) {

    const container = document.querySelector(containerSelector);
    const toggleBtn = document.querySelector(toggleSelector);
    const closeBtn = document.querySelector(closeSelector);
  
    if (!container || !toggleBtn || !closeBtn) return;
    [toggleBtn, closeBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            const isNowOpen = container.classList.toggle(openClass);
            toggleBtn.classList.toggle('hidden', isNowOpen);
            closeBtn.classList.toggle('hidden', !isNowOpen);
        });
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
        }, 2000); // Hide UI after 3 seconds of inactivity
    }

    document.addEventListener('mousemove', showUI);
    document.addEventListener('touchstart', showUI);
    showUI();
      
    setupToggle({
        containerSelector: '.menu',
        toggleSelector: '.menu__toggle',
        closeSelector: '.menu__close',
        openClass: 'menu--open'
    });
    
    setupToggle({
        containerSelector: '.history',
        toggleSelector: '.history__toggle',
        closeSelector: '.history__close',
        openClass: 'history--open'
    });
}