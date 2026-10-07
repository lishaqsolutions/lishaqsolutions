// async function loadBlogPost() {

//     const container =
//         document.getElementById("blogPost");

//     if (!container) return;

//     const slug =
//         new URLSearchParams(window.location.search)
//             .get("slug");

//     if (!slug) {

//         container.innerHTML = `
//             <h1>Blog Not Found</h1>
//             <p>Missing blog slug.</p>
//         `;

//         return;
//     }

//     try {

//         container.innerHTML = "<p>Loading article...</p>";

//         const response = await fetch(
//             window.SITE_CONFIG.googleScript.blogsApi
//         );

//         const blogs = await response.json();

//         const blog = blogs.find(
//             item =>
//                 String(item.slug).trim() ===
//                 String(slug).trim()
//         );

//         if (!blog) {

//             container.innerHTML = `
//                 <h1>404</h1>
//                 <p>Blog not found.</p>
//             `;

//             return;
//         }

//         // ----------------------------------------
//         // Make blog available globally
//         // ----------------------------------------

//         window.CURRENT_BLOG = blog;

//         // ----------------------------------------
//         // SEO
//         // ----------------------------------------

//         document.title =
//             `${blog.title} | ${window.SITE_CONFIG.siteName}`;

//         const description =
//             blog.meta_description ||
//             blog.excerpt ||
//             "";

//         function setMeta(selector, value) {

//             const el =
//                 document.querySelector(selector);

//             if (el) {

//                 el.setAttribute(
//                     "content",
//                     value
//                 );

//             }

//         }

//         setMeta(
//             'meta[name="description"]',
//             description
//         );

//         setMeta(
//             'meta[property="og:title"]',
//             blog.title
//         );

//         setMeta(
//             'meta[property="og:description"]',
//             description
//         );

//         setMeta(
//             'meta[property="og:url"]',
//             `${window.location.origin}/blog-post/?slug=${blog.slug}`
//         );

//         if (blog.image) {

//             setMeta(
//                 'meta[property="og:image"]',
//                 blog.image
//             );

//         }

//         setMeta(
//             'meta[name="twitter:title"]',
//             blog.title
//         );

//         setMeta(
//             'meta[name="twitter:description"]',
//             description
//         );

//         if (blog.image) {

//             setMeta(
//                 'meta[name="twitter:image"]',
//                 blog.image
//             );

//         }

//         const canonical =
//             document.querySelector(
//                 'link[rel="canonical"]'
//             );

//         if (canonical) {

//             canonical.href =
//                 `${window.location.origin}/blog-post/?slug=${blog.slug}`;

//         }

//         // ----------------------------------------
//         // Notify schema.js
//         // ----------------------------------------

//         document.dispatchEvent(
//             new CustomEvent(
//                 "blogLoaded",
//                 {
//                     detail: blog
//                 }
//             )
//         );

//         // ----------------------------------------
//         // Format Date
//         // ----------------------------------------

//         let formattedDate = blog.date;

//         if (
//             blog.date &&
//             !isNaN(Date.parse(blog.date))
//         ) {

//             formattedDate =
//                 new Date(blog.date)
//                     .toLocaleDateString(
//                         "en-US",
//                         {
//                             year: "numeric",
//                             month: "long",
//                             day: "numeric"
//                         }
//                     );

//         }

//         // ----------------------------------------
//         // Render Article
//         // ----------------------------------------

//         container.innerHTML = `

//             <article class="article">

//                 <a
//                     href="/blog/"
//                     style="color:var(--primary);font-size:.9rem;"
//                 >
//                     ← Back to Blog
//                 </a>

//                 <span
//                     class="eyebrow"
//                     style="margin-top:16px;display:block;"
//                 >
//                     ${blog.category || ""}
//                 </span>

//                 <h1>${blog.title}</h1>

//                 <div class="article-meta">

//                     <span>
//                         👤 ${blog.author}
//                     </span>

//                     <span>
//                         📅 ${formattedDate}
//                     </span>

//                 </div>

//                 <div class="cover">

//                     <img
//                         src="${blog.image}"
//                         alt="${blog.title}"
//                     >

//                 </div>

//                 <div class="article-body">

//                     ${blog.content}

