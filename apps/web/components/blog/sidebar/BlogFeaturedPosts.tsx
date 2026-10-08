import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type FeaturedPost = {
  id: number;
  title: string;
  date: string;
  image: string;
  slug: string;
};

const FEATURED_POSTS: FeaturedPost[] = [
  {
    id: 1,
    title: "Đà Nẵng – Thành phố đáng sống nhất Việt Nam",
    date: "05/04/2025",
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=300",
    slug: "da-nang-thanh-pho-dang-song",
  },
  {
    id: 2,
    title: "Sapa – Mùa săn mây trên đỉnh Fansipan",
    date: "28/03/2025",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=300",
    slug: "sapa-mua-san-may-fansipan",
  },
  {
    id: 3,
    title: "Phú Quốc – Thiên đường biển đảo nhiệt đới",
    date: "20/03/2025",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=300",
    slug: "phu-quoc-thien-duong-bien-dao",
  },
  {
    id: 4,
    title: "Hội An – Nét đẹp cổ kính bên dòng sông Hoài",
    date: "15/03/2025",
    image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=300",
    slug: "hoi-an-net-dep-co-kinh",
  },
];

export function BlogFeaturedPosts() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900">Bài viết nổi bật</h3>

      <div className="space-y-3.5">
        {FEATURED_POSTS.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex items-center gap-3.5 transition hover:opacity-90"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition duration-300 group-hover:scale-105"
                sizes="60px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="line-clamp-2 text-xs font-bold leading-snug text-slate-900 group-hover:text-sky-600 transition">
                {post.title}
              </h4>
              <p className="mt-1 text-[11px] font-medium text-slate-400">
                {post.date}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-0.5 transition" />
          </Link>
        ))}
      </div>
    </div>
  );
}
