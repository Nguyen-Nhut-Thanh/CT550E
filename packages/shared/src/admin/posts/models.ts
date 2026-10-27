import type { ArticleDocument, CoverPosition } from '../../blog/blocks';
export type PostCategory = {
    category_id: number;
    name: string;
    description?: string | null;
    _count?: {
        posts?: number;
    };
};
export type PostItem = {
    content_blocks?: ArticleDocument | null;
    author_display_name?: string | null;
    published_at?: string | null;
    tags?: string[];
    cover_position?: CoverPosition;
    post_id: number;
    title: string;
    summary: string | null;
    content: string;
    thumbnail: string | null;
    category_id: number;
    status: number;
    created_at?: string;
    slug?: string;
    category?: {
        name?: string | null;
    } | null;
};
