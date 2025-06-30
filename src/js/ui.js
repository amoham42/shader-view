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
        }, 3000); // Hide UI after 3 seconds of inactivity
    }

    document.addEventListener('mousemove', showUI);
    document.addEventListener('touchstart', showUI);
    showUI();

    // Handle menu toggle
    const menu = document.querySelector('.menu');
    const menuToggle = document.querySelector('.menu__toggle');
    const menuClose = document.querySelector('.menu__close');

    menuToggle.addEventListener('click', () => {
        menu.classList.add('menu--open');
    });

    menuClose.addEventListener('click', () => {
        menu.classList.remove('menu--open');
    });

    // Handle history toggle
    const history = document.querySelector('.history');
    const historyToggle = document.querySelector('.history__toggle');
    const historyClose = document.querySelector('.history__close');

    historyToggle.addEventListener('click', () => {
        history.classList.add('history--open');
    });

    historyClose.addEventListener('click', () => {
        history.classList.remove('history--open');
    });
}