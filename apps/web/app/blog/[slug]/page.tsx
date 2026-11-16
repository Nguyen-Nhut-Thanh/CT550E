import { notFound } from 'next/navigation';
import { BlogPostLayout } from '@/components/posts/blog_detail/UserBlogPostLayout';
import { API_BASE } from '@/lib/http/config';
import type { BlogDetail } from '@/lib/posts/client/types';

export const dynamic = 'force-dynamic';
export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await fetch(`${API_BASE}/posts/${encodeURIComponent(slug)}`, { cache: 'no-store' });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Không thể tải bài viết. Vui lòng thử lại.');
  const detail: BlogDetail = await response.json();
  return <BlogPostLayout {...detail} />;
}
