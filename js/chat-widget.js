/* =====================================================
   Lishaq Solutions — AI Assistant
   Connects the website UI to the Cloudflare Worker
   ===================================================== */

(() => {
  "use strict";

  if (document.getElementById("lishaq-ai-chat")) return;

  const API_URL =
    "https://lishaq-ai-assistant.lishaqsolutions.workers.dev/chat";

  // Load the widget's stylesheet.
  if (!document.querySelector("[data-lishaq-chat-css]")) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "/css/chat-widget.css";
    stylesheet.dataset.lishaqChatCss = "true";
    document.head.appendChild(stylesheet);
  }

  const root = document.createElement("div");
  root.id = "lishaq-ai-chat";

  root.innerHTML = `
    <button
      type="button"
      class="lishaq-chat-launcher"
      id="lishaq-chat-open"
      aria-label="Open Lishaq AI Assistant"
      aria-expanded="false"
      aria-controls="lishaq-chat-panel"
    >
      <svg viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"
        aria-hidden="true">
        <path d="M21 11.5a8.5 8.5 0 0 1-12.9 7.3L3 20l1.2-4.5A8.5 8.5 0 1 1 21 11.5Z"/>
      </svg>
      <span>Ask AI</span>
    </button>

    <section
      class="lishaq-chat-panel"
      id="lishaq-chat-panel"
      aria-label="Lishaq Solutions AI Assistant"
      hidden
    >
      <header class="lishaq-chat-header">
        <div class="lishaq-chat-avatar" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v2"/>
            <path d="M5 8a7 7 0 0 1 14 0v5a7 7 0 0 1-14 0Z"/>
            <path d="M9 12h.01M15 12h.01"/>
            <path d="M9 16h6"/>
          </svg>
        </div>

        <div class="lishaq-chat-heading">
          <strong>Lishaq AI Assistant</strong>
          <span>
            <i class="lishaq-chat-status-dot"></i>
            Ask about our services
          </span>
        </div>

        <button
          type="button"
          class="lishaq-chat-close"
          id="lishaq-chat-close"
          aria-label="Close chat"
        >×</button>
      </header>

      <div
        class="lishaq-chat-messages"
        id="lishaq-chat-messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      ></div>

      <div class="lishaq-chat-notice">
        AI-generated answers may be inaccurate. Chat messages may be stored to help respond to enquiries. Please don't share sensitive information.
      </div>

      <form class="lishaq-chat-form" id="lishaq-chat-form">
        <textarea
          class="lishaq-chat-input"
          id="lishaq-chat-input"
          rows="1"
          maxlength="1000"
          placeholder="Ask us anything..."
          aria-label="Your message"
          required
        ></textarea>

        <button
          type="submit"
          class="lishaq-chat-send"
          id="lishaq-chat-send"
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <path d="m22 2-7 20-4-9-9-4Z"/>
            <path d="M22 2 11 13"/>
          </svg>
        </button>
      </form>

      <div class="lishaq-chat-footnote">
        Lishaq Solutions · AI Assistant
      </div>
    </section>
  `;

  document.body.appendChild(root);

  const openButton = root.querySelector("#lishaq-chat-open");
  const closeButton = root.querySelector("#lishaq-chat-close");
  const panel = root.querySelector("#lishaq-chat-panel");
  const messages = root.querySelector("#lishaq-chat-messages");
  const form = root.querySelector("#lishaq-chat-form");
  const input = root.querySelector("#lishaq-chat-input");
  const sendButton = root.querySelector("#lishaq-chat-send");

  let isSending = false;
  let conversationHistory = [];

  function createChatId() {
  return window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : `chat-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const conversationId = createChatId();
const visitorId = createChatId();

  function openChat() {
    panel.hidden = false;
    openButton.setAttribute("aria-expanded", "true");

    window.setTimeout(() => input.focus(), 50);
  }

  function closeChat() {
    panel.hidden = true;
    openButton.setAttribute("aria-expanded", "false");
    openButton.focus();
  }

  function addMessage(type, text) {
    const wrapper = document.createElement("div");
    wrapper.className = `lishaq-chat-message lishaq-chat-message--${type}`;

    const bubble = document.createElement("div");
    bubble.className = "lishaq-chat-bubble";

    // Use textContent rather than innerHTML for message contents.
    bubble.textContent = text;

    wrapper.appendChild(bubble);
    messages.appendChild(wrapper);
    messages.scrollTop = messages.scrollHeight;

    return wrapper;
  }

  function setSending(sending) {
    isSending = sending;
    sendButton.disabled = sending;
    input.disabled = sending;
    sendButton.setAttribute("aria-busy", String(sending));
  }

  async function sendMessage(message) {
    if (isSending || !message) return;

    addMessage("user", message);

conversationHistory.push({
  role: "user",
  content: message
});

input.value = "";
input.style.height = "auto";

    setSending(true);

    const typingMessage = addMessage("typing", "Thinking...");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      60000
    );

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
  message,
  history: conversationHistory
  .slice(0, -1)
  .slice(-12)
  .map(item => ({
    role: item.role,
    content: item.content.slice(0, 500)
  }))
}),
        credentials: "omit",
        cache: "no-store",
        signal: controller.signal
      });

      const data = await response.json().catch(() => ({}));
      typingMessage.remove();

      if (!response.ok) {
        console.error("Chat request failed with status:", response.status);
        throw new Error(
          response.status === 429
            ? "The assistant is busy. Please try again shortly."
            : "The assistant is temporarily unavailable. Please try again."
        );
      }

      if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("The assistant returned an empty response.");
      }

      const assistantReply = data.reply.trim();

addMessage("assistant", assistantReply);

conversationHistory.push({
  role: "assistant",
  content: assistantReply
});

    } catch (error) {
      typingMessage.remove();

      const messageText = error.name === "AbortError"
        ? "The response took too long. Please try again."
        : error.message || "Something went wrong. Please try again.";

      const lastMessage =
  conversationHistory[conversationHistory.length - 1];

if (
  lastMessage &&
  lastMessage.role === "user" &&
  lastMessage.content === message
) {
  conversationHistory.pop();
}
      console.error("Lishaq chat error:", error.message);

    } finally {
      window.clearTimeout(timeoutId);
      setSending(false);

      if (!panel.hidden) input.focus();
    }
  }

  openButton.addEventListener("click", () => {
    if (panel.hidden) openChat();
    else closeChat();
  });

  closeButton.addEventListener("click", closeChat);

  form.addEventListener("submit", event => {
    event.preventDefault();

    const message = input.value.trim();
    if (!message || isSending) return;

    sendMessage(message);
  });

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 112)}px`;
  });

  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !panel.hidden) {
      closeChat();
    }
  });

  addMessage(
    "assistant",
    "Hi! 👋 Welcome to Lishaq Solutions. I can help you explore our web development, AI automation, software development, and UI/UX design services. What are you looking to build?"
  );
})();