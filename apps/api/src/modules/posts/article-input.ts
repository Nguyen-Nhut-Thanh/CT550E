import { BadRequestException } from '@nestjs/common';
import { ARTICLE_ICONS, isArticleUrl } from 'shared';
import type { ArticleBlock, ArticleDocument, ArticleIcon } from 'shared';

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('Khối nội dung không hợp lệ.');
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 50000): string {
  if (typeof value !== 'string' || value.length > max) throw new BadRequestException('Nội dung khối không hợp lệ hoặc quá dài.');
  return value;
}
function icon(value: unknown): ArticleIcon {
  if (!ARTICLE_ICONS.includes(value as ArticleIcon)) throw new BadRequestException('Biểu tượng không hợp lệ.');
  return value as ArticleIcon;
}
function url(value: unknown) {
  const result = text(value, 2048).trim();
  if (result && !isArticleUrl(result)) throw new BadRequestException('Liên kết cần bắt đầu bằng https://, http:// hoặc /.');
  return result;
}
export function parseArticleDocument(value: unknown): ArticleDocument {
  const document = object(value);
  if (document.version !== 1 || !Array.isArray(document.blocks) || document.blocks.length > 80) throw new BadRequestException('Bài viết chỉ hỗ trợ tối đa 80 khối ở phiên bản 1.');
  const ids = new Set<string>();
  const blocks: ArticleBlock[] = document.blocks.map(value => {
    const block = object(value);
    const id = text(block.id, 100);
    if (!id.trim() || ids.has(id)) throw new BadRequestException('Mã khối nội dung bị trùng hoặc trống.');
    ids.add(id);
    switch (block.type) {
      case 'paragraph': return { id, type: 'paragraph', text: text(block.text) };
      case 'heading':
        if (block.level !== 2 && block.level !== 3) throw new BadRequestException('Cấp tiêu đề không hợp lệ.');
        return { id, type: 'heading', text: text(block.text, 500), level: block.level };
      case 'image': return { id, type: 'image', url: url(block.url), alt: text(block.alt, 500), caption: text(block.caption, 1000) };
      case 'callout':
        if (!['tip', 'note', 'warning'].includes(String(block.tone))) throw new BadRequestException('Kiểu lưu ý không hợp lệ.');
        return { id, type: 'callout', icon: icon(block.icon), tone: block.tone as 'tip' | 'note' | 'warning', text: text(block.text) };
      case 'experiences':
        if (!Array.isArray(block.items) || block.items.length > 30) throw new BadRequestException('Mỗi nhóm có tối đa 30 trải nghiệm.');
        return { id, type: 'experiences', title: text(block.title, 500), items: block.items.map(value => {
          const item = object(value);
          return { icon: icon(item.icon), title: text(item.title, 500), description: text(item.description, 5000) };
        }) };
      case 'list':
        if (typeof block.ordered !== 'boolean' || !Array.isArray(block.items) || block.items.length > 100) throw new BadRequestException('Danh sách không hợp lệ.');
        return { id, type: 'list', ordered: block.ordered, items: block.items.map(item => text(item, 5000)) };
      case 'cta': {
        if (block.tour_id !== undefined && (!Number.isInteger(block.tour_id) || Number(block.tour_id) < 1)) throw new BadRequestException('Tour không hợp lệ.');
        return { id, type: 'cta', label: text(block.label, 150), url: url(block.url), ...(block.tour_id === undefined ? {} : { tour_id: Number(block.tour_id) }) };
      }
      default: throw new BadRequestException('Loại khối nội dung không được hỗ trợ.');
    }
  });
  return { version: 1, blocks };
}
