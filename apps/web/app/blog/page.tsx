import { BlogPostLayout } from "@/components/blog/BlogPostLayout";
import { publicFetch } from "@/lib/http/publicFetch";
import type { BlogPost } from "@/lib/blog/types";

export const dynamic = "force-dynamic";
export default async function BlogPage() {
  const slots = await publicFetch<(BlogPost | null)[]>("/posts/layout", {
    cache: "no-store",
  });
  const post = slots[0];
  if (!post)
    return (
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-3xl font-bold">Cẩm nang du lịch</h1>
        <p className="mt-4 text-slate-500">
          Các bài viết đang được chuẩn bị. Hẹn gặp bạn sớm!
        </p>
      </main>
    );
  return (
    <BlogPostLayout
      post={post}
      featured={slots.slice(1, 5).filter((item): item is BlogPost => !!item)}
      related={slots.slice(5, 9).filter((item): item is BlogPost => !!item)}
    />
  );
}
