(function () {
    function applyDynamicContent() {
        const config = window.SITE_CONFIG;

        if (!config) {
            console.error("SITE_CONFIG not found.");
            return;
        }

        // ======================================================
        // Helpers
        // ======================================================

        function setText(selector, value) {
            if (!value) return;

            document.querySelectorAll(selector).forEach(el => {
                el.textContent = value;
            });
        }

        function setHref(selector, value) {
            if (!value) return;

            document.querySelectorAll(selector).forEach(el => {
                el.href = value;
            });
        }

        function setAttr(selector, attr, value) {
            if (!value) return;

            document.querySelectorAll(selector).forEach(el => {
                el.setAttribute(attr, value);
            });
        }

        function setMeta(selector, value) {
            if (!value) return;

            const el = document.querySelector(selector);

            if (el) {
                el.setAttribute("content", value);
            }
        }

        // ======================================================
        // Site Information
        // ======================================================

        setText("[data-site-name]", config.siteName);
        setText("[data-site-email]", config.email);
        setText("[data-site-phone]", config.phone);
        setText("[data-site-city]", config.city);
        setText("[data-site-country]", config.country);
        setText("[data-site-whatsapp]", config.phone);

        // ======================================================
        // Links
        // ======================================================

        setHref("[data-email-link]", `mailto:${config.email}`);

        setHref(
            "[data-phone-link]",
            `tel:${config.phone.replace(/\s+/g, "")}`
        );

        setHref(
            "[data-whatsapp-link]",
            `https://wa.me/${config.whatsapp}`
        );

        setHref("[data-site-url]", config.siteUrl);

        if (config.social) {

            setHref("[data-github-link]", config.social.github);

            setHref("[data-linkedin-link]", config.social.linkedin);

            setHref("[data-facebook-link]", config.social.facebook);

            setHref("[data-youtube-link]", config.social.youtube);

            setHref("[data-tiktok-link]", config.social.tiktok);

        }

        // ======================================================
        // Contact Form
        // ======================================================

        if (config.googleScript?.contactForm) {

            setAttr(
                "form[data-contact-form]",
                "action",
                config.googleScript.contactForm
            );

        }

        // ======================================================
        // Page SEO
        // ======================================================

        const titleEl = document.querySelector("[data-site-title]");

        const descriptionEl = document.querySelector("[data-site-description]");

        const pageTitle =
            titleEl?.dataset.pageTitle || document.title;

        const pageDescription =
            descriptionEl?.dataset.pageDescription ||
            config.description;

        const canonical =
            document.querySelector('link[rel="canonical"]');

        let pageImage =
            document
                .querySelector('meta[property="og:image"]')
                ?.getAttribute("content") ||
            config.defaultImage;

        if (
            pageImage &&
            !pageImage.startsWith("http")
        ) {
            pageImage =
                config.siteUrl + pageImage;
        }

        // Title

        document.title = pageTitle;

        if (titleEl) {
            titleEl.textContent = pageTitle;
        }

        // Description

        setMeta(
            'meta[name="description"]',
            pageDescription
        );

        // Open Graph

        setMeta(
            'meta[property="og:title"]',
            pageTitle
        );

        setMeta(
            'meta[property="og:description"]',
            pageDescription
        );

        setMeta(
            'meta[property="og:url"]',
            canonical?.href || window.location.href
        );

        setMeta(
            'meta[property="og:image"]',
            pageImage
        );

        setMeta(
            'meta[property="og:site_name"]',
            config.siteName
        );

        // Twitter

        setMeta(
            'meta[name="twitter:title"]',
            pageTitle
        );

        setMeta(
            'meta[name="twitter:description"]',
            pageDescription
        );

        setMeta(
            'meta[name="twitter:image"]',
            pageImage
        );

        console.log("Dynamic content applied.");
    }

    applyDynamicContent();

    document.addEventListener(
        "componentsLoaded",
        applyDynamicContent
    );
})();