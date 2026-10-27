import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { BlogBody } from '@/components/blog/BlogBody';
import { ArticleBlocks } from '@/components/blog/ArticleBlocks';
import { PostEditorContent } from '@/components/admin/posts/PostEditorContent';
import { buildPostEditorForm, createDefaultPostEditorForm } from '@/lib/admin/posts/forms';
import { createDestinationTemplate, type ArticleDocument } from 'shared';

test('article content renders headings, emphasis, paragraphs, lists and uploaded images', () => {
  const html = renderToStaticMarkup(<BlogBody content={'## Kinh nghiệm\n\nĐoạn **in đậm** và *in nghiêng*.\nXuống dòng.\n\n- Mục một\n- Mục hai\n\n1. Bước một\n2. Bước hai\n\n![Cảnh đẹp](https://example.com/image.jpg)\n\n[Tour](/tours)'} />);
  for (const pattern of [/<h2[^>]*>Kinh nghiệm<\/h2>/, /<strong>in đậm<\/strong>/, /<em>in nghiêng<\/em>/, /<ul/, /<ol/, /<figcaption/, /href="\/tours"/]) assert.match(html, pattern);
});
test('article content escapes HTML and blocks executable links and images', () => {
  const html = renderToStaticMarkup(<BlogBody content={'<script>alert(1)</script>\n\n[click](javascript:alert)\n\n![bad](data:text/html,script)\n\n[bad](//evil.test)'} />);
  assert.doesNotMatch(html, /<script|href="javascript:|src="data:|href="\/\/evil/);
  assert.match(html, /&lt;script&gt;/);
});
test('unfinished emphasis stays readable while composing', () => {
  const html = renderToStaticMarkup(<BlogBody content={'Một đoạn\n\n*chưa đóng'} />);
  assert.match(html, /\*chưa đóng/);
});

test('destination blocks render experiences, advice, photos and the tour button without empty gaps', () => {
  const document: ArticleDocument = { version: 1, blocks: [
    { id: 'title', type: 'heading', level: 2, text: 'Viên ngọc xanh' },
    { id: 'p', type: 'paragraph', text: 'Khám phá **Hạ Long**' },
    { id: 'image', type: 'image', url: '/photo.jpg', alt: 'Toàn cảnh vịnh', caption: 'Hạ Long' },
    { id: 'experience', type: 'experiences', title: 'Trải nghiệm', items: [{ icon: 'ship', title: 'Du thuyền', description: 'Ngắm vịnh' }] },
    { id: 'tip', type: 'callout', icon: 'lightbulb', tone: 'tip', text: 'Đi vào tháng 4' },
    { id: 'cta', type: 'cta', label: 'Đặt tour ngay', url: '/tours/7', tour_id: 7 },
    { id: 'empty-photo', type: 'image', url: '', alt: '', caption: '' },
    { id: 'empty-cta', type: 'cta', label: 'Nút trống', url: '' },
  ] };
  const html = renderToStaticMarkup(<ArticleBlocks document={document} />);
  for (const pattern of [/Viên ngọc xanh/, /<strong>Hạ Long<\/strong>/, /alt="Toàn cảnh vịnh"/, /Du thuyền/, /Đi vào tháng 4/, /href="\/tours\/7"/]) assert.match(html, pattern);
  assert.doesNotMatch(html, /Nút trống/);
  assert.equal((html.match(/<figure/g) || []).length, 1);
  assert.equal(renderToStaticMarkup(<ArticleBlocks document={{ version: 1, blocks: createDestinationTemplate().blocks.filter(block => !['heading'].includes(block.type)) }} />), '<div class="space-y-7"></div>');
});

test('existing article content is preserved when opening the block editor', () => {
  const form = buildPostEditorForm({ post_id: 1, title: 'Bài cũ', slug: 'bai-cu', content: '## Giới thiệu\n\nNội dung cũ **giữ nguyên**.', summary: null, thumbnail: null, category_id: 1, status: 0 });
  assert.deepEqual(form.content_blocks.blocks, [{ id: 'legacy-content', type: 'paragraph', text: form.content }]);
  assert.equal(form.slug, 'bai-cu');
  assert.equal(form.cover_position, 'center');
  assert.match(renderToStaticMarkup(<ArticleBlocks document={form.content_blocks} />), /<strong>giữ nguyên<\/strong>/);
});

test('new article form starts with the destination template and has no preview feature', () => {
  const form = createDefaultPostEditorForm();
  assert.equal(form.content_blocks.blocks.length, 8);
  const html = renderToStaticMarkup(<PostEditorContent form={form} onFormChange={() => {}} />);
  for (const text of ['Dùng mẫu giới thiệu điểm đến', 'Nhóm trải nghiệm', 'Mô tả ảnh', 'Chữ trên nút', 'Thêm khối nội dung']) assert.ok(html.includes(text));
  assert.doesNotMatch(html, /Xem trước|Xem nội dung/);
});
