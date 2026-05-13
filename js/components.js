async function loadComponent(selector, file) {
    const response = await fetch(file);
    const html = await response.text();
    document.querySelector(selector).innerHTML = html;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (document.querySelector('#header')) {
        await loadComponent('#header', 'templates/header.html');
    }

    if (document.querySelector('#footer')) {
        await loadComponent('#footer', 'templates/footer.html');
    }
});