//                 </div>

//             </article>

//         `;

//     }
//     catch (error) {

//         console.error(error);

//         container.innerHTML = `
//             <h1>Error</h1>
//             <p>Failed to load article.</p>
//         `;

//     }

// }

// document.addEventListener(
//     "DOMContentLoaded",
//     loadBlogPost
// );





// Lishaq Solutions — Blog Article
(function () {
    "use strict";

    let articleInitialized = false;

    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------

    function getSlug() {
        return new URLSearchParams(
            window.location.search
        ).get("slug");
    }

    function getContainer() {
        return document.getElementById(
            "blogPost"
        );
    }

    function articleUrl(slug) {
        return (
            "/blog-post/?slug=" +
            encodeURIComponent(slug)
        );
    }

    function updateMeta(selector, content) {
        const element =
            document.querySelector(selector);

        if (!element) return;

        element.setAttribute(
            "content",
            content || ""
        );
    }

    function absoluteUrl(url) {
        if (!url) return "";

        try {
            return new URL(
                url,
                window.location.origin
            ).href;
        } catch {
            return "";
        }
    }

    // --------------------------------------------------
    // SEO
    // --------------------------------------------------

    function updateSEO(blog) {

        const siteName =
            window.SITE_CONFIG?.siteName ||
            "Lishaq Solutions";

        const description =
            BlogAPI.truncate(
                blog.meta_description ||
                blog.excerpt ||
                "",
                160
            );

        const canonical =
            `${window.location.origin}/blog-post/?slug=${encodeURIComponent(
                blog.slug
            )}`;

        const image =
            absoluteUrl(
                BlogAPI.safeImageUrl(
                    blog.image
                )
            );

        document.title =
            `${blog.title} | ${siteName}`;

        updateMeta(
            'meta[name="description"]',
            description
        );

        updateMeta(
            'meta[property="og:title"]',
            blog.title
        );

        updateMeta(
            'meta[property="og:description"]',
            description
        );

        updateMeta(
            'meta[property="og:url"]',
            canonical
        );

        updateMeta(
            'meta[property="og:image"]',
            image
        );

        updateMeta(
            'meta[property="og:image:alt"]',
            blog.title
        );

        updateMeta(
            'meta[name="twitter:title"]',
            blog.title
        );

        updateMeta(
            'meta[name="twitter:description"]',
            description
        );

        updateMeta(
            'meta[name="twitter:image"]',
            image
        );

        const canonicalElement =
            document.querySelector(
                'link[rel="canonical"]'
            );

        if (canonicalElement) {
            canonicalElement.href =
                canonical;
        }
    }

    // --------------------------------------------------
    // Loading state
    // --------------------------------------------------

    function showLoading() {
        const container =
            getContainer();

        if (!container) return;

        container.innerHTML = `
            <div class="blog-featured-skeleton">
                <div class="skeleton-image"></div>

                <div class="skeleton-content">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
    }

    function showNotFound() {
        const container =
            getContainer();

        if (!container) return;

        container.innerHTML = `
            <div class="blog-empty">

                <div class="blog-empty-icon">
                    404
                </div>

                <h1>
                    Article not found
                </h1>

                <p>
                    The article you're looking for
                    may have been moved or removed.
                </p>

                <a
                    href="/blog/"
                    class="btn btn-primary"
                >
                    Back to blog
                </a>

            </div>
        `;
    }

    function showError() {
        const container =
            getContainer();

        if (!container) return;

        container.innerHTML = `
            <div class="blog-empty">

                <div class="blog-empty-icon">
                    !
                </div>

                <h1>
                    Unable to load article
                </h1>

                <p>
                    Please try again later.
                </p>

                <a
                    href="/blog/"
                    class="btn btn-ghost"
                >
                    Back to blog
                </a>

            </div>
        `;
    }

    // --------------------------------------------------
    // Article markup
    // --------------------------------------------------

    function renderArticle(blog, allBlogs) {

        const container =
            getContainer();

        if (!container) return;

        window.CURRENT_BLOG = blog;

        updateSEO(blog);

        const image =
            BlogAPI.safeImageUrl(
                blog.image
            );

        const category =
            BlogAPI.escapeHTML(
                blog.category
            );

        const title =
            BlogAPI.escapeHTML(
                blog.title
            );

        const excerpt =
            BlogAPI.escapeHTML(
                BlogAPI.truncate(
                    blog.excerpt ||
                    blog.meta_description ||
                    "",
                    240
                )
            );

        const author =
            BlogAPI.escapeHTML(
                blog.author ||
                "Muhammad Ishaq"
            );

        const date =
            BlogAPI.escapeHTML(
                BlogAPI.formatDate(
                    blog.date
                )
            );

        const readTime =
            BlogAPI.getReadingTime(
                blog.content
            );

        container.innerHTML = `

            <article class="article-page">

                <div class="article-top">

                    <a
                        href="/blog/"
                        class="article-back"
                    >
                        <span aria-hidden="true">
                            ←
                        </span>
                        Back to Blog
                    </a>

                    <div class="article-category">
                        ${category}
                    </div>

                    <h1>
                        ${title}
                    </h1>

                    ${
                        excerpt
                            ? `
                                <p class="article-deck">
                                    ${excerpt}
                                </p>
                            `
                            : ""
                    }

                    <div class="article-meta-v2">

                        <span>
                            By ${author}
                        </span>

                        ${
                            date
                                ? `
                                    <span>•</span>
                                    <span>
                                        ${date}
                                    </span>
                                `
                                : ""
                        }

                        <span>•</span>

                        <span>
                            ${readTime} min read
                        </span>

                    </div>

                    ${
                        image
                            ? `
                                <div class="article-cover-v2">

                                    <img
                                        src="${image}"
                                        alt="${title}"
                                        fetchpriority="high"
                                        decoding="async"
                                    >

                                </div>
                            `
                            : ""
                    }

                </div>


                <div class="article-shell">

                    <div class="article-main">

                        <div class="article-actions">

                            <span class="article-actions-label">
                                Share:
                            </span>

                            <button
                                type="button"
                                class="article-action"
                                data-share="native"
                            >
                                Share article
                            </button>

                            <button
                                type="button"
                                class="article-action"
                                data-share="copy"
                            >
                                Copy link
                            </button>

                            <button
                                type="button"
                                class="article-action"
                                data-share="linkedin"
                            >
                                LinkedIn
                            </button>

                            <button
                                type="button"
                                class="article-action"
                                data-share="whatsapp"
                            >
                                WhatsApp
                            </button>

                        </div>


                        <div
                            id="articleBody"
                            class="article-body"
                        ></div>


                        <section
                            class="article-bottom-cta"
                        >

                            <span class="eyebrow">
                                Need help?
                            </span>

                            <h2>
                                Have a similar technical
                                problem or project?
                            </h2>

                            <p>
                                Lishaq Solutions builds
                                custom software, business
                                websites, dashboards,
                                automation and reliable
                                web applications.
                            </p>

                            <a
                                href="/contact/"
                                class="btn btn-primary"
                            >
                                Discuss your project
                                <span aria-hidden="true">
                                    →
                                </span>
                            </a>

                        </section>


                        <section
                            id="relatedArticles"
                            class="related-articles"
                        ></section>

                    </div>


                    <aside class="article-sidebar">

                        <div
                            class="article-sidebar-inner"
                        >

                            <div
                                id="articleToc"
                                class="article-toc"
                            ></div>


                            <div
                                class="article-sidebar-card"
                            >

                                <span class="eyebrow">
                                    Work with us
                                </span>

                                <h3>
                                    Need a developer
                                    for something
                                    similar?
                                </h3>

                                <p>
                                    Get a practical,
                                    business-focused
                                    solution without
                                    unnecessary complexity.
                                </p>

                                <a
                                    href="/contact/"
                                    class="btn btn-primary"
                                >
                                    Start a conversation
                                </a>

                            </div>

                        </div>

                    </aside>

                </div>

            </article>

        `;

        const articleBody =
            document.getElementById(
                "articleBody"
            );

        if (articleBody) {
            articleBody.innerHTML =
                BlogAPI.sanitizeHTML(
                    blog.content
                );

            buildTableOfContents(
                articleBody
            );
        }

        renderRelatedArticles(
            blog,
            allBlogs
        );

        document.dispatchEvent(
            new CustomEvent(
                "blogLoaded",
                {
                    detail: blog
                }
            )
        );
    }

    // --------------------------------------------------
    // Table of contents
    // --------------------------------------------------

    function buildTableOfContents(
        articleBody
    ) {

        const toc =
            document.getElementById(
                "articleToc"
            );

        if (!toc) return;

        const headings =
            articleBody.querySelectorAll(
                "h2, h3"
            );

        if (headings.length < 2) {
            toc.style.display =
                "none";

            return;
        }

        const links = [];

        headings.forEach(
            (heading, index) => {

                let id =
                    heading.id;

                if (!id) {
                    id =
                        BlogAPI.slugify(
                            heading.textContent
                        ) ||
                        `section-${index + 1}`;
                }

                // Ensure IDs are unique.
                if (
                    document.getElementById(id) &&
                    document.getElementById(id) !== heading
                ) {
                    id =
                        `${id}-${index + 1}`;
                }

                heading.id = id;

                const level =
                    heading.tagName
                        .toLowerCase();

                links.push(`
                    <a
                        href="#${BlogAPI.escapeHTML(id)}"
                        class="${
                            level === "h3"
                                ? "toc-h3"
                                : ""
                        }"
                    >
                        ${BlogAPI.escapeHTML(
                            heading.textContent
                        )}
                    </a>
                `);
            }
        );

        toc.innerHTML = `
            <div class="article-toc-title">
                On this page
            </div>

            <nav>
                ${links.join("")}
            </nav>
        `;
    }

    // --------------------------------------------------
    // Related articles
    // --------------------------------------------------

    function renderRelatedArticles(
        current,
        allBlogs
    ) {

        const container =
            document.getElementById(
                "relatedArticles"
            );

        if (!container) return;

        const others =
            allBlogs
                .filter(
                    blog =>
                        blog.slug !==
                        current.slug
                );

        if (!others.length) {
            container.style.display =
                "none";

            return;
        }

        const sameCategory =
            others.filter(
                blog =>
                    blog.category
                        .toLowerCase() ===
                    current.category
                        .toLowerCase()
            );

        const differentCategory =
            others.filter(
                blog =>
                    blog.category
                        .toLowerCase() !==
                    current.category
                        .toLowerCase()
            );

        const related =
            [
                ...sameCategory,
                ...differentCategory
            ].slice(0, 3);

        container.innerHTML = `

            <h2>
                More from Lishaq Solutions
            </h2>

            <div class="related-grid">

                ${related
                    .map(
                        blog => `
                            <a
                                href="${articleUrl(
                                    blog.slug
                                )}"
                                class="related-card"
                            >

                                <span
                                    class="related-card-category"
                                >
                                    ${BlogAPI.escapeHTML(
                                        blog.category
                                    )}
                                </span>

                                <h3>
                                    ${BlogAPI.escapeHTML(
                                        blog.title
                                    )}
                                </h3>

                                <div
                                    class="related-card-meta"
                                >
                                    ${BlogAPI.escapeHTML(
                                        BlogAPI.formatDate(
                                            blog.date
                                        )
                                    )}
                                    •
                                    ${BlogAPI.getReadingTime(
                                        blog.content
                                    )} min read
                                </div>

                            </a>
                        `
                    )
                    .join("")}

            </div>
        `;
    }

    // --------------------------------------------------
    // Share actions
    // --------------------------------------------------

    async function handleShare(action) {

        const blog =
            window.CURRENT_BLOG;

        if (!blog) return;

        const url =
            window.location.href;

        const title =
            blog.title;

        if (
            action === "native" &&
            navigator.share
        ) {

            try {
                await navigator.share({
                    title,
                    text:
                        blog.excerpt ||
                        title,
                    url
                });
            } catch {
                // User cancelled sharing.
            }

            return;
        }

        if (action === "copy") {

            try {

                await navigator.clipboard.writeText(
                    url
                );

                const button =
                    document.querySelector(
                        '[data-share="copy"]'
                    );

                if (button) {

                    const original =
                        button.textContent;

                    button.textContent =
                        "Link copied ✓";

                    setTimeout(
                        () => {
                            button.textContent =
                                original;
                        },
                        1800
                    );
                }

            } catch (error) {

                console.warn(
                    "Clipboard unavailable:",
                    error
                );
            }

            return;
        }

        if (action === "linkedin") {

            const shareUrl =
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                    url
                )}`;

            window.open(
                shareUrl,
                "_blank",
                "noopener,noreferrer"
            );

            return;
        }

        if (action === "whatsapp") {

            const text =
                `${title} ${url}`;

            const shareUrl =
                `https://wa.me/?text=${encodeURIComponent(
                    text
                )}`;

            window.open(
                shareUrl,
                "_blank",
                "noopener,noreferrer"
            );
        }
    }

    // --------------------------------------------------
    // Reading progress
    // --------------------------------------------------

    function updateReadingProgress() {

        const progress =
            document.getElementById(
                "readingProgress"
            );

        const articleBody =
            document.getElementById(
                "articleBody"
            );

        if (
            !progress ||
            !articleBody
        ) {
            return;
        }

        const rect =
            articleBody.getBoundingClientRect();

        const top =
            window.scrollY +
            rect.top;

        const height =
            articleBody.offsetHeight;

        const viewport =
            window.innerHeight;

        const scrolled =
            window.scrollY -
            top;

        const total =
            height -
            viewport;

        if (total <= 0) {
            progress.style.width =
                "100%";

            return;
        }

        const percentage =
            Math.min(
                100,
                Math.max(
                    0,
                    (scrolled / total) * 100
                )
            );

        progress.style.width =
            `${percentage}%`;
    }

    // --------------------------------------------------
    // Event binding
    // --------------------------------------------------

    function setupInteractions() {

        if (articleInitialized) {
            return;
        }

        articleInitialized = true;

        const container =
            getContainer();

        container?.addEventListener(
            "click",
            event => {

                const shareButton =
                    event.target.closest(
                        "[data-share]"
                    );

                if (!shareButton) {
                    return;
                }

                handleShare(
                    shareButton.dataset.share
                );
            }
        );

        window.addEventListener(
            "scroll",
            updateReadingProgress,
            {
                passive: true
            }
        );

        window.addEventListener(
            "resize",
            updateReadingProgress
        );
    }

    // --------------------------------------------------
    // Main loader
    // --------------------------------------------------

    async function loadBlogPost() {

        const container =
            getContainer();

        if (!container) {
            return;
        }

        if (!window.BlogAPI) {
            showError();
            return;
        }

        setupInteractions();

        const slug =
            getSlug();

        if (!slug) {
            showNotFound();
            return;
        }

        showLoading();

        // ------------------------------------------------
        // 1. Render cached article immediately
        // ------------------------------------------------

        const cached =
            BlogAPI.sortBlogs(
                BlogAPI.getCachedBlogs()
            );

        const cachedBlog =
            cached.find(
                blog =>
                    blog.slug === slug
            );

        if (cachedBlog) {
            renderArticle(
                cachedBlog,
                cached
            );

            requestAnimationFrame(
                updateReadingProgress
            );
        }

        // ------------------------------------------------
        // 2. Refresh cache when needed
        // ------------------------------------------------

        try {

            let blogs = cached;

            if (
                !cached.length ||
                !BlogAPI.hasFreshCache()
            ) {

                blogs =
                    await BlogAPI.fetchBlogs({
                        force: true
                    });

                blogs =
                    BlogAPI.sortBlogs(
                        blogs
                    );
            }

            const blog =
                blogs.find(
                    item =>
                        item.slug ===
                        slug
                );

            if (!blog) {
                showNotFound();
                return;
            }

            // Re-render only when network data differs
            // or when no cached article was available.
            if (
                !cachedBlog ||
                blog.content !==
                    cachedBlog.content ||
                blog.title !==
                    cachedBlog.title ||
                blog.date !==
                    cachedBlog.date
            ) {

                renderArticle(
                    blog,
                    blogs
                );

                requestAnimationFrame(
                    updateReadingProgress
                );
            }

        } catch (error) {

            console.error(
                "Blog article error:",
                error
            );

            if (!cachedBlog) {
                showError();
            }
        }
    }

    document.addEventListener(
        "DOMContentLoaded",
        loadBlogPost
    );

})();