
(() => {
  "use strict";

  if (window.__lishaqVisitTrackerLoaded) return;
  window.__lishaqVisitTrackerLoaded = true;

  const API_URL =
    "https://lishaq-ai-assistant.lishaqsolutions.workers.dev/visit";

  const CONSENT_KEY = "lishaq-visit-consent";
  const VISITOR_KEY = "lishaq-visitor-id";

  function getVisitorId() {
    let id = localStorage.getItem(VISITOR_KEY);

    if (!id) {
      id = window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `visitor-${Date.now()}-${Math.random()
            .toString(36).slice(2)}`;

      localStorage.setItem(VISITOR_KEY, id);
    }

    return id;
  }

  async function recordVisit() {
    try {
      if (localStorage.getItem(CONSENT_KEY) !== "yes") return;

      const referrer = document.referrer
        ? new URL(document.referrer).origin
        : "";

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          consent: true,
          visitorId: getVisitorId(),
          pagePath: window.location.pathname,
          referrer
        }),
        credentials: "omit",
        cache: "no-store",
        keepalive: true
      });

      if (!response.ok) {
        console.error("Website visit request failed:", response.status);
      }
    } catch (error) {
      console.error(
        "Website visit tracker error:",
        error.message
      );
    }
  }

  function showConsentBanner() {
    const banner = document.createElement("div");

    banner.style.cssText = [
      "position:fixed",
      "z-index:99999",
      "bottom:16px",
      "left:16px",
      "right:16px",
      "max-width:620px",
      "margin:0 auto",
      "padding:18px",
      "background:#fff",
      "color:#222",
      "border:1px solid #ddd",
      "border-radius:12px",
      "box-shadow:0 6px 28px rgba(0,0,0,.18)",
      "font:14px/1.5 Arial,sans-serif"
    ].join(";");

    const message = document.createElement("p");
    message.textContent =
      "May Lishaq Solutions record the pages you visit in a private " +
      "analytics sheet? This uses a random browser ID and does not " +
      "reveal your email address. You can decline.";
    message.style.margin = "0 0 12px";

    const allow = document.createElement("button");
    allow.type = "button";
    allow.textContent = "Allow page tracking";

    allow.style.cssText =
      "padding:10px 14px;margin-right:8px;cursor:pointer";

    const decline = document.createElement("button");
    decline.type = "button";
    decline.textContent = "Not now";

    decline.style.cssText =
      "padding:10px 14px;cursor:pointer";

    allow.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "yes");
      banner.remove();
      recordVisit();
    });

    decline.addEventListener("click", () => {
      localStorage.setItem(CONSENT_KEY, "no");
      banner.remove();
    });

    banner.append(message, allow, decline);
    document.body.appendChild(banner);
  }

  try {
    const consent = localStorage.getItem(CONSENT_KEY);

    if (consent === "yes") {
      recordVisit();
    } else if (consent !== "no") {
      showConsentBanner();
    }
  } catch (error) {
    console.error("Visit tracking storage unavailable.");
  }
})();
