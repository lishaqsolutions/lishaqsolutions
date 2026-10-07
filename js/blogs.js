// // blogs.js

// async function loadBlogs() {
//     const container = document.getElementById("blogContainer");

//     if (!container) {
//         console.error("Blog container not found");
//         return;
//     }

//     // Show loading state
//     container.innerHTML = `
//         <div style="text-align: center; padding: 50px; grid-column: 1/-1; color: white;">
//             <p>Loading blog posts...</p>
//         </div>
//     `;

//     try {
//         // Wait for config to be available
//         if (!window.SITE_CONFIG) {
//             console.error("SITE_CONFIG not loaded yet");
//             container.innerHTML = `
//                 <div style="text-align: center; padding: 50px; grid-column: 1/-1; color: red;">
//                     <p>Configuration error. Please refresh the page.</p>
//                 </div>
//             `;
//             return;
//         }

//         const apiUrl = window.SITE_CONFIG.googleScript?.blogsApi;
        
//         if (!apiUrl) {
//             console.error("Blogs API URL not configured");
//             container.innerHTML = `
//                 <div style="text-align: center; padding: 50px; grid-column: 1/-1; color: white;">
//                     <p>Blog API not configured. Please check configuration.</p>
//                 </div>
//             `;
//             return;
//         }

//         console.log("Fetching blogs from:", apiUrl);

//         const response = await fetch(apiUrl);

//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         const blogs = await response.json();
        
//         console.log("Blogs loaded:", blogs.length);

//         if (!blogs || blogs.length === 0) {
//             container.innerHTML = `
//                 <div style="text-align: center; padding: 50px; grid-column: 1/-1; color: white;">
//                     <p>No blog posts found. Check back soon!</p>
//                 </div>
//             `;
//             return;
//         }

//         // Clear container
//         container.innerHTML = "";

//         // Reverse to show newest first
//         const sortedBlogs = [...blogs].reverse();

//         sortedBlogs.forEach(blog => {
//             // Format date nicely
//             let formattedDate = blog.date;
//             if (blog.date && !isNaN(Date.parse(blog.date))) {
//                 formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
//                     year: 'numeric',
//                     month: 'long',
//                     day: 'numeric'
//                 });
//             }

//             // Ensure image URL is valid
//             const imageUrl = blog.image || '/images/placeholder.webp';

//             container.innerHTML += `
//                 <a
//                     href="/blog-post/?slug=${encodeURIComponent(blog.slug)}"
//                     class="card blog-card"
//                     style="padding:0;overflow:hidden;display:block;text-decoration:none;background: rgba(15, 25, 55, 0.75);border-radius: 28px;transition: all 0.25s ease;border: 1px solid rgba(43, 127, 255, 0.25);"
//                 >
//                     <div class="thumb" style="aspect-ratio:16/9;overflow:hidden">
//                         <img
//                             src="${imageUrl}"
//                             alt="${blog.title || 'Blog post'}"
//                             loading="lazy"
//                             style="width:100%;height:100%;object-fit:cover;"
//                             onerror="this.src='/images/placeholder.webp'"
//                         >
//                     </div>
//                     <div style="padding:24px">
//                         <div class="meta" style="display:flex;gap:15px;margin-bottom:12px;font-size:0.85rem;">
//                             <span style="color: #a3b3e0;">👤 ${blog.author || 'Muhammad Ishaq'}</span>
//                             <span style="color: #a3b3e0;">📅 ${formattedDate}</span>
//                         </div>
//                         <h2 style="color: white !important; margin: 10px 0; font-size: 1.4rem;">${blog.title || 'Untitled'}</h2>
//                         <p class="muted" style="color: #cfdcff !important; margin: 10px 0; line-height: 1.5;">${blog.excerpt || 'Click to read more...'}</p>
//                         <span class="link-arrow" style="color: #5b9aff; display: inline-block; margin-top: 12px; font-weight: 500;">Read More →</span>
//                     </div>
//                 </a>
//             `;
//         });

//     } catch (error) {
//         console.error("Error loading blogs:", error);
        
//         // Show user-friendly error
//         container.innerHTML = `
//             <div style="text-align: center; padding: 50px; grid-column: 1/-1;">
//                 <p style="color: #ff6b6b;">Failed to load blog posts.</p>
//                 <p style="margin-top: 10px; color: white;">Please try again later or <a href="/contact/" style="color: var(--primary);">contact us</a> if the issue persists.</p>
//                 <details style="margin-top: 20px; text-align: left;">
//                     <summary style="color: white;">Technical details</summary>
//                     <pre style="background: #1a1a2e; padding: 10px; border-radius: 8px; margin-top: 10px; overflow-x: auto; color: #e2e8f0;">${error.message}</pre>
//                 </details>
//             </div>
//         `;
//     }
// }

// // Wait for DOM and config to be ready
// document.addEventListener("DOMContentLoaded", () => {
//     // Small delay to ensure config.js has run
//     setTimeout(() => {
//         loadBlogs();
//     }, 100);
// });




