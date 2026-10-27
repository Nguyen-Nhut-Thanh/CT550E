import type { PostCategoryDraft, PostEditorForm, PostItem } from 'shared';
import { createDestinationTemplate } from 'shared';
export function createDefaultPostEditorForm(): PostEditorForm {
  return {
    title: "",
    summary: "",
    content: "",
    thumbnail: "",
    category_id: "",
    status: 1,
    content_blocks: createDestinationTemplate(), author_display_name: '', tags: [], cover_position: 'center',
  };
}

export function buildPostEditorForm(post: PostItem): PostEditorForm {
  return {
    title: post.title,
    slug: post.slug,
    summary: post.summary || "",
    content: post.content,
    thumbnail: post.thumbnail || "",
    category_id: String(post.category_id),
    status: post.status,
    content_blocks: post.content_blocks || { version: 1, blocks: post.content ? [{ id: 'legacy-content', type: 'paragraph', text: post.content }] : [] },
    author_display_name: post.author_display_name || '', tags: post.tags || [], cover_position: post.cover_position || 'center',
  };
}

export function matchesPostSearch(post: PostItem, search: string) {
  return post.title.toLowerCase().includes(search.trim().toLowerCase());
}

export function createDefaultPostCategoryDraft(): PostCategoryDraft {
  return {
    name: "",
    description: "",
  };
}
