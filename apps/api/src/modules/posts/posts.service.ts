import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { PostAdminQuery, PostCategoryPayload, PostPayload } from 'shared';
import { articleText, hasArticleContent, slugify, isArticleUrl } from "shared";
import { parseArticleDocument } from './article-input';
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) { }
    private readonly publicInclude = { category: { select: { name: true } }, author: { select: { users: { select: { full_name: true } } } } };
    async getAdminPost(id: number) {
        if (!Number.isInteger(id) || id < 1) throw new BadRequestException('Mã bài viết không hợp lệ.');
        const post = await this.prisma.posts.findUnique({ where: { post_id: id } });
        if (!post) throw new NotFoundException('Không tìm thấy bài viết.');
        return post;
    }
    async getLayout() { return this.prisma.blog_placements.findMany({ orderBy: { slot: 'asc' } }); }
    async saveLayout(value: unknown) {
        if (!Array.isArray(value) || value.length !== 9 || !value.every(id => id === null || (Number.isInteger(id) && id > 0)))
            throw new BadRequestException('Bố cục phải gồm 9 vị trí hợp lệ.');
        const ids = value.filter((id): id is number => id !== null);
        if (new Set(ids).size !== ids.length) throw new BadRequestException('Một bài chỉ được chọn vào một vị trí.');
        return this.prisma.$transaction(async tx => {
            // Serialize saves so concurrent admins cannot merge two partial layouts.
            await tx.$executeRaw`SELECT pg_advisory_xact_lock(8241909)`;
            const count = await tx.posts.count({ where: { post_id: { in: ids }, status: 1 } });
            if (count !== ids.length) throw new BadRequestException('Chỉ được chọn bài đã xuất bản. Vui lòng tải lại danh sách.');
            await tx.blog_placements.deleteMany();
            if (ids.length) await tx.blog_placements.createMany({ data: value.flatMap((id, index) => id === null ? [] : [{ slot: index + 1, post_id: id }]) });
            return tx.blog_placements.findMany({ orderBy: { slot: 'asc' } });
        });
    }
    async getPublicLayout() {
        const placements = await this.prisma.blog_placements.findMany({ include: { post: { include: this.publicInclude } } });
        const recent = await this.prisma.posts.findMany({ where: { status: 1 }, include: this.publicInclude, orderBy: [{ published_at: 'desc' }, { created_at: 'desc' }, { post_id: 'desc' }], take: 18 });
        const selected = placements.filter(item => item.post.status === 1);
        const used = new Set(selected.map(item => item.post_id));
        const fallback = recent.filter(post => !used.has(post.post_id));
        const slots = Array.from({ length: 9 }, (_, index) => selected.find(item => item.slot === index + 1)?.post ?? fallback.shift() ?? null);
        // A sparse catalogue still needs a main article to render the page.
        if (!slots[0]) {
            const first = slots.findIndex(Boolean);
            if (first > 0) { slots[0] = slots[first]; slots[first] = null; }
        }
        return slots;
    }
    async getPublicPost(slug: string) {
        const post = await this.prisma.posts.findFirst({ where: { slug, status: 1 }, include: this.publicInclude });
        if (!post) throw new NotFoundException('Bài viết không tồn tại hoặc chưa được xuất bản.');
        const layout = await this.getPublicLayout();
        const related = await this.prisma.posts.findMany({ where: { status: 1, category_id: post.category_id, post_id: { not: post.post_id } }, include: this.publicInclude, orderBy: [{ published_at: 'desc' }, { created_at: 'desc' }, { post_id: 'desc' }], take: 4 });
        const ids = new Set([post.post_id, ...related.map(item => item.post_id)]);
        for (const item of layout) if (item && !ids.has(item.post_id) && related.length < 4) { related.push(item); ids.add(item.post_id); }
        return { post, featured: layout.slice(1, 5).filter(item => item && item.post_id !== post.post_id), related };
    }
    private normalizePostPayload(data: PostPayload) {
        if (data.title !== undefined && (typeof data.title !== 'string' || !data.title.trim() || data.title.trim().length > 255)) throw new BadRequestException('Tiêu đề cần từ 1 đến 255 ký tự.');
        if (data.content !== undefined && typeof data.content !== 'string') throw new BadRequestException('Nội dung không hợp lệ.');
        if (data.category_id !== undefined && (!Number.isInteger(Number(data.category_id)) || Number(data.category_id) < 1)) throw new BadRequestException('Vui lòng chọn danh mục.');
        if (data.status !== undefined && ![0, 1].includes(Number(data.status))) throw new BadRequestException('Trạng thái không hợp lệ.');
        if (data.cover_position !== undefined && !['top', 'center', 'bottom'].includes(data.cover_position)) throw new BadRequestException('Vị trí ảnh bìa không hợp lệ.');
        if (data.author_display_name !== undefined && (typeof data.author_display_name !== 'string' || data.author_display_name.length > 150)) throw new BadRequestException('Tên tác giả tối đa 150 ký tự.');
        if (data.tags !== undefined && (!Array.isArray(data.tags) || data.tags.length > 20 || data.tags.some(tag => typeof tag !== 'string' || tag.length > 50))) throw new BadRequestException('Tối đa 20 thẻ, mỗi thẻ tối đa 50 ký tự.');
        const document = data.content_blocks === undefined ? undefined : parseArticleDocument(data.content_blocks);
        return {
            title: data.title?.trim(), summary: data.summary, content: document ? articleText(document) : data.content, thumbnail: data.thumbnail,
            content_blocks: document, author_display_name: data.author_display_name?.trim(), cover_position: data.cover_position,
            tags: data.tags === undefined ? undefined : [...new Set(data.tags.map(tag => tag.trim().replace(/^#+/, '')).filter(Boolean))],
            slug: data.slug ?? (data.title ? slugify(data.title) : undefined),
            category_id: data.category_id !== undefined ? Number(data.category_id) : undefined,
            status: data.status !== undefined ? Number(data.status) : undefined,
        };
    }
    async findAllCategories() {
        return this.prisma.post_categories.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { posts: true } } },
        });
    }
    async createCategory(data: PostCategoryPayload) {
        if (typeof data.name !== 'string' || !data.name.trim() || data.name.trim().length > 100) throw new BadRequestException('Tên danh mục cần từ 1 đến 100 ký tự.');
        const name = data.name.trim();
        const slug = slugify(name);
        if (await this.prisma.post_categories.findFirst({ where: { slug } })) throw new ConflictException('Danh mục này đã tồn tại.');
        return this.prisma.post_categories.create({
            data: { name, description: data.description, slug },
        });
    }
    async findAllAdmin(query: PostAdminQuery) {
        const where: Record<string, unknown> = {};
        if (query.category_id)
            where.category_id = Number(query.category_id);
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { summary: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.posts.findMany({
            where,
            include: {
                category: { select: { name: true } },
                author: { select: { email: true } },
            },
            orderBy: [{ created_at: 'desc' }, { post_id: 'desc' }],
        });
    }
    async createPost(authorId: number, data: PostPayload) {
        if (!data.category_id) throw new BadRequestException('Chọn danh mục trước khi lưu bài viết.');
        const payload = this.normalizePostPayload({ ...data, title: Number(data.status ?? 1) === 0 && !data.title?.trim() ? 'Bản nháp chưa đặt tên' : data.title });
        await this.resolveTourLinks(payload.content_blocks);
        this.validatePublication({ ...payload, status: payload.status ?? 1 });
        const base = (payload.slug || 'bai-viet').slice(0, 240);
        let slug = base;
        let suffix = 2;
        while (await this.prisma.posts.findUnique({ where: { slug } })) slug = `${base}-${suffix++}`;
        return this.prisma.posts.create({
            data: {
                ...payload,
                title: payload.title ?? '',
                slug,
                summary: payload.summary,
                content: payload.content ?? '',
                thumbnail: payload.thumbnail,
                author_id: authorId,
                category_id: payload.category_id!,
                status: payload.status ?? 1,
                published_at: (payload.status ?? 1) === 1 ? new Date() : null,
            },
        });
    }
    async updatePost(id: number, data: PostPayload) {
        const existing = await this.getAdminPost(id);
        const payload = this.normalizePostPayload({ ...data, title: (Number(data.status ?? existing.status) === 0 && data.title !== undefined && !data.title.trim()) ? 'Bản nháp chưa đặt tên' : data.title });
        await this.resolveTourLinks(payload.content_blocks);
        this.validatePublication({ ...existing, ...Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)) });
        payload.slug = data.slug ?? existing.slug;
        if (await this.prisma.posts.findFirst({ where: { slug: payload.slug, post_id: { not: id } } })) throw new ConflictException('Đường dẫn bài viết đã tồn tại.');
        return this.prisma.posts.update({
            where: { post_id: id },
            data: { ...payload, published_at: !existing.published_at && (payload.status ?? existing.status) === 1 ? new Date() : undefined },
        });
    }
    async deletePost(id: number) {
        return this.prisma.posts.delete({ where: { post_id: id } });
    }
    private validatePublication(post: { status?: number; title?: string; content?: string; thumbnail?: string | null; content_blocks?: unknown }) {
        if (post.status !== 1) return;
        if (!post.title?.trim()) throw new BadRequestException('Vui lòng nhập tiêu đề trước khi đăng.');
        if (!post.thumbnail || !isArticleUrl(post.thumbnail)) throw new BadRequestException('Vui lòng tải ảnh bìa trước khi đăng.');
        if (post.content_blocks) {
            const document = parseArticleDocument(post.content_blocks);
            if (!hasArticleContent(document)) throw new BadRequestException('Vui lòng thêm nội dung thực tế trước khi đăng.');
            for (const block of document.blocks) {
                if (block.type === 'image' && block.url && !block.alt.trim()) throw new BadRequestException('Vui lòng nhập mô tả cho ảnh trong bài.');
                if (block.type === 'cta' && block.url && !block.label.trim()) throw new BadRequestException('Vui lòng nhập chữ trên nút hành động.');
                if (block.type === 'experiences' && block.items.some(item => (item.title.trim() || item.description.trim()) && (!item.title.trim() || !item.description.trim()))) throw new BadRequestException('Mỗi trải nghiệm cần có tên và mô tả.');
            }
        } else if (!post.content?.trim()) throw new BadRequestException('Vui lòng nhập nội dung.');
    }
    private async resolveTourLinks(document: ReturnType<typeof parseArticleDocument> | undefined) {
        if (!document) return;
        for (const block of document.blocks) {
            if (block.type !== 'cta' || !block.tour_id) continue;
            const tour = await this.prisma.tours.findUnique({ where: { tour_id: block.tour_id }, select: { tour_id: true, status: true } });
            if (!tour || tour.status !== 1) throw new BadRequestException('Tour đã chọn không còn công khai. Vui lòng chọn tour khác.');
            block.url = `/tours/${tour.tour_id}`;
        }
    }
}
