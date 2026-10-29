"use client";
import { useEffect, useRef, useState } from "react";
import { Bold, Italic, Link2 } from "lucide-react";
import { isArticleUrl } from "shared";

function html(value: string) {
  const escaped = value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return escaped
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label: string, url: string) =>
      isArticleUrl(url)
        ? `<a href="${url}" style="color:#2563eb;text-decoration:underline">${label}</a>`
        : match,
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}
function markdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
  if (!(node instanceof HTMLElement)) return "";
  const children = Array.from(node.childNodes).map(markdown).join("");
  switch (node.tagName) {
    case "SCRIPT":
    case "STYLE":
      return "";
    case "B":
    case "STRONG":
      return children ? `**${children}**` : "";
    case "I":
    case "EM":
      return children ? `*${children}*` : "";
    case "A": {
      const url = node.getAttribute("href") || "";
      return isArticleUrl(url) ? `[${children}](${url})` : children;
    }
    case "BR":
      return "\n";
    case "DIV":
    case "P":
      return `\n${children}`;
    default:
      return children;
  }
}

/** Visual text field stores only the supported emphasis and link syntax. */
export function PostRichTextInput({
  value,
  onChange,
  label = "Đoạn văn",
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const editor = useRef<HTMLDivElement>(null);
  const last = useRef<string | null>(null);
  const range = useRef<Range | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (editor.current && value !== last.current) {
      editor.current.innerHTML = html(value);
      last.current = value;
    }
  }, [value]);
  function save() {
    if (!editor.current) return;
    const text = Array.from(editor.current.childNodes)
      .map(markdown)
      .join("")
      .replace(/\u00a0/g, " ");
    last.current = text;
    onChange(text);
  }
  function format(
    command: "bold" | "italic" | "createLink",
    parameter?: string,
  ) {
    editor.current?.focus();
    if (command === "createLink" && range.current) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range.current);
    }
    document.execCommand(command, false, parameter);
    save();
  }
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex gap-1 border-b border-slate-100 bg-slate-50 p-1.5">
        <button
          type="button"
          aria-label="In đậm"
          title="In đậm"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => format("bold")}
          className="rounded-lg p-2 text-slate-600 hover:bg-blue-100"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          aria-label="In nghiêng"
          title="In nghiêng"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => format("italic")}
          className="rounded-lg p-2 text-slate-600 hover:bg-blue-100"
        >
          <Italic size={16} />
        </button>
        <button
          type="button"
          aria-label="Chèn liên kết"
          title="Chèn liên kết"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            const selection = window.getSelection();
            range.current = selection?.rangeCount
              ? selection.getRangeAt(0).cloneRange()
              : null;
            setLinkOpen(!linkOpen);
          }}
          className="rounded-lg p-2 text-slate-600 hover:bg-blue-100"
        >
          <Link2 size={16} />
        </button>
      </div>
      {linkOpen && (
        <div className="space-y-2 border-b bg-blue-50 p-3">
          <input
            aria-label="Địa chỉ liên kết"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://... hoặc /tours"
            className="w-full rounded-lg border border-slate-200 bg-white p-2 text-sm"
          />
          <button
            type="button"
            onClick={() => {
              if (!isArticleUrl(url)) {
                setError("Vui lòng nhập liên kết hợp lệ.");
                return;
              }
              format("createLink", url);
              setLinkOpen(false);
              setUrl("");
              setError("");
            }}
            className="rounded-lg bg-blue-600 px-3 py-2 text-xs text-white"
          >
            Gắn liên kết vào chữ đã chọn
          </button>
          {error && (
            <p role="alert" className="text-xs text-red-600">
              {error}
            </p>
          )}
        </div>
      )}
      <div
        ref={editor}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label={label}
        aria-multiline="true"
        onInput={save}
        onBlur={save}
        onPaste={(event) => {
          event.preventDefault();
          document.execCommand(
            "insertText",
            false,
            event.clipboardData.getData("text/plain"),
          );
          save();
        }}
        className="min-h-36 whitespace-pre-wrap break-words p-4 text-sm leading-7 text-slate-700 outline-none focus:ring-2 focus:ring-inset focus:ring-blue-200"
      />
    </div>
  );
}
