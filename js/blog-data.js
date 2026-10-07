// Lishaq Solutions — Blog Data Layer
// Google Sheets API + client-side caching + shared helpers

(function () {
    "use strict";

    const CACHE_KEY = "lishaq_blog_cache_v2";
    const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

    let requestInFlight = null;

    // --------------------------------------------------
    // API
    // --------------------------------------------------

    function getApiUrl() {
        return window.SITE_CONFIG?.googleScript?.blogsApi || "";
    }

    // --------------------------------------------------
    // Cache
    // --------------------------------------------------

    function readCache() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);

            if (!raw) return null;

            const parsed = JSON.parse(raw);

            if (
                !parsed ||
                !Array.isArray(parsed.blogs) ||
                typeof parsed.timestamp !== "number"
            ) {
                return null;
            }

            return parsed;
        } catch (error) {
            console.warn("Blog cache could not be read:", error);
            return null;
        }
    }

    function writeCache(blogs) {
        try {
            localStorage.setItem(
                CACHE_KEY,
                JSON.stringify({
                    timestamp: Date.now(),
                    blogs
                })
            );
        } catch (error) {
            // Storage quota or privacy mode should never break the blog.
            console.warn("Blog cache could not be saved:", error);
        }
    }

    function getCachedBlogs() {
        const cache = readCache();

        return cache?.blogs || [];
    }

    function hasFreshCache() {
        const cache = readCache();

        if (!cache) return false;

        return Date.now() - cache.timestamp < CACHE_TTL;
    }

    function clearCache() {
        try {
            localStorage.removeItem(CACHE_KEY);
        } catch (error) {
            console.warn("Blog cache could not be cleared:", error);
        }
    }

    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------

    function normalizeBlog(item) {
        if (!item || typeof item !== "object") {
            return null;
        }

        return {
            slug: String(item.slug || "").trim(),
            title: String(item.title || "Untitled").trim(),
            excerpt: String(item.excerpt || "").trim(),
            content: String(item.content || ""),
            category: String(item.category || "Development").trim(),
            author: String(item.author || "Muhammad Ishaq").trim(),
            date: String(item.date || "").trim(),
            image: String(item.image || "").trim(),
            meta_description: String(
                item.meta_description ||
                item.excerpt ||
                ""
            ).trim()
        };
    }

    function getDateValue(dateString) {
        if (!dateString) return 0;

        let date;

        // Avoid timezone surprises for YYYY-MM-DD values.
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            date = new Date(`${dateString}T00:00:00`);
        } else {
            date = new Date(dateString);
        }

        const time = date.getTime();

        return Number.isNaN(time) ? 0 : time;
    }

    function sortBlogs(blogs) {
        return [...blogs]
            .filter(blog => blog && blog.slug)
            .sort(
                (a, b) =>
                    getDateValue(b.date) -
                    getDateValue(a.date)
            );
    }

    function formatDate(dateString) {
        if (!dateString) {
            return "";
        }

        let date;

        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
            date = new Date(`${dateString}T00:00:00`);
        } else {
            date = new Date(dateString);
        }

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric"
            }
        );
    }

    function getReadingTime(content) {
        if (!content) {
            return 1;
        }

        const temp = document.createElement("div");
        temp.innerHTML = content;

        const text = (
            temp.textContent ||
            temp.innerText ||
            ""
        ).trim();

        const words = text
            .split(/\s+/)
            .filter(Boolean)
            .length;

        // Comfortable technical reading estimate.
        return Math.max(1, Math.ceil(words / 200));
    }

    function truncate(text, length) {
        if (!text) return "";

        if (text.length <= length) {
            return text;
        }

        return (
            text.slice(0, length).trimEnd() +
            "..."
        );
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function safeImageUrl(value) {
        const fallback = "/images/placeholder.webp";

        if (!value) {
            return fallback;
        }

        try {
            const url = new URL(
                value,
                window.location.origin
            );

            if (
                url.protocol === "http:" ||
                url.protocol === "https:"
            ) {
                return url.href;
            }
        } catch (error) {
            // Invalid URL.
        }

        return fallback;
    }

    // --------------------------------------------------
    // Basic content sanitization
    // --------------------------------------------------

    function sanitizeHTML(html) {
        const template =
            document.createElement("template");

        template.innerHTML = String(html || "");

        // Remove elements that should never come
        // directly from a spreadsheet.
        template.content
            .querySelectorAll(
                "script, style, object, embed, form, base"
            )
            .forEach(element => {
                element.remove();
            });

        // Sanitize attributes.
        template.content
            .querySelectorAll("*")
            .forEach(element => {
                [...element.attributes].forEach(attribute => {
                    const name =
                        attribute.name.toLowerCase();

                    const value =
                        attribute.value.trim();

                    // Inline JavaScript events.
                    if (name.startsWith("on")) {
                        element.removeAttribute(
                            attribute.name
                        );
                        return;
                    }

                    if (name === "srcdoc") {
                        element.removeAttribute(
                            attribute.name
                        );
                        return;
                    }

                    // Block javascript: URLs.
                    if (
                        (
                            name === "href" ||
                            name === "src" ||
                            name === "action"
                        ) &&
                        /^javascript:/i.test(value)
                    ) {
                        element.removeAttribute(
                            attribute.name
                        );
                    }
                });

                // External links open safely.
                if (
                    element.tagName === "A" &&
                    element.getAttribute("href")
                ) {
                    const href =
                        element.getAttribute("href");

                    if (
                        /^https?:\/\//i.test(href)
                    ) {
                        element.setAttribute(
                            "target",
                            "_blank"
                        );

                        element.setAttribute(
                            "rel",
                            "noopener noreferrer"
                        );
                    }
                }

                // Images inside articles should not
                // block the page.
                if (
                    element.tagName === "IMG"
                ) {
                    element.setAttribute(
                        "loading",
                        "lazy"
                    );

                    element.setAttribute(
                        "decoding",
                        "async"
                    );
                }
            });

        // Only allow trusted YouTube embeds.
        template.content
            .querySelectorAll("iframe")
            .forEach(iframe => {
                const src =
                    iframe.getAttribute("src") || "";

                const trusted =
                    /^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com)\/embed\//i.test(
                        src
                    );

                if (!trusted) {
                    iframe.remove();
                    return;
                }

                iframe.setAttribute(
                    "loading",
                    "lazy"
                );

                iframe.setAttribute(
                    "referrerpolicy",
                    "strict-origin-when-cross-origin"
                );
            });

        return template.innerHTML;
    }

    function slugify(text) {
        return String(text || "")
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }

    // --------------------------------------------------
    // Network
    // --------------------------------------------------

    async function fetchFromNetwork() {
        const apiUrl = getApiUrl();

        if (!apiUrl) {
            throw new Error(
                "Blog API URL is not configured."
            );
        }

        if (requestInFlight) {
            return requestInFlight;
        }

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                () => controller.abort(),
                10000
            );

        requestInFlight = fetch(
            apiUrl,
            {
                method: "GET",
                headers: {
                    Accept: "application/json"
                },
                signal: controller.signal,
                cache: "no-store"
            }
        )
            .then(response => {
                if (!response.ok) {
                    throw new Error(
                        `Blog API returned HTTP ${response.status}.`
                    );
                }

                return response.json();
            })
            .then(data => {
                const rawBlogs =
                    Array.isArray(data)
                        ? data
                        : Array.isArray(data?.blogs)
                            ? data.blogs
                            : [];

                const blogs =
                    sortBlogs(
                        rawBlogs
                            .map(normalizeBlog)
                            .filter(Boolean)
                    );

                writeCache(blogs);

                return blogs;
            })
            .finally(() => {
                clearTimeout(timeout);
                requestInFlight = null;
            });

        return requestInFlight;
    }

    async function fetchBlogs(options = {}) {
        const force =
            options.force === true;

        const cached =
            getCachedBlogs();

        if (
            !force &&
            cached.length &&
            hasFreshCache()
        ) {
            return sortBlogs(cached);
        }

        return fetchFromNetwork();
    }

    // --------------------------------------------------
    // Public API
    // --------------------------------------------------

    window.BlogAPI = {
        fetchBlogs,
        getCachedBlogs,
        hasFreshCache,
        clearCache,
        sortBlogs,
        formatDate,
        getReadingTime,
        truncate,
        escapeHTML,
        safeImageUrl,
        sanitizeHTML,
        slugify
    };
})();