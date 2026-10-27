import type { PostItem } from 'shared';
export type BlogPost = PostItem & { author?: { users?: { full_name?: string | null } | null } | null };
export type BlogDetail = { post: BlogPost; featured: BlogPost[]; related: BlogPost[] };
export function postDate(post: BlogPost) { const date = post.published_at || post.created_at; return date ? new Date(date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Bangkok' }) : ''; }
