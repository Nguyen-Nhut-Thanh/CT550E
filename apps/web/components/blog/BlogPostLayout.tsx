import Link from "next/link";
import { Calendar, Clock, User } from "lucide-react";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { BlogBody } from "./BlogBody";
import { ArticleBlocks } from "./ArticleBlocks";
import { articleText } from "shared";
import { BlogPromoBanner } from "./BlogPromoBanner";
import { postDate, type BlogPost } from "@/lib/blog/types";

export function BlogPostLayout({
  post,
  featured,
  related,
}: {
  post: BlogPost;
  featured: BlogPost[];
  related: BlogPost[];
}) {
  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20">
      <header className="relative flex min-h-[420px] items-end overflow-hidden bg-slate-900 py-16 text-white lg:min-h-[520px]">
        <ImageWithFallback
          src={post.thumbnail || undefined}
          alt={post.title}
          style={{ objectPosition: post.cover_position || "center" }}
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/20" />
        <div className="relative mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="text-sm text-white/80 hover:text-white">
            Cẩm nang du lịch
          </Link>
          <div>
            <span className="rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold uppercase">
              {post.category?.name || "Du lịch"}
            </span>
          </div>
          <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            {post.title}
          </h1>
          {post.summary && (
            <p className="max-w-3xl text-lg text-white/90">{post.summary}</p>
          )}
          <div className="flex flex-wrap gap-5 text-sm text-white/80">
            <span className="flex items-center gap-2">
              <Calendar size={16} />
              {postDate(post)}
            </span>
            <span className="flex items-center gap-2">
              <User size={16} />
              {post.author_display_name ||
                post.author?.users?.full_name ||
                "Ban biên tập JourniTrip"}
            </span>
            <span className="flex items-center gap-2">
              <Clock size={16} />
              {Math.max(
                1,
                Math.ceil(
                  (post.content_blocks
                    ? articleText(post.content_blocks)
                    : post.content
                  )
                    .trim()
                    .split(/\s+/).length / 220,
                ),
              )}{" "}
              phút đọc
            </span>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-9">
            {post.content_blocks?.version === 1 ? (
              <ArticleBlocks document={post.content_blocks} />
            ) : (
              <BlogBody content={post.content} />
            )}
            {!!post.tags?.length && (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>
          <aside className="space-y-6 lg:sticky lg:top-24">
            {!!featured.length && (
              <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="font-bold text-slate-900">Bài viết nổi bật</h2>
                {featured.map((item) => (
                  <Link
                    key={item.post_id}
                    href={`/blog/${item.slug}`}
                    className="group flex items-center gap-3.5"
                  >
                    <ImageWithFallback
                      src={item.thumbnail || undefined}
                      alt={item.title}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                    <div>
                      <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-sky-600">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-400">
                        {postDate(item)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <BlogPromoBanner />
          </aside>
        </div>
        {!!related.length && (
          <section className="space-y-5 border-t border-slate-200 pt-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Có thể bạn sẽ thích
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
              {related.map((item) => (
                <Link
                  key={item.post_id}
                  href={`/blog/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
                >
                  <ImageWithFallback
                    src={item.thumbnail || undefined}
                    alt={item.title}
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="space-y-2 p-4">
                    <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-sky-600">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400">{postDate(item)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
