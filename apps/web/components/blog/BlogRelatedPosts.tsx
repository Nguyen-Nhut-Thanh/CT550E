import Image from "next/image";
import Link from "next/link";

type RelatedPost = {
  id: number;
  title: string;
  date: string;
  image: string;
  slug: string;
};

const RELATED_POSTS: RelatedPost[] = [
  {
    id: 1,
    title: "Đà Lạt – Thành phố ngàn hoa",
    date: "10/03/2025",
    image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=400",
    slug: "da-lat-thanh-pho-ngan-hoa",
  },
  {
    id: 2,
    title: "Ninh Bình – Vẻ đẹp sơn thủy hữu tình",
    date: "05/03/2025",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=400",
    slug: "ninh-binh-ve-dep-son-thuy-huu-tinh",
  },
  {
    id: 3,
    title: "Phú Quốc – Thiên đường nghỉ dưỡng",
    date: "28/02/2025",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=400",
    slug: "phu-quoc-thien-duong-nghi-duong",
  },
  {
    id: 4,
    title: "Huế – Cố đô trầm mặc",
    date: "20/02/2025",
    image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?q=80&w=400",
    slug: "hue-co-do-tram-mac",
  },
];

export function BlogRelatedPosts() {
  return (
    <section className="space-y-5">
      <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
        Có thể bạn sẽ thích
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {RELATED_POSTS.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:border-sky-200 hover:shadow-md"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
            <div className="flex flex-col justify-between p-4 flex-1 space-y-2">
              <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-sky-600 transition">
                {post.title}
              </h3>
              <p className="text-xs font-medium text-slate-400">
                {post.date}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
