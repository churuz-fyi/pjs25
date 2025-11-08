import { useState, useEffect } from "react";

// Store recent errors
const MAX_ERRORS = 50;
const recentErrors = [];

const pushError = (obj) => {
  try {
    recentErrors.push(obj);
    if (recentErrors.length > MAX_ERRORS) recentErrors.shift();
  } catch (e) {
    // ignore
  }
};

// Error handling setup
const setupErrorHandling = () => {
  const origConsoleError = console.error.bind(console);
  console.error = function (...args) {
    pushError({
      time: new Date().toISOString(),
      type: "console.error",
      args: args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))),
    });
    origConsoleError(...args);
  };

  window.addEventListener("error", function (e) {
    pushError({
      time: new Date().toISOString(),
      type: "uncaught",
      message: e.message,
      filename: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      stack: e.error && e.error.stack,
    });
  });
};

export default function BugReportWidget({ config = { endpoint: "/api/reports" } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setupErrorHandling();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = new FormData(form);

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

    // Attach captured context
    const context = {
      pageUrl: location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      recentErrors: recentErrors.slice(-20),
    };

    data.append("context", JSON.stringify(context));

    const screenshotInput = form.querySelector('input[name="screenshot"]');
    const hasFile = screenshotInput?.files?.length > 0;

    setIsSending(true);

    try {
      let res;
      if (hasFile) {
        // Using FormData (multipart)
        res = await fetch(config.endpoint, { method: "POST", body: data });
      } else {
        // Convert to JSON for simpler endpoints
        const json = {};
        for (const [k, v] of data.entries()) {
          if (k === "context") json[k] = JSON.parse(v);
          else json[k] = v;
        }
        res = await fetch(config.endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json),
        });
      }

      if (res && (res.ok || res.status === 201 || res.status === 200)) {
        setIsSubmitted(true);
        form.reset();
      } else {
        const text = res ? await res.text().catch(() => "") : "";
        alert("Failed to send report: " + (res ? res.statusText || text : "network error"));
      }
    } catch (err) {
      console.error("brw:send", err);
      alert("Failed to send report: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed right-5 bottom-5 z-[99999] bg-red-500 text-white border-none rounded-full px-4.5 py-3 font-semibold shadow-lg hover:bg-red-600 transition-colors cursor-pointer"
        aria-label="Report a bug"
      >
        Report a bug
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100000]" onClick={(e) => e.target === e.currentTarget && setIsOpen(false)}>
          <div className="w-[min(760px,95vw)] max-h-[90vh] overflow-auto bg-white rounded-xl p-4.5 shadow-xl font-sans">
            <h3 className="text-lg font-semibold m-0 mb-2">Report an issue</h3>

            {!isSubmitted ? (
              <form onSubmit={handleSubmit}>
                <div className="flex gap-2 items-center my-2">
                  <div className="flex-1">
                    <label className="text-sm text-gray-900 mb-1.5 block">Category</label>
                    <select name="category" className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                      <option>Bug</option>
                      <option>Idea</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="w-[140px]">
                    <label className="text-sm text-gray-900 mb-1.5 block">Severity</label>
                    <select name="severity" className="w-full p-2 border border-gray-200 rounded-lg text-sm">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>

                <div className="my-2">
                  <label className="text-sm text-gray-900 mb-1.5 block">Description (required)</label>
                  <textarea name="description" required className="w-full p-2 border border-gray-200 rounded-lg text-sm min-h-[120px] resize-y" placeholder="What did you expect to happen? Include steps to reproduce." />
                </div>

                <div className="my-2">
                  <label className="text-sm text-gray-900 mb-1.5 block">Page URL</label>
                  <input name="pageUrl" className="w-full p-2 border border-gray-200 rounded-lg text-sm" readOnly value={location.href} />
                </div>

                <div className="my-2">
                  <label className="text-sm text-gray-900 mb-1.5 block">Email (optional)</label>
                  <input name="email" type="email" className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="you@example.com" />
                </div>

                <div className="my-2">
                  <label className="text-sm text-gray-900 mb-1.5 block">Screenshot (optional)</label>
                  <input name="screenshot" type="file" accept="image/*" className="border-none p-1" />
                </div>

                <div className="flex items-center gap-2 my-2">
                  <input name="consent" type="checkbox" required />
                  <div className="text-xs text-gray-500">I consent to send this report (includes URL, user agent, timestamp and optional console errors)</div>
                </div>

                <div className="my-2">
                  <label className="text-sm text-gray-900 mb-1.5 block">Optional console/error snippet</label>
                  <textarea
                    name="consoleSnippet"
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm min-h-[120px] resize-y"
                    defaultValue={recentErrors
                      .slice(-10)
                      .map((e) => `${e.time} ${e.type} ${e.message || ""} ${e.args ? e.args.join(" ") : ""}`)
                      .join("\n")}
                  />
                </div>

                <div className="flex gap-2 justify-end mt-3">
                  <button type="button" onClick={() => setIsOpen(false)} className="bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSending} className="bg-blue-600 text-white border-none px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSending ? "Sending..." : "Send report"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-5 text-center">Thanks — your report was submitted.</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
