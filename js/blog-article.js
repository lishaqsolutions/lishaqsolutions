(function () {
    "use strict";

    document.addEventListener("DOMContentLoaded", function () {
        buildTableOfContents();
        setupShareButtons();
        setupReadingProgress();
    });

    function buildTableOfContents() {
        const articleBody =
            document.getElementById("articleBody");

        const toc =
            document.getElementById("articleToc");

        if (!articleBody || !toc) {
            return;
        }

        const headings =
            articleBody.querySelectorAll("h2, h3");

        if (!headings.length) {
            toc.innerHTML =
                "<span>No sections</span>";
            return;
        }

        toc.innerHTML = "";

        headings.forEach(function (heading) {

            if (!heading.id) {
                heading.id = slugify(
                    heading.textContent
                );
            }

            const link =
                document.createElement("a");

            link.href =
                "#" + heading.id;

            link.textContent =
                heading.textContent;

            link.className =
                heading.tagName === "H3"
                    ? "toc-h3"
                    : "toc-h2";

            toc.appendChild(link);
        });
    }

    function slugify(value) {
        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    }

    function setupShareButtons() {

        const blog =
            window.CURRENT_BLOG || {};

        const title =
            blog.title ||
            document.title;

        const url =
            window.location.href;

        document
            .querySelectorAll(
                "[data-share]"
            )
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    async function () {

                        const type =
                            button.dataset.share;

                        if (type === "native") {
                            await nativeShare(
                                title,
                                url
                            );
                        }

                        if (type === "copy") {
                            await copyLink(
                                button,
                                url
                            );
                        }

                        if (type === "linkedin") {
                            window.open(
                                "https://www.linkedin.com/sharing/share-offsite/?url=" +
                                encodeURIComponent(url),
                                "_blank",
                                "noopener,noreferrer"
                            );
                        }

                        if (type === "whatsapp") {
                            window.open(
                                "https://wa.me/?text=" +
                                encodeURIComponent(
                                    title + " " + url
                                ),
                                "_blank",
                                "noopener,noreferrer"
                            );
                        }
                    }
                );
            });
    }

    async function nativeShare(title, url) {

        if (!navigator.share) {
            return;
        }

        try {
            await navigator.share({
                title: title,
                url: url
            });
        } catch (error) {
            // User cancelled share.
        }
    }

    async function copyLink(button, url) {

        try {

            await navigator.clipboard.writeText(
                url
            );

            const original =
                button.innerHTML;

            button.innerHTML =
                "Copied ✓";

            setTimeout(function () {
                button.innerHTML =
                    original;
            }, 1600);

        } catch (error) {
            console.error(
                "Copy failed:",
                error
            );
        }
    }

    function setupReadingProgress() {

        const progress =
            document.getElementById(
                "readingProgress"
            );

        if (!progress) {
            return;
        }

        function update() {

            const scrollTop =
                window.scrollY;

            const docHeight =
                document.documentElement
                    .scrollHeight -
                window.innerHeight;

            const percentage =
                docHeight > 0
                    ? (scrollTop / docHeight) * 100
                    : 0;

            progress.style.width =
                Math.min(
                    100,
                    Math.max(0, percentage)
                ) + "%";
        }

        window.addEventListener(
            "scroll",
            update,
            { passive: true }
        );

        update();
    }
})();