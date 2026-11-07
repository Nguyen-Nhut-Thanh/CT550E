import { isArticleUrl } from 'shared';

export function escapeRichText(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Convert the supported text syntax to escaped, editable HTML. Raw HTML stays text. */
export function richTextToHtml(value: string) {
  const inline = (text: string) => escapeRichText(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label: string, url: string) => isArticleUrl(url) ? `<a href="${url}">${label}</a>` : match)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const lines = value.replace(/\r\n/g, '\n').split('\n');
  let result = '', list: 'ul' | 'ol' | null = null;
  for (const line of lines) {
    const ordered = /^\d+\.\s+/.test(line), unordered = /^[-*•]\s+/.test(line);
    const type = ordered ? 'ol' : unordered ? 'ul' : null;
    if (list && list !== type) { result += `</${list}>`; list = null; }
    if (type) {
      if (!list) { result += `<${type}>`; list = type; }
      result += `<li>${inline(line.replace(/^(?:\d+\.|[-*•])\s+/, ''))}</li>`;
    } else result += `<div>${inline(line) || '<br>'}</div>`;
  }
  if (list) result += `</${list}>`;
  return value ? result : '';
}

export function richTextNodeToText(node: Node): string {
  if (node.nodeType === 3) return node.textContent || '';
  if (!(node instanceof HTMLElement)) return '';
  const children = Array.from(node.childNodes).map(richTextNodeToText).join('');
  switch (node.tagName) {
    case 'SCRIPT': case 'STYLE': return '';
    case 'B': case 'STRONG': return children ? `**${children}**` : '';
    case 'I': case 'EM': return children ? `*${children}*` : '';
    case 'A': {
      const url = node.getAttribute('href') || '';
      return isArticleUrl(url) ? `[${children}](${url})` : children;
    }
    case 'BR': return '\n';
    case 'LI': {
      const ordered = node.parentElement?.tagName === 'OL';
      const index = node.parentElement ? Array.from(node.parentElement.children).indexOf(node) + 1 : 1;
      return `${ordered ? `${index}.` : '-'} ${children.trim()}\n`;
    }
    case 'UL': case 'OL': return `\n${children}\n`;
    case 'DIV': case 'P': return `\n${children}`;
    default: return children;
  }
}
