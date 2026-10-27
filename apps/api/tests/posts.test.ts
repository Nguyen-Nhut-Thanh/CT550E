import 'reflect-metadata';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PostsService } from '../src/modules/posts/posts.service';
import { PostsAdminController } from '../src/modules/posts/posts-admin.controller';
import type { CloudinaryService } from '../src/infrastructure/storage/cloudinary.service';
import { parseArticleDocument } from '../src/modules/posts/article-input';
import { createDestinationTemplate, type ArticleDocument } from 'shared';
import type { PrismaService } from '../src/infrastructure/database/prisma.service';

const post = (id: number, status = 1) => ({ post_id: id, status, category_id: 1, slug: `bai-${id}`, title: `Bài ${id}`, content: 'Nội dung', summary: null, thumbnail: 'https://example.com/cover.jpg' });
const service = (client: object) => new PostsService(client as PrismaService);

test('layout preserves fixed slots and fills gaps without duplicates or drafts', async () => {
  const instance = service({
    blog_placements: { findMany: async () => [{ slot: 4, post_id: 2, post: post(2) }, { slot: 1, post_id: 99, post: post(99, 0) }] },
    posts: { findMany: async () => [post(1), post(2), post(3)] },
  });
  const layout = await instance.getPublicLayout();
  assert.equal(layout.length, 9);
  assert.deepEqual(layout.map(item => item?.post_id ?? null), [1, 3, null, 2, null, null, null, null, null]);
});

test('invalid, duplicate and unpublished selections never delete saved placements', async () => {
  let deleted = false;
  const tx = { $executeRaw: async () => 1, posts: { count: async () => 0 }, blog_placements: { deleteMany: async () => { deleted = true; } } };
  const instance = service({ $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx) });
  for (const invalid of [undefined, [], Array(9).fill(1), [1, ...Array(8).fill(null)], [-1, ...Array(8).fill(null)], ['1', ...Array(8).fill(null)]]) {
    await assert.rejects(instance.saveLayout(invalid));
  }
  assert.equal(deleted, false);
});

test('a sole article assigned to a secondary position is promoted to the main article', async () => {
  const instance = service({ blog_placements: { findMany: async () => [{ slot: 9, post_id: 1, post: post(1) }] }, posts: { findMany: async () => [post(1)] } });
  const slots = await instance.getPublicLayout();
  assert.equal(slots[0]?.post_id, 1);
  assert.equal(slots.filter(Boolean).length, 1);
});

test('layout saves all positions atomically and retains empty positions', async () => {
  let saved: unknown;
  const tx = { $executeRaw: async () => 1, posts: { count: async () => 2 }, blog_placements: { deleteMany: async () => {}, createMany: async ({ data }: { data: unknown }) => { saved = data; }, findMany: async () => saved } };
  const instance = service({ $transaction: async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx) });
  await instance.saveLayout([1, null, null, null, null, null, null, null, 2]);
  assert.deepEqual(saved, [{ slot: 1, post_id: 1 }, { slot: 9, post_id: 2 }]);
});

test('public detail filters unpublished posts and removes current post from suggestions', async () => {
  const queries: unknown[] = [];
  const instance = service({ posts: { findFirst: async (query: unknown) => { queries.push(query); return post(3); }, findMany: async () => [post(4)] } });
  instance.getPublicLayout = async () => [post(1), post(3), post(2), null, null, null, null, null, null] as never;
  const detail = await instance.getPublicPost('bai-3');
  assert.deepEqual((queries[0] as { where: unknown }).where, { slug: 'bai-3', status: 1 });
  assert.equal(detail.post.post_id, 3);
  assert.deepEqual(detail.featured.map(item => item?.post_id), [2]);
  assert.ok(detail.related.every(item => item.post_id !== 3));
  const missing = service({ posts: { findFirst: async () => null } });
  await assert.rejects(missing.getPublicPost('draft'), /chưa được xuất bản/);
});

