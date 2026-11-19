import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa6";

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: FaFacebookF, color: "bg-[#1877f2]" },
  { label: "YouTube", href: "https://youtube.com", icon: FaYoutube, color: "bg-[#ff0000]" },
  { label: "Instagram", href: "https://instagram.com", icon: FaInstagram, color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" },
  { label: "TikTok", href: "https://tiktok.com", icon: FaTiktok, color: "bg-black" },
];

export function BlogSocialLinks() {
  return (
    <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <h3 className="text-xs font-bold text-slate-900">Theo dõi chúng tôi</h3>

      <div className="flex items-center justify-center gap-2">
        {socialLinks.map(({ label, href, icon: Icon, color }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex h-7 w-7 items-center justify-center rounded-full text-white shadow-sm transition hover:-translate-y-0.5 ${color}`}
            aria-label={label}
          >
            <Icon className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </section>
  );
}
