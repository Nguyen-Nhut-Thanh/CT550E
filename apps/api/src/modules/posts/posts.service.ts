import { Injectable } from '@nestjs/common';
import type { PostAdminQuery, PostCategoryPayload, PostPayload } from 'shared';
import { slugify } from "shared";
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) { }
    private normalizePostPayload(data: PostPayload) {
        return {
            ...data,
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
        return this.prisma.post_categories.create({
            data: { ...data, slug: slugify(data.name) },
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
            orderBy: { created_at: 'desc' },
        });
    }
    async createPost(authorId: number, data: PostPayload) {
        const payload = this.normalizePostPayload(data);
        return this.prisma.posts.create({
            data: {
                title: payload.title ?? '',
                slug: payload.slug!,
                summary: payload.summary,
                content: payload.content ?? '',
                thumbnail: payload.thumbnail,
                author_id: authorId,
                category_id: payload.category_id!,
                status: payload.status ?? 1,
            },
        });
    }
    async updatePost(id: number, data: PostPayload) {
        return this.prisma.posts.update({
            where: { post_id: id },
            data: this.normalizePostPayload(data),
        });
    }
    async deletePost(id: number) {
        return this.prisma.posts.delete({ where: { post_id: id } });
    }
}
