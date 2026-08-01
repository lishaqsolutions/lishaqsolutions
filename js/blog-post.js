async function loadBlogPost() {

    const container =
        document.getElementById("blogPost");

    if (!container) return;

    const slug =
        new URLSearchParams(window.location.search)
            .get("slug");

    if (!slug) {

        container.innerHTML = `
            <h1>Blog Not Found</h1>
            <p>Missing blog slug.</p>
        `;

        return;
    }

    try {

        container.innerHTML = "<p>Loading article...</p>";

        const response = await fetch(
            window.SITE_CONFIG.googleScript.blogsApi
        );

        const blogs = await response.json();

        const blog = blogs.find(
            item =>
                String(item.slug).trim() ===
                String(slug).trim()
        );

        if (!blog) {

            container.innerHTML = `
                <h1>404</h1>
                <p>Blog not found.</p>
            `;

            return;
        }

        // ----------------------------------------
        // Make blog available globally
        // ----------------------------------------

        window.CURRENT_BLOG = blog;

        // ----------------------------------------
        // SEO
        // ----------------------------------------

        document.title =
            `${blog.title} | ${window.SITE_CONFIG.siteName}`;

        const description =
            blog.meta_description ||
            blog.excerpt ||
            "";

        function setMeta(selector, value) {

            const el =
                document.querySelector(selector);

            if (el) {

                el.setAttribute(
                    "content",
                    value
                );

            }

        }

        setMeta(
            'meta[name="description"]',
            description
        );

        setMeta(
            'meta[property="og:title"]',
            blog.title
        );

        setMeta(
            'meta[property="og:description"]',
            description
        );

        setMeta(
            'meta[property="og:url"]',
            `${window.location.origin}/blog-post/?slug=${blog.slug}`
        );

        if (blog.image) {

            setMeta(
                'meta[property="og:image"]',
                blog.image
            );

        }

        setMeta(
            'meta[name="twitter:title"]',
            blog.title
        );

        setMeta(
            'meta[name="twitter:description"]',
            description
        );

        if (blog.image) {

            setMeta(
                'meta[name="twitter:image"]',
                blog.image
            );

        }

        const canonical =
            document.querySelector(
                'link[rel="canonical"]'
            );

        if (canonical) {

            canonical.href =
                `${window.location.origin}/blog-post/?slug=${blog.slug}`;

        }

        // ----------------------------------------
        // Notify schema.js
        // ----------------------------------------

        document.dispatchEvent(
            new CustomEvent(
                "blogLoaded",
                {
                    detail: blog
                }
            )
        );

        // ----------------------------------------
        // Format Date
        // ----------------------------------------

        let formattedDate = blog.date;

        if (
            blog.date &&
            !isNaN(Date.parse(blog.date))
        ) {

            formattedDate =
                new Date(blog.date)
                    .toLocaleDateString(
                        "en-US",
                        {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                        }
                    );

        }

        // ----------------------------------------
        // Render Article
        // ----------------------------------------

        container.innerHTML = `

            <article class="article">

                <a
                    href="/blog/"
                    style="color:var(--primary);font-size:.9rem;"
                >
                    ← Back to Blog
                </a>

                <span
                    class="eyebrow"
                    style="margin-top:16px;display:block;"
                >
                    ${blog.category || ""}
                </span>

                <h1>${blog.title}</h1>

                <div class="article-meta">

                    <span>
                        👤 ${blog.author}
                    </span>

                    <span>
                        📅 ${formattedDate}
                    </span>

                </div>

                <div class="cover">

                    <img
                        src="${blog.image}"
                        alt="${blog.title}"
                    >

                </div>

                <div class="article-body">

                    ${blog.content}

                </div>

            </article>

        `;

    }
    catch (error) {

        console.error(error);

        container.innerHTML = `
            <h1>Error</h1>
            <p>Failed to load article.</p>
        `;

    }

}

document.addEventListener(
    "DOMContentLoaded",
    loadBlogPost
);