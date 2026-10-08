import { Facebook, Instagram, Youtube } from "lucide-react";

export function BlogSocialLinks() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <h3 className="text-base font-bold text-slate-900">Theo dõi chúng tôi</h3>

      <div className="flex items-center gap-3">
        {/* Facebook */}
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-sky-600 hover:text-white"
          aria-label="Facebook"
        >
          <Facebook className="h-4 w-4" />
        </a>

        {/* YouTube */}
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-rose-600 hover:text-white"
          aria-label="YouTube"
        >
          <Youtube className="h-4 w-4" />
        </a>

        {/* Instagram */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-pink-600 hover:text-white"
          aria-label="Instagram"
        >
          <Instagram className="h-4 w-4" />
        </a>

        {/* TikTok SVG */}
        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-900 hover:text-white"
          aria-label="TikTok"
        >
          <svg
            className="h-4 w-4 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.891 2.891 2.896 2.896 0 0 1-2.892-2.891 2.896 2.896 0 0 1 2.892-2.892c.32 0 .63.053.922.148V9.43a6.34 6.34 0 0 0-.922-.068 6.337 6.337 0 0 0-6.332 6.337 6.337 6.337 0 0 0 6.332 6.337 6.337 6.337 0 0 0 6.332-6.337V9.014a8.212 8.212 0 0 0 4.774 1.516v-3.844a4.797 4.797 0 0 1-1.002-.001z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
