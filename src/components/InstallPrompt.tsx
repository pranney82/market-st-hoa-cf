import { useState, useEffect } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Don't show if already installed or previously dismissed this week
    const dismissed = localStorage.getItem("install-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Delay showing — don't interrupt first page load
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  }

  function dismiss() {
    setShow(false);
    localStorage.setItem("install-dismissed", String(Date.now()));
  }

  if (!show) return null;

  return (
    <div className="fixed left-4 right-4 md:left-auto md:right-6 md:w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50" style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0">M</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Install HOA Portal</p>
          <p className="text-xs text-gray-500 mt-0.5">Quick access from your home screen with push notifications</p>
          <div className="flex gap-2 mt-3">
            <button onClick={install} className="px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Install
            </button>
            <button onClick={dismiss} className="px-4 py-2.5 text-gray-500 text-sm hover:text-gray-700">
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
