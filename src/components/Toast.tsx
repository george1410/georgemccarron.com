import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Tiny toast system: `showToast(message)` from anywhere, `<ToastHost />`
// mounted once at the app root. No context/provider needed — callers
// import the function directly.

type Toast = { id: number; message: string; leaving: boolean };

type Listener = (toast: Omit<Toast, "leaving">) => void;
const listeners = new Set<Listener>();
let nextId = 1;

export function showToast(message: string) {
  const toast = { id: nextId++, message };
  listeners.forEach((l) => l(toast));
}

const DURATION_MS = 2200;
const EXIT_MS = 250;

export function ToastHost() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const onToast: Listener = (t) => {
      setToasts((prev) => [...prev, { ...t, leaving: false }]);
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((x) => (x.id === t.id ? { ...x, leaving: true } : x)),
        );
        setTimeout(() => {
          setToasts((prev) => prev.filter((x) => x.id !== t.id));
        }, EXIT_MS);
      }, DURATION_MS);
    };
    listeners.add(onToast);
    return () => {
      listeners.delete(onToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body,
  );
}

// Separate component so each toast gets its own "mounted" state. Starts
// offscreen/faded, then flips to its final state one paint later so the
// CSS transition actually runs instead of snapping straight to shown.
function ToastItem({ toast }: { toast: Toast }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const visible = entered && !toast.leaving;
  return (
    <div
      className={`px-4 py-2 bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm border border-stone-200 dark:border-zinc-700 text-stone-900 dark:text-zinc-50 rounded-full text-sm font-medium shadow-lg shadow-stone-900/10 dark:shadow-black/30 transition-all duration-[250ms] ease-out ${
        visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-3 scale-95"
      }`}
    >
      {toast.message}
    </div>
  );
}
