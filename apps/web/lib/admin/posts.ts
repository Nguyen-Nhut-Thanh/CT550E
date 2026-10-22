import type { PostCategoryDraft, PostEditorForm, PostItem } from 'shared';
export function createDefaultPostEditorForm(): PostEditorForm {
  return {
    title: "",
    summary: "",
    content: "",
    thumbnail: "",
    category_id: "",
    status: 1,
  };
}

export function buildPostEditorForm(post: PostItem): PostEditorForm {
  return {
    title: post.title,
    summary: post.summary || "",
    content: post.content,
    thumbnail: post.thumbnail || "",
    category_id: String(post.category_id),
    status: post.status,
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