// Lishaq Solutions — Blog Listing
(function () {
    "use strict";

    const state = {
        blogs: [],
        query: "",
        category: "all",
        visible: 6
    };

    let initialized = false;

    function getElements() {
        return {
            featured:
                document.getElementById(
                    "blogFeatured"
                ),

            container:
                document.getElementById(
                    "blogContainer"
                ),

            categories:
                document.getElementById(
                    "blogCategories"
                ),

            search:
                document.getElementById(
                    "blogSearch"
                ),

            loadMore:
                document.getElementById(
                    "blogLoadMore"
                ),

            status:
                document.getElementById(
                    "blogStatus"
                )
        };
    }

    // --------------------------------------------------
    // Rendering helpers
    // --------------------------------------------------

    function createArticleUrl(slug) {
        return (
            "/blog-post/?slug=" +
            encodeURIComponent(slug)
        );
    }

    function cardHTML(blog) {
        const image =
            BlogAPI.safeImageUrl(blog.image);

        const title =
            BlogAPI.escapeHTML(blog.title);

        const excerpt =
            BlogAPI.escapeHTML(
                BlogAPI.truncate(
                    blog.excerpt ||
                    "A practical guide from Lishaq Solutions.",
                    170
                )
            );

        const category =
            BlogAPI.escapeHTML(
                blog.category
            );

        const author =
            BlogAPI.escapeHTML(
                blog.author
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

        const url =
            createArticleUrl(
                blog.slug
            );

        return `
            <a
                href="${url}"
                class="blog-card-v2"
                aria-label="Read ${title}"
            >
                <div class="blog-card-image">
                    <img
                        src="${image}"
                        alt="${title}"
                        loading="lazy"
                        decoding="async"
                    >

                    <span class="blog-card-category">
                        ${category}
                    </span>
                </div>

                <div class="blog-card-content">

                    <div class="blog-card-meta">
                        <span>${date}</span>
                        <span>•</span>
                        <span>${readTime} min read</span>
                    </div>

                    <h2>
                        ${title}
                    </h2>

                    <p>
                        ${excerpt}
                    </p>

                    <div class="blog-card-footer">
                        <span class="blog-card-author">
                            By ${author}
                        </span>

                        <span class="blog-card-link">
                            Read article
                            <span aria-hidden="true">→</span>
                        </span>
                    </div>

                </div>
            </a>
        `;
    }

    function featuredHTML(blog) {
        if (!blog) {
            return "";
        }

        const image =
            BlogAPI.safeImageUrl(
                blog.image
            );

        const title =
            BlogAPI.escapeHTML(
                blog.title
            );

        const excerpt =
            BlogAPI.escapeHTML(
                BlogAPI.truncate(
                    blog.excerpt ||
                    "A practical guide from Lishaq Solutions.",
                    240
                )
            );

        const category =
            BlogAPI.escapeHTML(
                blog.category
            );

        const author =
            BlogAPI.escapeHTML(
                blog.author
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

        const url =
            createArticleUrl(
                blog.slug
            );

        return `
            <a
                href="${url}"
                class="blog-featured"
                aria-label="Read featured article: ${title}"
            >

                <div class="blog-featured-image">
                    <img
                        src="${image}"
                        alt="${title}"
                        fetchpriority="high"
                        decoding="async"
                    >

                    <span class="blog-featured-badge">
                        Featured article
                    </span>
                </div>

                <div class="blog-featured-body">

                    <div class="blog-featured-kicker">
                        ${category}
                    </div>

                    <h2>
                        ${title}
                    </h2>

                    <p>
                        ${excerpt}
                    </p>

                    <div class="blog-featured-meta">
                        <span>
                            ${author}
                        </span>

                        <span>•</span>

                        <span>
                            ${date}
                        </span>

                        <span>•</span>

                        <span>
                            ${readTime} min read
                        </span>
                    </div>

                    <span class="blog-featured-cta">
                        Read the full article
                        <span aria-hidden="true">→</span>
                    </span>

                </div>

            </a>
        `;
    }

    // --------------------------------------------------
    // Filtering
    // --------------------------------------------------

    function getFilteredBlogs() {
        const query =
            state.query
                .toLowerCase()
                .trim();

        return state.blogs.filter(
            blog => {

                const matchesCategory =
                    state.category === "all" ||
                    blog.category
                        .toLowerCase() ===
                    state.category
                        .toLowerCase();

                if (!matchesCategory) {
                    return false;
                }

                if (!query) {
                    return true;
                }

                const searchable =
                    [
                        blog.title,
                        blog.excerpt,
                        blog.category,
                        blog.author
                    ]
                        .join(" ")
                        .toLowerCase();

                return searchable.includes(
                    query
                );
            }
        );
    }

    function buildCategories() {
        const { categories } =
            getElements();

        if (!categories) return;

        const unique =
            [
                ...new Set(
                    state.blogs
                        .map(
                            blog =>
                                blog.category
                        )
                        .filter(Boolean)
                )
            ];

        const sorted =
            unique.sort(
                (a, b) =>
                    a.localeCompare(b)
            );

        categories.innerHTML = `
            <button
                type="button"
                class="blog-filter active"
                data-category="all"
            >
                All
            </button>

            ${sorted
                .map(
                    category => `
                        <button
                            type="button"
                            class="blog-filter"
                            data-category="${BlogAPI.escapeHTML(category)}"
                        >
                            ${BlogAPI.escapeHTML(category)}
                        </button>
                    `
                )
                .join("")}
        `;
    }

    function updateActiveCategory() {
        const { categories } =
            getElements();

        if (!categories) return;

        categories
            .querySelectorAll(
                ".blog-filter"
            )
            .forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.category
                        .toLowerCase() ===
                    state.category
                        .toLowerCase()
                );
            });
    }

    // --------------------------------------------------
    // Main render
    // --------------------------------------------------

    function render() {
        const {
            featured,
            container,
            loadMore,
            status
        } = getElements();

        if (!featured || !container) {
            return;
        }

        const filtered =
            getFilteredBlogs();

        if (status) {
            status.textContent =
                `${filtered.length} ${
                    filtered.length === 1
                        ? "article"
                        : "articles"
                }`;
        }

        if (!filtered.length) {
            featured.innerHTML = "";

            container.innerHTML = `
                <div class="blog-empty">
                    <div class="blog-empty-icon">
                        ✦
                    </div>

                    <h2>
                        No articles found
                    </h2>

                    <p>
                        Try a different search
                        term or category.
                    </p>
                </div>
            `;

            if (loadMore) {
                loadMore.hidden = true;
            }

            return;
        }

        // First filtered article is featured.
        const featuredPost =
            filtered[0];

        featured.innerHTML =
            featuredHTML(
                featuredPost
            );

        // Remaining articles.
        const remaining =
            filtered.slice(1);

        const visiblePosts =
            remaining.slice(
                0,
                state.visible
            );

        container.innerHTML =
            visiblePosts
                .map(cardHTML)
                .join("");

        if (loadMore) {
            loadMore.hidden =
                visiblePosts.length >=
                remaining.length;
        }
    }

    // --------------------------------------------------
    // Loading UI
    // --------------------------------------------------

    function showSkeleton() {
        const {
            featured,
            container
        } = getElements();

        if (!featured || !container) {
            return;
        }

        featured.innerHTML = `
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

        container.innerHTML =
            Array.from(
                { length: 6 },
                () => `
                    <div class="blog-skeleton-card">
                        <div class="skeleton-image"></div>

                        <div class="skeleton-content">
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                `
            ).join("");
    }

    function showError() {
        const {
            featured,
            container
        } = getElements();

        if (!featured || !container) {
            return;
        }

        featured.innerHTML = "";

        container.innerHTML = `
            <div class="blog-empty">
                <div class="blog-empty-icon">
                    !
                </div>

                <h2>
                    We couldn't load the articles
                </h2>

                <p>
                    Please try again. The articles
                    are temporarily unavailable.
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    id="blogRetry"
                >
                    Try again
                </button>
            </div>
        `;

        const retry =
            document.getElementById(
                "blogRetry"
            );

        retry?.addEventListener(
            "click",
            () => loadBlogs(true)
        );
    }

    // --------------------------------------------------
    // Events
    // --------------------------------------------------

    function setupEvents() {
        if (initialized) return;

        initialized = true;

        const {
            search,
            categories,
            loadMore
        } = getElements();

        search?.addEventListener(
            "input",
            () => {
                state.query =
                    search.value;

                state.visible = 6;

                render();
            }
        );

        categories?.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".blog-filter"
                    );

                if (!button) return;

                state.category =
                    button.dataset.category ||
                    "all";

                state.visible = 6;

                updateActiveCategory();

                render();
            }
        );

        loadMore?.addEventListener(
            "click",
            () => {

                state.visible += 6;

                render();

                const cards =
                    document.querySelectorAll(
                        ".blog-card-v2"
                    );

                const lastCard =
                    cards[cards.length - 6];

                if (lastCard) {
                    lastCard.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest"
                    });
                }
            }
        );
    }

    // --------------------------------------------------
    // Load
    // --------------------------------------------------

    async function loadBlogs(force = false) {
        const elements =
            getElements();

        if (
            !elements.container ||
            !window.BlogAPI
        ) {
            return;
        }

        setupEvents();

        const cached =
            BlogAPI.getCachedBlogs();

        if (cached.length) {
            state.blogs =
                BlogAPI.sortBlogs(
                    cached
                );

            buildCategories();
            render();
        } else {
            showSkeleton();
        }

        try {

            // Fresh cache is already useful.
            if (
                !force &&
                cached.length &&
                BlogAPI.hasFreshCache()
            ) {
                return;
            }

            const fresh =
                await BlogAPI.fetchBlogs({
                    force: true
                });

            state.blogs =
                BlogAPI.sortBlogs(
                    fresh
                );

            buildCategories();
            render();

        } catch (error) {

            console.error(
                "Blog loading error:",
                error
            );

            if (!cached.length) {
                showError();
            }
        }
    }

    document.addEventListener(
        "DOMContentLoaded",
        () => loadBlogs()
    );

})();