test('editing title retains the published slug and validates empty content', async () => {
  let updated: { data: { slug: string } } | undefined;
  const instance = service({ posts: { findUnique: async () => post(1), findFirst: async () => null, update: async (input: typeof updated) => { updated = input; return input; } } });
  await instance.updatePost(1, { title: 'Tiêu đề mới', content: 'Nội dung mới' });
  assert.equal(updated?.data.slug, 'bai-1');
  await assert.rejects(instance.updatePost(1, { content: '  ' }), /nội dung/);
  await assert.rejects(instance.createPost(1, { title: ' ', content: 'Nội dung', category_id: 1 }), /Tiêu đề/);
});
test('article image upload keeps large images and reports missing files and storage errors', async () => {
  let options: unknown;
  const storage = { uploadBuffer: async (_buffer: Buffer, input: unknown) => { options = input; return { secure_url: 'https://example.com/post.jpg' }; } };
  const controller = new PostsAdminController(service({}), storage as unknown as CloudinaryService);
  await assert.rejects(controller.uploadImage(undefined as unknown as Express.Multer.File), /chọn ảnh/);
  assert.deepEqual(await controller.uploadImage({ buffer: Buffer.from('image'), size: 5 } as Express.Multer.File), { url: 'https://example.com/post.jpg' });
  assert.deepEqual((options as { transformation: unknown }).transformation, [{ width: 1920, height: 1920, crop: 'limit' }]);
  storage.uploadBuffer = async () => { throw new Error('Storage unavailable'); };
  await assert.rejects(controller.uploadImage({ buffer: Buffer.from('image'), size: 5 } as Express.Multer.File), /Không thể tải ảnh/);
});

test('block input rejects unknown versions, duplicate ids and executable URLs', () => {
  assert.deepEqual(parseArticleDocument(createDestinationTemplate()), createDestinationTemplate());
  for (const document of [
    { version: 9, blocks: [] },
    { version: 1, blocks: [{ id: 'same', type: 'paragraph', text: 'one' }, { id: 'same', type: 'paragraph', text: 'two' }] },
    { version: 1, blocks: [{ id: 'image', type: 'image', url: 'javascript:alert(1)', alt: '', caption: '' }] },
    { version: 1, blocks: [{ id: 'callout', type: 'callout', icon: 'script', tone: 'tip', text: 'text' }] },
    { version: 1, blocks: [{ id: 'html', type: 'html', text: '<script>' }] },
  ]) assert.throws(() => parseArticleDocument(document));
});

test('drafts allow unfinished blocks; publishing requires a cover and real content', async () => {
  let created: { data: Record<string, unknown> } | undefined;
  const instance = service({ posts: { findUnique: async () => null, create: async (input: typeof created) => { created = input; return input?.data; } } });
  await instance.createPost(1, { status: 0, category_id: 1, content_blocks: createDestinationTemplate() });
  assert.equal(created?.data.title, 'Bản nháp chưa đặt tên');
  assert.equal(created?.data.published_at, null);
  await assert.rejects(instance.createPost(1, { title: 'Bài mới', category_id: 1, content_blocks: createDestinationTemplate() }), /ảnh bìa/);
  await assert.rejects(instance.createPost(1, { title: 'Bài mới', category_id: 1, thumbnail: 'https://example.com/cover.jpg', content_blocks: createDestinationTemplate() }), /nội dung thực tế/);
});

test('blocks persist, generate searchable text and resolve selected tour URLs on the server', async () => {
  let created: Record<string, unknown> = {};
  const instance = service({ posts: { findUnique: async () => null, create: async ({ data }: { data: Record<string, unknown> }) => { created = data; return data; } }, tours: { findUnique: async () => ({ tour_id: 7, status: 1 }) } });
  const document: ArticleDocument = { version: 1, blocks: [{ id: 'p', type: 'paragraph', text: 'Du lịch **Hạ Long**' }, { id: 'cta', type: 'cta', label: 'Đặt tour', url: '/wrong-url', tour_id: 7 }] };
  await instance.createPost(1, { title: 'Hạ Long', category_id: 1, thumbnail: 'https://example.com/cover.jpg', author_display_name: ' Biên tập ', tags: ['#Hạ Long', 'Hạ Long', 'Du lịch'], cover_position: 'bottom', content_blocks: document });
  assert.equal(created.content, 'Du lịch **Hạ Long**\n\nĐặt tour');
  assert.deepEqual(created.tags, ['Hạ Long', 'Du lịch']);
  assert.equal(created.author_display_name, 'Biên tập');
  assert.equal((created.content_blocks as ArticleDocument).blocks[1].type, 'cta');
  assert.equal(((created.content_blocks as ArticleDocument).blocks[1] as { url: string }).url, '/tours/7');
  assert.ok(created.published_at instanceof Date);
});

test('editing or republishing an article preserves its original publication date', async () => {
  let saved: Record<string, unknown> = {};
  const originalDate = new Date('2026-10-20T00:00:00Z');
  const existing = { ...post(1, 0), published_at: originalDate };
  const instance = service({ posts: { findUnique: async () => existing, findFirst: async () => null, update: async ({ data }: { data: Record<string, unknown> }) => { saved = data; return { ...existing, ...data }; } } });
  await instance.updatePost(1, { status: 1 });
  assert.equal(saved.published_at, undefined);
  existing.published_at = null as unknown as Date;
  await instance.updatePost(1, { status: 1 });
  assert.ok(saved.published_at instanceof Date);
});
