// blogs.js
async function loadBlogs() {
    const container = document.getElementById("blogContainer");

    if (!container) {
        console.error("Blog container not found");
        return;
    }

    // Show loading state
    container.innerHTML = `
        <div style="text-align: center; padding: 50px; grid-column: 1/-1; color: white;">
            <p>Loading blog posts...</p>
        </div>
    `;

    try {
        // Wait for config to be available
        if (!window.SITE_CONFIG) {
            console.error("SITE_CONFIG not loaded yet");
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; grid-column: 1/-1; color: red;">
                    <p>Configuration error. Please refresh the page.</p>
                </div>
            `;
            return;
        }

        const apiUrl = window.SITE_CONFIG.googleScript?.blogsApi;
        
        if (!apiUrl) {
            console.error("Blogs API URL not configured");
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; grid-column: 1/-1; color: white;">
                    <p>Blog API not configured. Please check configuration.</p>
                </div>
            `;
            return;
        }

        console.log("Fetching blogs from:", apiUrl);

        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blogs = await response.json();
        
        console.log("Blogs loaded:", blogs.length);

        if (!blogs || blogs.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 50px; grid-column: 1/-1; color: white;">
                    <p>No blog posts found. Check back soon!</p>
                </div>
            `;
            return;
        }

        // Clear container
        container.innerHTML = "";

        // Reverse to show newest first
        const sortedBlogs = [...blogs].reverse();

        sortedBlogs.forEach(blog => {
            // Format date nicely
            let formattedDate = blog.date;
            if (blog.date && !isNaN(Date.parse(blog.date))) {
                formattedDate = new Date(blog.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            // Ensure image URL is valid
            const imageUrl = blog.image || '/lishaqsolutions/images/placeholder.webp';

            container.innerHTML += `
                <a
                    href="/lishaqsolutions/blog-post/?slug=${encodeURIComponent(blog.slug)}"
                    class="card blog-card reveal"
                    style="padding:0;overflow:hidden;display:block;text-decoration:none;background: rgba(15, 25, 55, 0.75);border-radius: 28px;transition: all 0.25s ease;border: 1px solid rgba(43, 127, 255, 0.25);"
                >
                    <div class="thumb" style="aspect-ratio:16/9;overflow:hidden">
                        <img
                            src="${imageUrl}"
                            alt="${blog.title || 'Blog post'}"
                            loading="lazy"
                            style="width:100%;height:100%;object-fit:cover;"
                            onerror="this.src='/lishaqsolutions/images/placeholder.webp'"
                        >
                    </div>
                    <div style="padding:24px">
                        <div class="meta" style="display:flex;gap:15px;margin-bottom:12px;font-size:0.85rem;">
                            <span style="color: #a3b3e0;">👤 ${blog.author || 'Muhammad Ishaq'}</span>
                            <span style="color: #a3b3e0;">📅 ${formattedDate}</span>
                        </div>
                        <h2 style="color: white !important; margin: 10px 0; font-size: 1.4rem;">${blog.title || 'Untitled'}</h2>
                        <p class="muted" style="color: #cfdcff !important; margin: 10px 0; line-height: 1.5;">${blog.excerpt || 'Click to read more...'}</p>
                        <span class="link-arrow" style="color: #5b9aff; display: inline-block; margin-top: 12px; font-weight: 500;">Read More →</span>
                    </div>
                </a>
            `;
        });

    } catch (error) {
        console.error("Error loading blogs:", error);
        
        // Show user-friendly error
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; grid-column: 1/-1;">
                <p style="color: #ff6b6b;">Failed to load blog posts.</p>
                <p style="margin-top: 10px; color: white;">Please try again later or <a href="/lishaqsolutions/contact/" style="color: var(--primary);">contact us</a> if the issue persists.</p>
                <details style="margin-top: 20px; text-align: left;">
                    <summary style="color: white;">Technical details</summary>
                    <pre style="background: #1a1a2e; padding: 10px; border-radius: 8px; margin-top: 10px; overflow-x: auto; color: #e2e8f0;">${error.message}</pre>
                </details>
            </div>
        `;
    }
}

// Wait for DOM and config to be ready
document.addEventListener("DOMContentLoaded", () => {
    // Small delay to ensure config.js has run
    setTimeout(() => {
        loadBlogs();
    }, 100);
});