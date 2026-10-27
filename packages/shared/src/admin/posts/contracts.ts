import type { ArticleDocument, CoverPosition } from '../../blog/blocks';
export type PostCategoryPayload = {
    name: string;
    description?: string;
};
export type PostAdminQuery = {
    category_id?: number;
    search?: string;
};
export type PostPayload = {
    content_blocks?: ArticleDocument;
    author_display_name?: string;
    tags?: string[];
    cover_position?: CoverPosition;
    title?: string;
    slug?: string;
    summary?: string;
    content?: string;
    thumbnail?: string;
    category_id?: number | string;
    status?: number | string;
};
