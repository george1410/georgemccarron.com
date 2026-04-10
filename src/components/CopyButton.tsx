import { useState, useCallback, type ReactNode } from "react";

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <button
      onClick={copy}
      className="absolute top-3 right-3 p-1 rounded-md text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
      aria-label="Copy code"
    >
      {copied ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-green-400">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

export function Pre({ children, ...props }: { children?: ReactNode } & Record<string, unknown>) {
  // Extract text content from the code element for copying
  const getTextContent = (node: ReactNode): string => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(getTextContent).join("");
    if (node && typeof node === "object" && "props" in node) {
      return getTextContent((node as { props: { children?: ReactNode } }).props.children);
    }
    return "";
  };

  const code = getTextContent(children).replace(/\n$/, "");

  return (
    <pre {...props} className={`${(props.className as string) ?? ""} group relative`}>
      <CopyButton code={code} />
      {children}
    </pre>
  );
}
