"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SITE_URL = "https://lishaqsolutions.com";

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeXml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

function truncate(value, length = 160) {
    const text = String(value ?? "")
        .replace(/\s+/g, " ")
        .trim();

    if (text.length <= length) {
        return text;
    }

    return (
        text
            .substring(
                0,
                length - 3
            )
            .trim() +
        "..."
    );
}

function slugify(value) {
    return String(value ?? "")
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

function plainText(value) {
    return String(value ?? "")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#039;/gi, "'")
        .replace(/\s+/g, " ")
        .trim();
}

function readingTime(content) {
    const words =
        plainText(content)
            .split(/\s+/)
            .filter(Boolean)
            .length;

    return Math.max(
        1,
        Math.ceil(words / 200)
    );
}

function formatDate(date) {

    if (!date) {
        return "";
    }

    const parsed =
        new Date(date);

    if (Number.isNaN(
        parsed.getTime()
    )) {
        return String(date);
    }

    return new Intl.DateTimeFormat(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    ).format(parsed);
}

function safeImageUrl(value) {

    const image =
        String(value ?? "").trim();

    if (
        /^https?:\/\//i.test(image)
    ) {
        return image;
    }

    if (
        image.startsWith("/")
    ) {
        return image;
    }

    return "/images/placeholder.webp";
}

function absoluteUrl(url) {

    if (!url) {
        return "";
    }

    if (
        /^https?:\/\//i.test(url)
    ) {
        return url;
    }

    return (
        SITE_URL +
        (url.startsWith("/")
            ? url
            : "/" + url)
    );
}

/*
 * Google Sheet content is controlled by your CMS.
 * We still remove the most dangerous HTML elements,
 * matching the protections already used by BlogAPI.
 */
function sanitizeContent(html) {

    return String(html ?? "")
        .replace(
            /<script\b[\s\S]*?<\/script>/gi,
            ""
        )
        .replace(
            /<style\b[\s\S]*?<\/style>/gi,
            ""
        )
        .replace(
            /<object\b[\s\S]*?<\/object>/gi,
            ""
        )
        .replace(
            /<embed\b[^>]*>/gi,
            ""
        )
        .replace(
            /<form\b[\s\S]*?<\/form>/gi,
            ""
        )
        .replace(
            /<base\b[^>]*>/gi,
            ""
        )
        .replace(
            /\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*')/gi,
            ""
        )
        .replace(
            /\s+srcdoc\s*=\s*(?:"[^"]*"|'[^']*')/gi,
            ""
        )
        .replace(
            /javascript\s*:/gi,
            ""
        );
}

function addHeadingIds(html) {

    const used = new Set();

    return String(html ?? "")
        .replace(
            /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
            function (
                full,
                level,
                attributes,
                inner
            ) {

                const existing =
                    attributes.match(
                        /\sid=["']([^"']+)["']/i
                    );

                let id =
                    existing
                        ? existing[1]
                        : slugify(
                            plainText(inner)
                        );

                if (!id) {
                    id =
                        "section";
                }

                const baseId = id;

                let counter = 2;

                while (
                    used.has(id)
                ) {
                    id =
                        baseId +
                        "-" +
                        counter++;

                }

                used.add(id);

                if (existing) {

                    attributes =
                        attributes.replace(
                            /\sid=["'][^"']*["']/i,
                            ' id="' +
                            escapeHtml(id) +
                            '"'
                        );

                } else {

                    attributes +=
                        ' id="' +
                        escapeHtml(id) +
                        '"';
                }

                return (
                    "<h" +
                    level +
                    attributes +
                    ">" +
                    inner +
                    "</h" +
                    level +
                    ">"
                );
            }
        );
}

function getBlogApiUrl() {

    if (process.env.BLOG_API_URL) {
        return process.env.BLOG_API_URL;
    }

    const configPath =
        path.join(
            ROOT,
            "js",
            "config.js"
        );

    if (
        !fs.existsSync(configPath)
    ) {
        throw new Error(
            "js/config.js not found."
        );
    }

    const config =
        fs.readFileSync(
            configPath,
            "utf8"
        );

    const match =
        config.match(
            /blogsApi\s*:\s*["'`]([^"'`]+)["'`]/
        );

    if (!match) {
        throw new Error(
            "Could not find blogsApi inside js/config.js."
        );
    }

    return match[1];
}

function buildApiUrl() {

    const value =
        getBlogApiUrl();

    const url =
        new URL(value);

    url.searchParams.set(
        "format",
        "build"
    );

    return url.toString();
}

async function fetchBlogs() {

    const apiUrl =
        buildApiUrl();

    console.log(
        "Fetching blogs from:",
        apiUrl
    );

    const response =
        await fetch(apiUrl);

    if (!response.ok) {
        throw new Error(
            `Blog API returned HTTP ${response.status}`
        );
    }

    const data =
        await response.json();

    const blogs =
        Array.isArray(data)
            ? data
            : data.blogs;

    if (!Array.isArray(blogs)) {
        throw new Error(
            "Blog API did not return a blogs array."
        );
    }

    return blogs
        .filter(
            blog =>
                blog &&
                blog.slug &&
                blog.title
        )
        .map(blog => ({
            slug:
                String(blog.slug)
                    .trim(),

            title:
                String(blog.title)
                    .trim(),

            excerpt:
                String(
                    blog.excerpt || ""
                ).trim(),

            content:
                String(
                    blog.content || ""
                ),

            category:
                String(
                    blog.category || "General"
                ).trim(),

            author:
                String(
                    blog.author ||
                    "Lishaq Solutions"
                ).trim(),

            date:
                blog.date || "",

            updated_at:
                blog.updated_at ||
                blog.date ||
                "",

            image:
                safeImageUrl(
                    blog.image
                ),

            meta_description:
                String(
                    blog.meta_description ||
                    blog.excerpt ||
                    ""
                ).trim()
        }));
}

function sortBlogs(blogs) {

    return [...blogs].sort(
        (a, b) => {

            const aDate =
                new Date(
                    a.date
                ).getTime() || 0;

            const bDate =
                new Date(
                    b.date
                ).getTime() || 0;

            return bDate - aDate;
        }
    );
}

function relatedBlogs(
    current,
    blogs
) {

    const sameCategory =
        blogs.filter(
            blog =>
                blog.slug !==
                    current.slug &&
                blog.category
                    .toLowerCase() ===
                    current.category
                        .toLowerCase()
        );

    const others =
        blogs.filter(
            blog =>
                blog.slug !==
                current.slug &&
                !sameCategory.includes(
                    blog
                )
        );

    return [
        ...sameCategory,
        ...others
    ].slice(0, 3);
}

function buildRelatedHtml(
    related
) {

    if (!related.length) {
        return "";
    }

    return `
        <section class="related-articles">
            <h2>Related articles</h2>

            <div class="related-grid">

                ${related.map(blog => `
                    <a
                        href="/blog/${encodeURIComponent(blog.slug)}/"
                        class="related-card"
                    >

                        <div class="related-card-category">
                            ${escapeHtml(blog.category)}
                        </div>

                        <h3>
                            ${escapeHtml(blog.title)}
                        </h3>

                        <div class="related-card-meta">
                            ${escapeHtml(
                                formatDate(blog.date)
                            )}
                        </div>

                    </a>
                `).join("")}

            </div>
        </section>
    `;
}

function buildArticleHtml(
    blog,
    allBlogs
) {

    const cleanContent =
        addHeadingIds(
            sanitizeContent(
                blog.content
            )
        );

    const title =
        escapeHtml(
            blog.title
        );

    const excerpt =
        escapeHtml(
            truncate(
                blog.excerpt,
                260
            )
        );

    const category =
        escapeHtml(
            blog.category
        );

    const author =
        escapeHtml(
            blog.author
        );

    const date =
        escapeHtml(
            formatDate(
                blog.date
            )
        );

    const image =
        escapeHtml(
            safeImageUrl(
                blog.image
            )
        );

    const time =
        readingTime(
            blog.content
        );

    const related =
        relatedBlogs(
            blog,
            allBlogs
        );

    return `
        <article class="article-page">

            <div class="article-top">

                <a
                    href="/blog/"
                    class="article-back"
                >
                    ← Back to blog
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

                    <span>•</span>

                    <span>
                        ${date}
                    </span>

                    <span>•</span>

                    <span>
                        ${time} min read
                    </span>

                </div>

            </div>

            <div class="article-cover-v2">

                <img
                    src="${image}"
                    alt="${title}"
                    fetchpriority="high"
                    decoding="async"
                >

            </div>

            <div class="article-shell">

                <div class="article-main">

                    <div class="article-actions">

                        <span class="article-actions-label">
                            Share
                        </span>

                        <button
                            type="button"
                            class="article-action"
                            data-share="native"
                        >
                            Share
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
                    >
                        ${cleanContent}
                    </div>

                    <div class="article-bottom-cta">

                        <h2>
                            Need something similar built?
                        </h2>

                        <p>
                            We help businesses build
                            reliable websites, dashboards,
                            automation, APIs and custom
                            software systems.
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

                    </div>

                    ${buildRelatedHtml(related)}

                </div>

                <aside class="article-sidebar">

                    <div class="article-sidebar-inner">

                        <div class="article-toc">

                            <div class="article-toc-title">
                                Table of contents
                            </div>

                            <nav
                                id="articleToc"
                                aria-label="Table of contents"
                            ></nav>

                        </div>

                        <div class="article-sidebar-card">

                            <h3>
                                Have a similar problem?
                            </h3>

                            <p>
                                Let us turn your
                                technical challenge
                                into reliable software.
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
}

function replaceAttr(
    html,
    regex,
    value
) {

    return html.replace(
        regex,
        function (
            _match,
            start,
            end
        ) {
            return (
                start +
                escapeHtml(value) +
                end
            );
        }
    );
}

function buildPage(
    template,
    blog,
    allBlogs
) {

    const articleUrl =
        `${SITE_URL}/blog/${encodeURIComponent(blog.slug)}/`;

    const description =
        truncate(
            blog.meta_description ||
            blog.excerpt ||
            "",
            160
        );

    const imageUrl =
        absoluteUrl(
            safeImageUrl(
                blog.image
            )
        );

    let html = template;

    html =
        html.replace(
            /<title>[\s\S]*?<\/title>/i,
            `<title>${escapeHtml(blog.title)} | Lishaq Solutions</title>`
        );

    html =
        replaceAttr(
            html,
            /(<meta\s+name="description"\s+content=")[^"]*(")/i,
            description
        );

    html =
        replaceAttr(
            html,
            /(<link\s+rel="canonical"\s+href=")[^"]*(")/i,
            articleUrl
        );

    html =
        replaceAttr(
            html,
            /(<meta\s+property="og:type"\s+content=")[^"]*(")/i,
            "article"
        );

    html =
        replaceAttr(
            html,
            /(<meta\s+property="og:title"\s+content=")[^"]*(")/i,
            blog.title
        );

    html =
        replaceAttr(
            html,
            /(<meta\s+property="og:description"\s+content=")[^"]*(")/i,
            description
        );

    html =
        replaceAttr(
            html,
            /(<meta\s+property="og:url"\s+content=")[^"]*(")/i,
            articleUrl
        );

    html =
        replaceAttr(
            html,
            /(<meta\s+property="og:image"\s+content=")[^"]*(")/i,
            imageUrl
        );

    html =
        replaceAttr(
            html,
            /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/i,
            blog.title
        );

    html =
        replaceAttr(
            html,
            /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/i,
            description
        );

    html =
        replaceAttr(
            html,
            /(<meta\s+name="twitter:image"\s+content=")[^"]*(")/i,
            imageUrl
        );

    const articleMeta = `
        <meta name="author" content="${escapeHtml(blog.author)}">
        <meta property="article:published_time"
              content="${escapeHtml(blog.date)}">
        <meta property="article:modified_time"
              content="${escapeHtml(blog.updated_at || blog.date)}">
        <meta property="article:section"
              content="${escapeHtml(blog.category)}">
        <meta property="og:image:alt"
              content="${escapeHtml(blog.title)}">
        <meta name="twitter:image:alt"
              content="${escapeHtml(blog.title)}">
    `;

    html =
        html.replace(
            "</head>",
            articleMeta +
            "\n</head>"
        );

    const blogJson =
        JSON.stringify({
            slug: blog.slug,
            title: blog.title,
            excerpt: blog.excerpt,
            content: blog.content,
            category: blog.category,
            author: blog.author,
            date: blog.date,
            updated_at: blog.updated_at,
            image: imageUrl,
            meta_description:
                blog.meta_description
        })
        .replace(
            /</g,
            "\\u003c"
        )
        .replace(
            />/g,
            "\\u003e"
        )
        .replace(
            /&/g,
            "\\u0026"
        );

    const currentBlogScript = `
<script>
window.CURRENT_BLOG = ${blogJson};
</script>
`;

    html =
        html.replace(
            '<script src="/js/blog-post.js"></script>',
            '<script src="/js/blog-article.js"></script>\n' +
            currentBlogScript
        );

    const marker =
        '<div id="blogPost" class="container">';

    const start =
        html.indexOf(marker);

    const mainEnd =
        html.indexOf(
            "</main>",
            start
        );

    if (
        start === -1 ||
        mainEnd === -1
    ) {
        throw new Error(
            "Could not locate #blogPost container in blog-post/index.html."
        );
    }

    const before =
        html.substring(
            0,
            start
        );

    const after =
        html.substring(
            mainEnd
        );

    html =
        before +
        marker +
        "\n" +
        buildArticleHtml(
            blog,
            allBlogs
        ) +
        "\n</div>\n" +
        after;

    return html;
}

function getStaticPageUrls() {

    const urls = [
        "/",
        "/blog/"
    ];

    const excluded =
        new Set([
            "blog",
            "blog-post",
            "css",
            "js",
            "images",
            "scripts",
            ".github",
            ".git",
            "node_modules"
        ]);

    const entries =
        fs.readdirSync(
            ROOT,
            {
                withFileTypes: true
            }
        );

    for (const entry of entries) {

        if (
            !entry.isDirectory() ||
            excluded.has(entry.name)
        ) {
            continue;
        }

        const indexPath =
            path.join(
                ROOT,
                entry.name,
                "index.html"
            );

        if (
            fs.existsSync(indexPath)
        ) {
            urls.push(
                `/${entry.name}/`
            );
        }
    }

    return urls;
}

function buildSitemap(
    blogs
) {

    const staticUrls =
        getStaticPageUrls();

    const articleUrls =
        blogs.map(
            blog => ({
                url:
                    `/blog/${encodeURIComponent(blog.slug)}/`,
                lastmod:
                    blog.updated_at ||
                    blog.date ||
                    ""
            })
        );

    const unique =
        new Map();

    for (
        const url of staticUrls
    ) {
        unique.set(
            url,
            { url }
        );
    }

    for (
        const article of articleUrls
    ) {
        unique.set(
            article.url,
            article
        );
    }

    const entries =
        [...unique.values()]
            .map(entry => {

                const lastmod =
                    entry.lastmod
                        ? `
            <lastmod>${escapeXml(
                formatSitemapDate(
                    entry.lastmod
                )
            )}</lastmod>`
                        : "";

                return `
        <url>
            <loc>${escapeXml(
                SITE_URL +
                entry.url
            )}</loc>
            ${lastmod}
        </url>`;
            })
            .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${entries}
</urlset>
`;
}

function formatSitemapDate(
    value
) {

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return String(value);
    }

    return date
        .toISOString()
        .split("T")[0];
}

async function main() {

    console.log(
        "Building Lishaq Solutions blog..."
    );

    const templatePath =
        path.join(
            ROOT,
            "blog-post",
            "index.html"
        );

    const template =
        fs.readFileSync(
            templatePath,
            "utf8"
        );

    const blogs =
        sortBlogs(
            await fetchBlogs()
        );

    console.log(
        `Found ${blogs.length} blog articles.`
    );

    for (
        const blog of blogs
    ) {

        const directory =
            path.join(
                ROOT,
                "blog",
                blog.slug
            );

        fs.mkdirSync(
            directory,
            {
                recursive: true
            }
        );

        const html =
            buildPage(
                template,
                blog,
                blogs
            );

        fs.writeFileSync(
            path.join(
                directory,
                "index.html"
            ),
            html,
            "utf8"
        );

        console.log(
            `Generated /blog/${blog.slug}/`
        );
    }

    const sitemap =
        buildSitemap(
            blogs
        );

    fs.writeFileSync(
        path.join(
            ROOT,
            "sitemap.xml"
        ),
        sitemap,
        "utf8"
    );

    console.log(
        "Generated sitemap.xml"
    );

    console.log(
        "Blog build completed."
    );
}

main().catch(
    error => {
        console.error(
            error
        );
        process.exit(1);
    }
);