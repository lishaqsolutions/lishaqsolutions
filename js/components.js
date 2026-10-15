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

function loadChatWidget() {
    // Prevent loading the widget script more than once.
    if (document.querySelector("[data-lishaq-chat-widget]")) {
        return;
    }

    const chatScript = document.createElement("script");

    chatScript.src = "/js/chat-widget.js";
    chatScript.dataset.lishaqChatWidget = "true";
    chatScript.async = true;

    chatScript.onerror = () => {
        console.error("Failed to load Lishaq AI chat widget.");
    };

    document.body.appendChild(chatScript);
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Load header first.
        if (document.querySelector("#header")) {
            await loadComponent(
                "#header",
                "/templates/header.html"
            );
        }

        // Load footer next.
        if (document.querySelector("#footer")) {
            await loadComponent(
                "#footer",
                "/templates/footer.html"
            );
        }
    } catch (error) {
        console.error("Error loading components:", error);
    } finally {
        // Notify other scripts after the component-loading attempt.
        document.dispatchEvent(new Event("componentsLoaded"));

        // Load the chat widget even if a component fails.
        loadChatWidget();
    }
});
