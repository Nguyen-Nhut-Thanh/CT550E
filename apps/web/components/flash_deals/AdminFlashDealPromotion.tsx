import { AlarmClock, Plane, Send, Zap } from "lucide-react";
import Image from "next/image";

export function FlashDealPromotion() {
  return (
    <aside
      aria-hidden="true"
      className="ui-flash-deal-modal-promotion [&_h2]:text-[42px] relative hidden min-h-full overflow-hidden bg-[#c8edff] lg:block"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_22%,#effaff_0%,transparent_55%),linear-gradient(145deg,#80ccfa_0%,#d7f3ff_55%,#8ed7f5_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[56%]">
        <Image
          src="/images/about/travel-dreams-banner.png"
          alt=""
          fill
          sizes="500px"
          className="object-cover object-[48%_center] brightness-125 saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#d7f3ff] via-[#c5ecff]/10 to-transparent" />
      </div>
      <div className="absolute -right-24 -top-24 h-80 w-72 rounded-full bg-white/15" />
      <Plane
        className="absolute right-8 top-10 h-12 w-12 -rotate-12 text-white drop-shadow-sm xl:top-12"
        strokeWidth={1.1}
      />
      <svg
        viewBox="0 0 150 70"
        className="absolute right-12 top-20 w-32 text-white/90"
        fill="none"
      >
        <path
          d="M2 55C40 64 69 45 51 31S32 67 78 41L145 4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeDasharray="7 6"
          strokeLinecap="round"
        />
      </svg>
      <div className="ui-flash-deal-modal-promotionCopy p-[32px_26px_0] [&>p]:text-[14px] relative">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#2c94ff] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-400/15">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
            <Zap size={15} className="fill-[#2c94ff] text-[#2c94ff]" />
          </span>
          FLASH DEAL
        </div>
        <h2 className="mt-7 text-[clamp(2.6rem,4vw,4rem)] font-extrabold leading-[1.13] tracking-[-0.045em] text-[#0c2249]">
          Thiết lập
          <br />
          <span className="text-[#0960ff]">Flash Deal</span>
        </h2>
        <p className="mt-5 max-w-[320px] text-base font-medium leading-relaxed text-[#577cc1] xl:text-lg">
          Tạo ưu đãi giới hạn thời gian để thu hút khách hàng và tăng lượt đặt
          tour.
        </p>
      </div>
      <Send
        className="absolute right-6 top-[43%] h-12 w-12 rotate-12 text-white/90"
        strokeWidth={1}
      />
      <div className="absolute bottom-[17%] left-[16%] z-10 h-[24%] w-[43%] -rotate-[16deg] rounded-xl border-[9px] border-white bg-white shadow-[0_18px_35px_rgba(14,95,145,0.24)]">
        <Image
          src="/images/about/travel-dreams-banner.png"
          alt=""
          fill
          sizes="220px"
          className="rounded-sm object-cover object-[30%_center] brightness-125 saturate-125"
        />
      </div>
      <div className="absolute bottom-[20%] left-[53%] h-[17%] w-[23%] rotate-[15deg] rounded-lg border-[7px] border-white bg-white shadow-xl shadow-sky-900/15">
        <Image
          src="/images/about/hero-travel.png"
          alt=""
          fill
          sizes="140px"
          className="rounded-sm object-cover object-left"
        />
      </div>
      <div
        className="ui-flash-deal-modal-promotionBadge left-[20%] [&>span]:w-[64px] [&>span]:h-[64px] [&_svg]:w-[44px] [&_svg]:h-[44px] [&_p]:text-[12px] absolute bottom-[35%] z-20 flex -rotate-[9deg] items-center gap-3 rounded-2xl bg-white/85 py-3 pl-2 pr-5 shadow-[0_14px_30px_rgba(34,139,217,0.12)] backdrop-blur-sm"
      >
        <span className="-my-4 -ml-5 flex h-20 w-20 shrink-0 rotate-6 items-center justify-center rounded-full bg-gradient-to-br from-white to-sky-100 text-[#227aff] shadow-lg shadow-sky-400/10">
          <AlarmClock size={56} strokeWidth={2} />
        </span>
        <p className="whitespace-nowrap text-sm leading-relaxed text-[#0960ff]">
          <strong>Ưu đãi giới hạn</strong>
          <br />
          Thời gian có hạn!
        </p>
      </div>
    </aside>
  );
}
