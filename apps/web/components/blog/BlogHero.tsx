import Image from "next/image";
import { Calendar, Clock, User } from "lucide-react";

interface BlogHeroProps {
  title: string;
  summary: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  heroImage: string;
}

export function BlogHero({
  title,
  summary,
  category,
  author,
  date,
  readTime,
  heroImage,
}: BlogHeroProps) {
  return (
    <div className="relative min-h-[420px] w-full overflow-hidden bg-slate-900 py-16 text-white md:min-h-[480px] lg:min-h-[520px]">
      <Image
        src={heroImage}
        alt={title}
        fill
        priority
        className="object-cover opacity-80"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-4">
          <span className="inline-block rounded-full bg-sky-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
            {category}
          </span>

          <h1 className="text-3xl font-black leading-snug text-white sm:text-4xl md:text-5xl">
            {title}
          </h1>

          <p className="text-base font-normal text-white/90 sm:text-lg">
            {summary}
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-medium text-white/80 sm:text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-white/70" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-white/70" />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/70" />
              <span>{readTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
