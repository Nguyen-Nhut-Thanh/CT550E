import type { ArticleDocument, CoverPosition } from '../../blog/blocks';
export type PostEditorForm = {
    content_blocks: ArticleDocument;
    author_display_name: string;
    tags: string[];
    cover_position: CoverPosition;
    title: string;
    slug?: string;
    summary: string;
    content: string;
    thumbnail: string;
    category_id: string;
    status: number;
};
export type PostCategoryDraft = {
    name: string;
    description: string;
};
