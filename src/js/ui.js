export function uiInit(info) {
    const nameElement = document.querySelector('.shader__name');
    if (nameElement) {
        nameElement.textContent = info.name;
    }

    const authorElement = document.querySelector('.shader__author');
    if (authorElement) {
        authorElement.textContent = `by ${info.username}`;
    }

    // Update the shader link to point to the original
    const shaderLink = document.querySelector('.shader-link');
    if (shaderLink) {
        shaderLink.href = `https://www.shadertoy.com/view/${gShaderID}`;
    }

    // Add UI visibility handling
    let timeout;
    const body = document.body;

    function showUI() {
        body.classList.add('ui-active');
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            body.classList.remove('ui-active');
        }, 3000); // Hide UI after 3 seconds of inactivity
    }

    // Show UI on mouse movement
    document.addEventListener('mousemove', showUI);
    
    // Show UI on touch
    document.addEventListener('touchstart', showUI);

    // Show UI initially
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