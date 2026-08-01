(function () {
  const config = window.SITE_CONFIG;

  if (!window.SITE_CONFIG) {
    console.error("SITE_CONFIG not found.");
    return;
  }

  const config = window.SITE_CONFIG;

  function setSchema(id, object) {
    const el = document.getElementById(id);

    if (!el) return;

    el.textContent = JSON.stringify(object, null, 2);
  }

  // -----------------------------
  // Organization
  // -----------------------------

  setSchema("organization", {
    "@context": "https://schema.org",

    "@type": "Organization",

    "@id": config.siteUrl + "/#organization",

    name: config.siteName,

    url: config.siteUrl,

    logo: {
      "@type": "ImageObject",
      url: config.siteUrl + config.logo,
    },

    email: config.email,

    address: {
      "@type": "PostalAddress",
      addressLocality: config.city,
      addressCountry: config.country,
    },

    telephone: config.phone,

    contactPoint: {
      "@type": "ContactPoint",
      telephone: config.phone,
      contactType: "customer service",
      availableLanguage: "English",
    },

    description: config.description,

    sameAs: [
      config.social.linkedin,

      config.social.github,

      config.social.facebook,

      config.social.youtube,

      config.social.tiktok,
    ].filter(Boolean),
  });

  // -----------------------------
  // Website
  // -----------------------------

  setSchema("website", {
    "@context": "https://schema.org",

    "@type": "WebSite",

    "@id": config.siteUrl + "/#website",

    url: config.siteUrl,

    name: config.siteName,

    description: config.description,

    publisher: {
      "@id": config.siteUrl + "/#organization",
    },

    inLanguage: "en",
  });

  // -------------------------------------
  // Dynamic Blog Article Schema
  // -------------------------------------

  document.addEventListener("blogLoaded", function (event) {
    const blog = event.detail;

    const pageSchema = document.getElementById("page-schema");

    if (!pageSchema) return;

    pageSchema.textContent = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BlogPosting",

            "@id": `${config.siteUrl}/blog-post/?slug=${blog.slug}#article`,

            headline: blog.title,

            description: blog.meta_description || blog.excerpt,

            image: blog.image,

            datePublished: blog.date,

            dateModified: blog.updated_at || blog.date,

            author: {
              "@type": "Organization",
              name: config.siteName,
            },

            publisher: {
              "@id": config.siteUrl + "/#organization",
            },

            mainEntityOfPage: {
              "@id": `${config.siteUrl}/blog-post/?slug=${blog.slug}#webpage`,
            },
          },

          {
            "@type": "WebPage",

            "@id": `${config.siteUrl}/blog-post/?slug=${blog.slug}#webpage`,

            url: `${config.siteUrl}/blog-post/?slug=${blog.slug}`,

            name: blog.title,

            description: blog.meta_description || blog.excerpt,

            isPartOf: {
              "@id": config.siteUrl + "/#website",
            },
          },

          {
            "@type": "BreadcrumbList",

            "@id": `${config.siteUrl}/blog-post/?slug=${blog.slug}#breadcrumb`,

            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: config.siteUrl + "/",
              },

              {
                "@type": "ListItem",
                position: 2,
                name: "Blog",
                item: config.siteUrl + "/blog/",
              },

              {
                "@type": "ListItem",
                position: 3,
                name: blog.title,
                item: `${config.siteUrl}/blog-post/?slug=${blog.slug}`,
              },
            ],
          },
        ],
      },
      null,
      2,
    );
  });
})();
