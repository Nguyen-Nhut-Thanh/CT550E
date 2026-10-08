import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SeasonalShowcase as SeasonalShowcaseData } from "shared";

type SeasonalShowcaseProps = {
  showcase: SeasonalShowcaseData;
};

const cardLabels = [
  "Hồ Kanas",
  "Trượt tuyết Altay",
  "Thiên Sơn",
  "Ngựa tuyết",
  "Rừng tuyết",
  "Làng Kazakh",
  "Lễ hội băng tuyết",
  "Hồ Kanas",
  "Altay mùa đông",
  "Rừng tuyết",
  "Ngựa tuyết",
];

const particles = Array.from({ length: 30 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  size: `${2 + (index % 4)}px`,
  delay: `${(index * 0.47) % 14}s`,
  duration: `${9 + (index % 6)}s`,
}));

const rowClasses = [
  "ml-[170px] animate-tk-row-reveal [animation-delay:50ms] max-[1200px]:ml-[110px] max-[900px]:ml-20 max-[600px]:ml-[50px]",
  "ml-[70px] animate-tk-row-reveal [animation-delay:180ms] max-[1200px]:ml-[55px] max-[900px]:ml-10 max-[600px]:ml-[25px]",
  "ml-0 animate-tk-row-reveal [animation-delay:320ms]",
];

const cardSizes =
  "h-40 w-[240px] max-[1200px]:h-[134px] max-[1200px]:w-[200px] max-[900px]:h-[114px] max-[900px]:w-[170px] max-[600px]:h-[84px] max-[600px]:w-[125px]";

