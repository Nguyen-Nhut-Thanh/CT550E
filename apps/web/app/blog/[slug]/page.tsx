"use client";

import { use } from "react";
import {
  BlogArticleContent,
  BlogFeaturedPosts,
  BlogHero,
  BlogNewsletter,
  BlogPromoBanner,
  BlogRelatedPosts,
  BlogSocialLinks,
} from "@/components/blog";

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  return (
    <main className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Top Full-Width Hero Section */}
      <BlogHero
        category="Việt Nam"
        title="Vịnh Hạ Long – Kỳ quan thiên nhiên giữa lòng Quảng Ninh"
        summary="Khám phá vẻ đẹp hùng vĩ của vịnh Hạ Long – điểm đến không thể bỏ lỡ trong hành trình du lịch Việt Nam."
        date="12/04/2025"
        author="Nguyễn Minh Anh"
        readTime="5 phút đọc"
        heroImage="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1600"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] items-start">
          {/* Left Column: Article Content */}
          <div className="min-w-0">
            <BlogArticleContent />
          </div>

          {/* Right Column: Sticky Sidebar Widgets */}
          <aside className="sticky top-24 space-y-6">
            <BlogFeaturedPosts />
            <BlogPromoBanner />
            <BlogNewsletter />
            <BlogSocialLinks />
          </aside>
        </div>

        {/* Bottom Section: Có thể bạn sẽ thích */}
        <div className="pt-4 border-t border-slate-200">
          <BlogRelatedPosts />
        </div>
      </div>
    </main>
  );
}
