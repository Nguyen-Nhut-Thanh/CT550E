export const ARTICLE_ICONS = ['ship', 'camera', 'utensils', 'lightbulb', 'map', 'mountain', 'sun', 'info'] as const;
export type ArticleIcon = typeof ARTICLE_ICONS[number];
export type ArticleBlock = { id: string } & (
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string; level: 2 | 3 }
  | { type: 'image'; url: string; alt: string; caption: string }
  | { type: 'experiences'; title: string; items: { icon: ArticleIcon; title: string; description: string }[] }
  | { type: 'callout'; icon: ArticleIcon; tone: 'tip' | 'note' | 'warning'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'cta'; label: string; url: string; tour_id?: number }
);
export type ArticleDocument = { version: 1; blocks: ArticleBlock[] };
export type CoverPosition = 'top' | 'center' | 'bottom';
export function isArticleUrl(value: string) { return /^(https?:\/\/|\/(?!\/))[^\s<>"']+$/i.test(value); }
export function articleBlockText(block: ArticleBlock): string {
  switch (block.type) {
    case 'paragraph': case 'heading': case 'callout': return block.text;
    case 'image': return block.caption || block.alt;
    case 'experiences': return [block.title, ...block.items.flatMap(item => [item.title, item.description])].join('\n');
    case 'list': return block.items.join('\n');
    case 'cta': return block.label;
  }
}
export function articleText(document: ArticleDocument) { return document.blocks.map(articleBlockText).filter(Boolean).join('\n\n'); }
export function hasArticleContent(document: ArticleDocument) {
  return document.blocks.some(block => block.type === 'paragraph' && block.text.trim() || block.type === 'experiences' && block.items.some(item => item.description.trim()) || block.type === 'list' && block.items.some(item => item.trim()) || block.type === 'callout' && block.text.trim());
}
export function createArticleBlock(type: ArticleBlock['type'], id: string): ArticleBlock {
  switch (type) {
    case 'paragraph': return { id, type, text: '' };
    case 'heading': return { id, type, level: 2, text: '' };
    case 'image': return { id, type, url: '', alt: '', caption: '' };
    case 'experiences': return { id, type, title: 'Những trải nghiệm không thể bỏ lỡ', items: [{ icon: 'ship', title: '', description: '' }] };
    case 'callout': return { id, type, icon: 'lightbulb', tone: 'tip', text: '' };
    case 'list': return { id, type, ordered: false, items: [''] };
    case 'cta': return { id, type, label: 'Đặt tour ngay', url: '' };
  }
}
export function createDestinationTemplate(): ArticleDocument {
  return { version: 1, blocks: [
    { id: 'intro-title', type: 'heading', level: 2, text: '' },
    { id: 'intro', type: 'paragraph', text: '' },
    { id: 'landscape', type: 'image', url: '', alt: '', caption: '' },
    { id: 'experiences', type: 'experiences', title: 'Những trải nghiệm không thể bỏ lỡ', items: [
      { icon: 'ship', title: '', description: '' }, { icon: 'camera', title: '', description: '' }, { icon: 'utensils', title: '', description: '' },
    ] },
    { id: 'travel-tip', type: 'callout', icon: 'lightbulb', tone: 'tip', text: '' },
    { id: 'conclusion-title', type: 'heading', level: 2, text: 'Lời kết' },
    { id: 'conclusion', type: 'paragraph', text: '' },
    { id: 'book-tour', type: 'cta', label: 'Đặt tour ngay', url: '' },
  ] };
}