export default function SeasonalShowcase({
  showcase,
}: SeasonalShowcaseProps) {
  const images = showcase.image_urls.filter(Boolean).slice(0, 11);
  const rows = [images.slice(0, 2), images.slice(2, 6), images.slice(6, 11)];
  const [titleLead = showcase.title, ...titleRest] =
    showcase.eyebrow.split(" · ");
  let imageIndex = 0;

  return (
    <section className="relative min-h-[680px] w-full overflow-hidden bg-[linear-gradient(155deg,#c8e4f4_0%,#daeef8_18%,#eaf4fb_38%,#f3f8fd_55%,#daedf7_75%,#c4dff0_100%)] text-[#1a2a3a]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_80%_at_20%_45%,rgba(160,210,240,.38)_0%,transparent_65%),radial-gradient(ellipse_50%_60%_at_80%_80%,rgba(220,240,252,.55)_0%,transparent_55%)]"
        aria-hidden="true"
      />

      <div
        className="absolute left-0 top-1/2 z-[1] flex -translate-y-[44%] scale-[.9] flex-col gap-3 origin-left rotate-[-15deg] pl-[18px] max-[900px]:relative max-[900px]:left-auto max-[900px]:top-auto max-[900px]:mt-10 max-[900px]:translate-y-0 max-[900px]:rotate-[-12deg] max-[900px]:scale-100"
        aria-label="Thư viện ảnh Tân Cương"
      >
        {images.length > 0 ? (
          rows.map((row, rowIndex) => (
            <div
              className={`flex items-center gap-[11px] ${rowClasses[rowIndex]}`}
              key={rowIndex}
            >
              {row.map((imageUrl: string) => {
                const currentIndex = imageIndex;
                imageIndex += 1;

                return (
                  <div
                    className={`group relative flex-shrink-0 overflow-hidden rounded-[10px] shadow-[0_6px_20px_rgba(13,43,69,.22),0_2px_6px_rgba(13,43,69,.12)] [will-change:transform,box-shadow] transition-[transform,box-shadow] duration-[300ms] ease-[cubic-bezier(.25,.46,.45,.94)] hover:z-20 hover:-translate-y-[13px] hover:scale-[1.04] hover:shadow-[0_24px_50px_rgba(13,43,69,.3),0_6px_18px_rgba(13,43,69,.18)] ${cardSizes}`}
                    key={`${imageUrl}-${currentIndex}`}
                  >
                    <img
                      src={imageUrl}
                      alt={cardLabels[currentIndex] ?? showcase.title}
                      className="block h-full w-full object-cover [will-change:transform] transition-transform duration-[550ms] ease-[cubic-bezier(.25,.46,.45,.94)] group-hover:scale-[1.06]"
                      loading={currentIndex < 2 ? "eager" : "lazy"}
                    />
                    <span
                      className="pointer-events-none absolute inset-0 opacity-0 bg-[linear-gradient(135deg,rgba(255,255,255,.2),transparent_55%)] transition-opacity duration-300 group-hover:opacity-100"
                      aria-hidden="true"
                    />
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="flex h-64 w-[min(520px,48vw)] items-center justify-center rounded-2xl border border-white/60 bg-white/30 px-8 text-center text-sm text-[#3a5068]">
            Hình ảnh điểm đến đang được cập nhật.
          </div>
        )}
      </div>

      <div className="absolute bottom-[7%] right-[3%] z-10 w-[min(520px,48%)] max-w-[520px] animate-tk-fade-up rounded-[18px] bg-[rgba(243,248,253,.5)] px-[22px] py-[18px] backdrop-blur-[3px] [animation-delay:400ms] max-[900px]:relative max-[900px]:right-auto max-[900px]:bottom-auto max-[900px]:w-full max-[900px]:max-w-full max-[900px]:bg-transparent max-[900px]:px-[30px] max-[900px]:pb-[10px] max-[900px]:pt-10 max-[900px]:backdrop-blur-none max-[600px]:px-5">
        <span
          className="mb-5 block h-0.5 w-[38px] bg-[linear-gradient(90deg,#1b5e8a,transparent)]"
          aria-hidden="true"
        />

        <div>
          <h2 className="m-0 flex flex-wrap items-center gap-2 font-serif text-[clamp(1.4rem,2.2vw,1.9rem)] font-bold leading-[1.25] tracking-[.06em] text-[#0d2b45]">
            <span className="text-[#1b5e8a]">{titleLead}</span>
            <b className="text-[#c9a96e]"> · </b>
            <strong className="font-bold text-[#0d2b45]">
              {titleRest.join(" · ") || showcase.title}
            </strong>
          </h2>
          <p className="mt-[7px] text-[.68rem] font-light uppercase tracking-[.26em] text-[#6a8aa8]">
            {showcase.subtitle}
          </p>
        </div>

        <div className="my-4 flex items-center gap-2.5" aria-hidden="true">
          <i className="h-px w-[46px] bg-[linear-gradient(90deg,transparent,#4a90b8)]" />
          <span className="text-xs text-[#4a90b8] opacity-60">❄</span>
          <i className="h-px w-[46px] bg-[linear-gradient(90deg,#4a90b8,transparent)]" />
        </div>

        <p className="mb-[26px] text-[.855rem] font-light leading-[1.95] text-[#3a5068]">
          {showcase.description}
        </p>

        <div className="mb-7 flex flex-wrap gap-[11px]">
          {showcase.link_to ? (
            <Link
              href={showcase.link_to}
              className="group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#1b5e8a,#4a90b8)] px-[22px] py-2.5 text-[.82rem] font-medium tracking-[.04em] text-white no-underline shadow-[0_4px_16px_rgba(27,94,138,.35)] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[0_10px_28px_rgba(27,94,138,.48)]"
            >
              <span>Khám Phá Ngay</span>
              <ArrowRight className="h-[13px] w-[13px] transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          ) : null}
          <a
            href="#flash-deals"
            className="inline-flex items-center rounded-full border-[1.5px] border-[rgba(74,144,184,.55)] bg-[rgba(255,255,255,.42)] px-[22px] py-2.5 text-[.82rem] font-medium tracking-[.04em] text-[#1b5e8a] no-underline backdrop-blur-md transition-all duration-300 hover:-translate-y-[3px] hover:border-[#1b5e8a] hover:bg-[#1b5e8a] hover:text-white"
          >
            Xem Thư Viện
          </a>
        </div>

        <div className="flex items-center max-[600px]:flex-wrap max-[600px]:gap-3.5">
          {[
            [String(images.length), "Hình ảnh"],
            ["12", "Điểm tham quan"],
            ["4.9★", "Đánh giá du khách"],
          ].map(([value, label], index) => (
            <div
              className={`flex flex-col gap-[3px] px-4 ${index === 0 ? "pl-0" : ""}`}
              key={label}
            >
              <b className="font-serif text-[1.3rem] font-semibold leading-none text-[#1b5e8a]">
                {value}
              </b>
              <span className="whitespace-nowrap text-[.66rem] uppercase tracking-[.08em] text-[#6a8aa8]">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
        {particles.map((particle, index) => (
          <span
            key={index}
            className="absolute top-[-8px] animate-tk-snowfall rounded-full bg-white/80"
            style={{
              left: particle.left,
              width: particle.size,
              height: particle.size,
              animationDelay: particle.delay,
              animationDuration: particle.duration,
            }}
          />
        ))}
      </div>
    </section>
  );
}

