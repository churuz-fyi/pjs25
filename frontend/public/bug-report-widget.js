/*
  Bug Report Widget
  - Single script tag inclusion (no CSS imports required).
  - Drop this file into a static directory (e.g. `frontend/public/`) and include
    <script src="/bug-report-widget.js"></script> in pages you want the widget.

  Configuration (optional): set `window.BugReportWidgetConfig = { endpoint: '/api/reports' }`
  before the script tag to change where reports are POSTed.

  The widget will POST FormData to the `endpoint`. If a screenshot file is present
  the request will be multipart/form-data. Otherwise JSON is sent.
*/
(function () {
  if (window.__bugReportWidgetLoaded) return;
  window.__bugReportWidgetLoaded = true;

  const config = window.BugReportWidgetConfig || { endpoint: "/api/reports" };

  // Capture recent console.error calls and global errors
  const recentErrors = [];
  const MAX_ERRORS = 50;

  const pushError = (obj) => {
    try {
      recentErrors.push(obj);
      if (recentErrors.length > MAX_ERRORS) recentErrors.shift();
    } catch (e) {
      // ignore
    }
  };

  const origConsoleError = console.error.bind(console);
  console.error = function (...args) {
    pushError({ time: new Date().toISOString(), type: "console.error", args: args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))) });
    origConsoleError(...args);
  };

  window.addEventListener("error", function (e) {
    pushError({ time: new Date().toISOString(), type: "uncaught", message: e.message, filename: e.filename, lineno: e.lineno, colno: e.colno, stack: e.error && e.error.stack });
  });

  // --- Styles ---
  const style = document.createElement("style");
  style.textContent = `
  .brw-btn{position:fixed;right:20px;bottom:20px;z-index:99999;background:#ef4444;color:#fff;border:none;border-radius:999px;padding:12px 18px;font-weight:600;box-shadow:0 6px 18px rgba(0,0,0,0.15);cursor:pointer}
  .brw-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:100000}
  .brw-modal{width:min(760px,95vw);max-height:90vh;overflow:auto;background:#fff;border-radius:12px;padding:18px;box-shadow:0 12px 40px rgba(0,0,0,0.2);font-family:Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial}
  .brw-title{font-size:18px;margin:0 0 8px}
  .brw-row{display:flex;gap:8px;align-items:center;margin:8px 0}
  .brw-col{flex:1}
  .brw-label{font-size:13px;color:#111;margin-bottom:6px;display:block}
  .brw-input,.brw-textarea,.brw-select{width:100%;padding:8px;border:1px solid #e5e7eb;border-radius:8px;font-size:14px}
  .brw-textarea{min-height:120px;resize:vertical}
  .brw-actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}
  .brw-primary{background:#2563eb;color:#fff;border:none;padding:8px 12px;border-radius:8px;cursor:pointer}
  .brw-muted{background:#f3f4f6;border:1px solid #e5e7eb;padding:8px 12px;border-radius:8px;cursor:pointer}
  .brw-small{font-size:12px;color:#6b7280}
  .brw-file{border:none;padding:4px}
  .brw-consent{display:flex;align-items:center;gap:8px}
  .brw-thanks{padding:20px;text-align:center}
  `;
  document.head.appendChild(style);

  // --- Elements ---
  const btn = document.createElement("button");
  btn.className = "brw-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", "Report a bug");
  btn.textContent = "Report a bug";
  document.body.appendChild(btn);

  const overlay = document.createElement("div");
  overlay.className = "brw-overlay";
  overlay.style.display = "none";

  const modal = document.createElement("div");
  modal.className = "brw-modal";

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Build form
  modal.innerHTML = `
    <h3 class="brw-title">Report an issue</h3>
    <form id="brw-form">
      <div class="brw-row">
        <div class="brw-col"><label class="brw-label">Category</label><select name="category" class="brw-select"><option>Bug</option><option>Idea</option><option>Other</option></select></div>
        <div style="width:140px"><label class="brw-label">Severity</label><select name="severity" class="brw-select"><option>Low</option><option>Medium</option><option>High</option></select></div>
      </div>
      <div class="brw-row"><div class="brw-col"><label class="brw-label">Description (required)</label><textarea name="description" required class="brw-textarea" placeholder="What did you expect to happen? Include steps to reproduce."></textarea></div></div>
      <div class="brw-row"><div class="brw-col"><label class="brw-label">Page URL</label><input name="pageUrl" class="brw-input" readonly></div></div>
      <div class="brw-row"><div class="brw-col"><label class="brw-label">Email (optional)</label><input name="email" class="brw-input" type="email" placeholder="you@example.com"></div></div>
      <div class="brw-row"><div class="brw-col"><label class="brw-label">Screenshot (optional)</label><input name="screenshot" class="brw-file" type="file" accept="image/*"></div></div>
      <div class="brw-row brw-consent"><input name="consent" type="checkbox" required><div class="brw-small">I consent to send this report (includes URL, user agent, timestamp and optional console errors)</div></div>
      <div class="brw-row"><div class="brw-col"><label class="brw-label">Optional console/error snippet</label><textarea name="consoleSnippet" class="brw-textarea" placeholder="Recent console errors (auto-captured)"></textarea></div></div>
      <div class="brw-actions"><button type="button" id="brw-cancel" class="brw-muted">Cancel</button><button type="submit" class="brw-primary">Send report</button></div>
    </form>
    <div id="brw-thanks" class="brw-thanks" style="display:none">Thanks — your report was submitted.</div>
  `;

  const form = modal.querySelector("#brw-form");
  const cancel = modal.querySelector("#brw-cancel");
  const thanks = modal.querySelector("#brw-thanks");

  // Populate auto fields
  const pageUrlInput = form.querySelector('input[name="pageUrl"]');
  const consoleSnippet = form.querySelector('textarea[name="consoleSnippet"]');
  pageUrlInput.value = location.href;
  consoleSnippet.value = recentErrors
    .slice(-10)
    .map((e) => `${e.time} ${e.type} ${e.message || ""} ${e.args ? e.args.join(" ") : ""}`)
    .join("\n");

  // Open/close handlers
  function open() {
    overlay.style.display = "flex";
    form.style.display = "";
    thanks.style.display = "none";
    setTimeout(() => {
      const first = form.querySelector('[name="description"]');
      if (first) first.focus();
    }, 10);
    document.body.style.overflow = "hidden";
  }
  function close() {
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  btn.addEventListener("click", open);
  cancel.addEventListener("click", close);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") close();
  });

  // Submit handler
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const data = new FormData(form);
    // attach captured context
    const context = {
      pageUrl: location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      recentErrors: recentErrors.slice(-20),
    };

    // include context as JSON blob
    data.append("context", JSON.stringify(context));

    const screenshotInput = form.querySelector('input[name="screenshot"]');
    const hasFile = screenshotInput && screenshotInput.files && screenshotInput.files.length > 0;

    // Simple validation
    const desc = form.querySelector('[name="description"]').value.trim();
    const consent = form.querySelector('[name="consent"]');
    if (!desc) {
      alert("Description is required");
      return;
    }
    if (consent && !consent.checked) {
      alert("Consent is required to submit this report");
      return;
    }

    // disable form
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      let res;
      if (hasFile) {
        // already using FormData (multipart)
        res = await fetch(config.endpoint, { method: "POST", body: data });
      } else {
        // convert to JSON for simpler endpoints
        const json = {};
        for (const [k, v] of data.entries()) {
          if (k === "context") json[k] = JSON.parse(v);
          else json[k] = v;
        }
        res = await fetch(config.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(json) });
      }

      if (res && (res.ok || res.status === 201 || res.status === 200)) {
        form.style.display = "none";
        thanks.style.display = "";
        // reset
        form.reset();
      } else {
        // network or server error
        const text = res ? await res.text().catch(() => "") : "";
        alert("Failed to send report: " + (res ? res.statusText || text : "network error"));
      }
    } catch (err) {
      console.error("brw:send", err);
      alert("Failed to send report: " + err.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send report";
    }
  });

  // expose a small API to open the widget programmatically
  window.BugReportWidget = {
    open: open,
    close: close,
    getRecentErrors: () => recentErrors.slice(),
  };
})();
