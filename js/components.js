// async function loadComponent(selector, file) {
//     const response = await fetch(file);
//     const html = await response.text();
//     document.querySelector(selector).innerHTML = html;
// }

// document.addEventListener('DOMContentLoaded', async () => {
//     if (document.querySelector('#header')) {
//         await loadComponent('#header', '/lishaqsolutions/templates/header.html');
//     }

//     if (document.querySelector('#footer')) {
//         await loadComponent('#footer', '/lishaqsolutions/templates/footer.html');
//     }
// });


// js/components.js
// Loads header.html and footer.html, then dispatches custom events
// so dynamic.js can populate placeholders AFTER the templates are inserted.

(function () {
    function loadComponent(id, file) {
        const container = document.getElementById(id);

        // If the container does not exist on this page, do nothing.
        if (!container) return Promise.resolve();

        return fetch(file)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${file}`);
                }
                return response.text();
            })
            .then(html => {
                container.innerHTML = html;

                // Notify other scripts that this component has finished loading.
                document.dispatchEvent(
                    new CustomEvent("componentLoaded", {
                        detail: {
                            id: id,
                            file: file
                        }
                    })
                );
            })
            .catch(error => {
                console.error(`Error loading ${file}:`, error);
            });
    }

    // Load both header and footer.
    Promise.all([
        loadComponent("header", "/lishaqsolutions/template/header.html"),
        loadComponent("footer", "/lishaqsolutions/template/footer.html")
    ]).then(() => {
        // Notify that all components are fully loaded.
        document.dispatchEvent(new Event("componentsLoaded"));
    });
})();