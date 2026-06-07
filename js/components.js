async function loadComponent(selector, file) {
    const element = document.querySelector(selector);

    if (!element) return;

    const response = await fetch(file);

    if (!response.ok) {
        throw new Error(`Failed to load ${file}`);
    }

    const html = await response.text();
    element.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Load header first
        if (document.querySelector('#header')) {
            await loadComponent(
                '#header',
                '/lishaqsolutions/templates/header.html'
            );
        }

        // Load footer next
        if (document.querySelector('#footer')) {
            await loadComponent(
                '#footer',
                '/lishaqsolutions/templates/footer.html'
            );
        }

        // After ALL components are loaded,
        // tell dynamic.js to populate placeholders
        document.dispatchEvent(new Event('componentsLoaded'));

    } catch (error) {
        console.error('Error loading components:', error);
    }
});