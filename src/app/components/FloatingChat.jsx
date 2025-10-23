
"use client";
import { useEffect, useRef, useState } from "react";

export default function FloatingChat() {
  const chatbotUrl = "https://state101-aichatbot.streamlit.app/?embed=true";

  const [sessionActive, setSessionActive] = useState(false);
  const [open, setOpen] = useState(false);
  const [isSmall, setIsSmall] = useState(false);

  const [loaded, setLoaded] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  const panelRef = useRef(null);
  const iframeRef = useRef(null);
  const loadTimerRef = useRef(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsSmall(mq.matches);
    update();
    if (mq.addEventListener) mq.addEventListener("change", update);
    else mq.addListener(update);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", update);
      else mq.removeListener(update);
    };
  }, []);

  useEffect(() => {
    if (!sessionActive) return;
    setLoaded(false);
    setLoadTimedOut(false);
    loadTimerRef.current = setTimeout(() => setLoadTimedOut(true), 5000);
    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, [sessionActive, reloadKey]);

  const handleIframeLoad = () => {
    setLoaded(true);
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
  };

  const handleOpen = () => {
    if (!sessionActive) setSessionActive(true);
    setOpen(true);
  };

  const handleMinimize = () => setOpen(false);

  const handleExit = () => {
    setOpen(false);
    setSessionActive(false);
    setReloadKey((k) => k + 1);
    setLoaded(false);
    setLoadTimedOut(false);
  };

  const handleRetry = () => {
    setLoaded(false);
    setLoadTimedOut(false);
    setReloadKey((k) => k + 1);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") handleMinimize();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const basePanelClass =
    "fixed z-50 bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden rounded-none sm:rounded-xl";
  const openStyle = isSmall
    ? { inset: 0, width: "100vw", height: "100vh", resize: "none" }
    : {
        bottom: 24,
        right: 24,
        width: 420,
        height: 560,
        minWidth: 320,
        minHeight: 380,
        maxWidth:
          Math.min(
            typeof window !== "undefined" ? window.innerWidth - 24 * 2 : 720,
            720
          ),
        maxHeight:
          Math.min(
            typeof window !== "undefined" ? window.innerHeight - 24 * 2 : 900,
            900
          ),
        resize: "both",
      };

  const minimizedStyle = {
    bottom: 0,
    right: 0,
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: "none",
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={handleOpen}
          aria-label={sessionActive ? "Restore chat" : "Chat with State101 Assistant"}
          title={sessionActive ? "Restore chat" : "Chat with State101 Assistant"}
          className="chat-fab fixed bottom-6 right-6 z-50 inline-flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300/40"
          style={{ width: 56, height: 56, position: "fixed" }}
        >
          {sessionActive && !open && (
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white"
            />
          )}
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor" aria-hidden="true">
            <path d="M20 2H4a2 2 0 0 0-2 2v16.586a1 1 0 0 0 1.707.707L6.414 18H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2ZM6 8h12a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2Zm0 4h9a1 1 0 1 1 0 2H6a1 1 0 1 1 0-2Z" />
          </svg>
        </button>
      )}

      {sessionActive && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="State101 Assistant"
          aria-modal={open && isSmall ? "true" : "false"}
          className={basePanelClass}
          style={open ? openStyle : minimizedStyle}
        >
          <div
            className={`flex items-center justify-between px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex h-2.5 w-2.5 rounded-full ${
                  loaded ? "bg-emerald-300/90" : "bg-yellow-300/90"
                }`}
              />
              <span className="text-sm font-semibold">State101 Assistant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleMinimize}
                aria-label="Minimize chat"
                title="Minimize"
                className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M5 12.75A.75.75 0 0 1 5.75 12h12.5a.75.75 0 0 1 0 1.5H5.75A.75.75 0 0 1 5 12.75Z" />
                </svg>
              </button>
              <button
                onClick={handleExit}
                aria-label="Exit chat"
                title="Exit"
                className="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                  <path d="M6.225 4.811 4.811 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586 6.225 4.811z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 bg-gray-50 relative">
            <iframe
              ref={iframeRef}
              key={reloadKey}
              src={chatbotUrl}
              title="State101 Assistant"
              className="w-full h-full border-0"
              allow="clipboard-read; clipboard-write; fullscreen"
              onLoad={handleIframeLoad}
            />
            {!loaded && loadTimedOut && open && (
              <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center gap-4">
                <p className="text-gray-800">
                  We couldn’t display the chat here. Your browser may be blocking third‑party cookies.
                </p>
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center justify-center rounded bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300/60"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes chatPulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.07);
          }
          100% {
            transform: scale(1);
          }
        }
        .chat-fab {
          animation: chatPulse 2.2s ease-in-out infinite;
        }
        .chat-fab:hover {
          animation: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .chat-fab {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
