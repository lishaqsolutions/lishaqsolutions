async function loadBlogs() {

    const container =
        document.getElementById(
            "blogContainer"
        );

    if (!container) return;

    try {

        // const response =
        //     await fetch(
        //         window.SITE_CONFIG.googleScript.blogsApi
        //     );

        // const blogs =
        //     await response.json();
        const response =
            await fetch(
                window.SITE_CONFIG.googleScript.blogsApi
            );

        console.log(response);

        const text =
            await response.text();

        console.log(text);

        const blogs =
            JSON.parse(text);

        container.innerHTML = "";

        blogs.reverse().forEach(blog => {

            container.innerHTML += `

                <a
                    href="/lishaqsolutions/blog-post/?slug=${blog.slug}"
                    class="card blog-card reveal"
                    style="padding:0;overflow:hidden;display:block"
                >

                    <div
                        class="thumb"
                        style="aspect-ratio:16/9;overflow:hidden"
                    >

                        <img
                            src="${blog.image}"
                            alt="${blog.title}"
                            loading="lazy"
                            style="
                                width:100%;
                                height:100%;
                                object-fit:cover;
                            "
                        >

                    </div>

                    <div style="padding:24px">

                        <div class="meta">

                            <span>
                                👤 ${blog.author}
                            </span>

                            <span>
                                📅 ${blog.date}
                            </span>

                        </div>

                        <h2>
                            ${blog.title}
                        </h2>

                        <p class="muted">

                            ${blog.excerpt}

                        </p>

                        <span class="link-arrow">

                            Read More →

                        </span>

                    </div>

                </a>

            `;

        });

    } catch(error) {

        console.error(error);

        container.innerHTML = `
            <p>
                Failed to load blogs.
            </p>
        `;
    }
}

document.addEventListener(
    "DOMContentLoaded",
    loadBlogs
);