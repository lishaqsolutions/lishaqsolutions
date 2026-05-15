(function () {
    function applyDynamicContent() {
        const config = window.SITE_CONFIG;

        if (!config) {
            console.error("SITE_CONFIG not found.");
            return;
        }

        function setText(selector, value) {
            document.querySelectorAll(selector).forEach(el => {
                el.textContent = value;
            });
        }

        function setHref(selector, value) {
            document.querySelectorAll(selector).forEach(el => {
                el.setAttribute("href", value);
            });
        }

        function setMeta(selector, value) {
            const el = document.querySelector(selector);
            if (el) {
                el.setAttribute("content", value);
            }
        }

        function setAttr(selector, attr, value) {
            document.querySelectorAll(selector).forEach(el => {
                el.setAttribute(attr, value);
            });
        }

        // ==========================================
        // TEXT PLACEHOLDERS
        // ==========================================
        setText("[data-site-name]", config.siteName);
        setText("[data-site-email]", config.email);
        setText("[data-site-phone]", config.phone);
        setText("[data-site-city]", config.city);
        setText("[data-site-country]", config.country);

        // ==========================================
        // LINKS
        // ==========================================
        const whatsappUrl = "https://wa.me/" + config.whatsapp;

        setText("[data-site-whatsapp]", config.phone);

        // WhatsApp
        setHref("[data-whatsapp-link]", whatsappUrl);

        // Email
        setHref("[data-email-link]", "mailto:" + config.email);

        // Phone
        setHref(
            "[data-phone-link]",
            "tel:" + config.phone.replace(/\s+/g, "")
        );

        // Site URL
        setHref("[data-site-url]", config.siteUrl);

        // Social Links
        if (config.social) {
            if (config.social.github) {
                setHref("[data-github-link]", config.social.github);
            }

            if (config.social.linkedin) {
                setHref(
                    "[data-linkedin-link]",
                    config.social.linkedin
                );
            }

            if (config.social.youtube) {
                setHref(
                    "[data-youtube-link]",
                    config.social.youtube
                );
            }
        }

        // Contact Form
        if (config.googleScript && config.googleScript.contactForm) {
            setAttr(
                "form[data-contact-form]",
                "action",
                config.googleScript.contactForm
            );
        }

        // ==========================================
        // META TAGS
        // ==========================================
        const titleEl = document.querySelector("[data-site-title]");
        if (titleEl && titleEl.dataset.pageTitle) {
            document.title = titleEl.dataset.pageTitle;
            titleEl.textContent = document.title;
        }

        const descriptionEl = document.querySelector(
            "[data-site-description]"
        );

        if (
            descriptionEl &&
            descriptionEl.dataset.pageDescription
        ) {
            const description =
                descriptionEl.dataset.pageDescription;

            setMeta('meta[name="description"]', description);
            setMeta(
                'meta[property="og:description"]',
                description
            );
            setMeta(
                'meta[name="twitter:description"]',
                description
            );
        }

        setMeta(
            'meta[property="og:title"]',
            document.title
        );

        // Canonical URL
        const canonical = document.querySelector(
            'link[rel="canonical"]'
        );

        if (canonical) {
            canonical.href = window.location.href;
        }

        // ==========================================
        // JSON-LD SCHEMA
        // ==========================================
        const schema = document.querySelector(
            "#local-business-schema"
        );

        if (schema) {
            schema.textContent = JSON.stringify(
                {
                    "@context": "https://schema.org",
                    "@type": "LocalBusiness",
                    "name": config.siteName,
                    "image":
                        config.siteUrl +
                        "/images/logo.png",
                    "url": config.siteUrl,
                    "telephone": config.phone,
                    "email": config.email,
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": config.city,
                        "addressCountry": config.country
                    },
                    "sameAs": [
                        config.social.linkedin || "",
                        config.social.github || "",
                        config.social.youtube || ""
                    ].filter(Boolean)
                },
                null,
                2
            );
        }

        console.log("Dynamic content applied successfully.");
    }

    // Run immediately for elements already in the page
    applyDynamicContent();

    // Run again after header/footer are loaded asynchronously
    document.addEventListener(
        "componentsLoaded",
        applyDynamicContent
    );
})();