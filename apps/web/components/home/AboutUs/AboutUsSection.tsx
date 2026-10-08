import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Compass,
  MapPinned,
  Plane,
  ShieldCheck,
  Star,
} from "lucide-react";

const benefits = [
  {
    title: "Tour được chọn lọc",
    description: "Lịch trình rõ ràng, minh bạch và phù hợp nhiều nhu cầu.",
    icon: MapPinned,
    iconWrap: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    title: "Tư vấn thông minh",
    description: "Gợi ý hành trình theo ngân sách và sở thích cá nhân.",
    icon: ShieldCheck,
    iconWrap: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    title: "Hỗ trợ tận tâm",
    description: "Đồng hành cùng bạn trong suốt hành trình.",
    icon: BadgeCheck,
    iconWrap: "bg-emerald-100",
    iconColor: "text-emerald-500",
  },
  {
    title: "Trải nghiệm đa dạng",
    description: "Từ nghỉ dưỡng đến khám phá văn hóa bản địa.",
    icon: Star,
    iconWrap: "bg-amber-100",
    iconColor: "text-amber-500",
  },
];

const primaryImage =
  "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1400&q=90";

const secondaryImage =
  "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=900&q=90";

export default function AboutUsSection() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#fafdff_0%,#ffffff_52%,#f6fbff_100%)]">
      {/* Background soft glow */}
      <div className="pointer-events-none absolute -left-24 top-10 h-[300px] w-[300px] rounded-full bg-blue-100/50 blur-3xl" />

      <div className="pointer-events-none absolute right-[-100px] top-0 h-[320px] w-[320px] rounded-full bg-sky-100/60 blur-3xl" />

      {/* Clouds top right */}
      <div className="pointer-events-none absolute right-[4%] top-6 hidden opacity-70 xl:block">
        <div className="relative h-20 w-52">
          <div className="absolute bottom-0 left-5 h-9 w-24 rounded-full bg-blue-50" />
          <div className="absolute bottom-1 left-20 h-11 w-24 rounded-full bg-blue-50" />
          <div className="absolute left-20 top-0 h-12 w-12 rounded-full bg-blue-50" />
          <div className="absolute left-32 top-3 h-10 w-10 rounded-full bg-blue-50" />
        </div>
      </div>

      {/* Main container */}
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8 xl:px-0">
        {/* LEFT */}
        <div className="relative z-20 max-w-[590px]">
          {/* Label */}
          <div className="mb-5 inline-flex items-center gap-2.5 rounded-full bg-blue-100/80 px-3.5 py-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-200">
              <Compass className="h-3.5 w-3.5" />
            </span>

            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-700">
              Về chúng tôi
            </span>
          </div>

          {/* Heading */}
          <h2 className="max-w-[590px] text-[32px] font-black leading-[1.08] tracking-[-0.03em] text-[#123d78] sm:text-[38px] lg:text-[42px]">
            Kiến tạo những hành trình
            <br />

            <span className="relative mr-2.5 inline-block font-serif text-[1.08em] font-black italic text-blue-600">
              diệu kỳ

              <span className="absolute -bottom-1 left-1 h-[3px] w-[92%] rotate-[-3deg] rounded-full bg-amber-400" />

              <span className="absolute -left-8 top-1 hidden text-amber-400 md:block">
                <svg
                  width="22"
                  height="42"
                  viewBox="0 0 28 54"
                  fill="none"
                >
                  <path
                    d="M19 3L12 15M5 20L18 23M3 34L15 31"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </span>

            cho riêng bạn
          </h2>

          <p className="mt-5 max-w-[590px] text-[15px] font-medium leading-7 text-slate-500">
            Chúng tôi không chỉ bán tour mà còn tạo ra những trải nghiệm đáng
            nhớ. Với hệ thống đặt tour thông minh và đội ngũ hỗ trợ tận tâm,
            JourniTrip đồng hành cùng bạn trong mọi chuyến đi.
          </p>

          {/* Benefits */}
          <div className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="group flex items-start gap-3.5"
                >
                  <div
                    className={`flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-full ${benefit.iconWrap} transition duration-300 group-hover:-translate-y-1 group-hover:scale-105`}
                  >
                    <Icon
                      className={`h-5 w-5 ${benefit.iconColor}`}
                      strokeWidth={2.3}
                    />
                  </div>

                  <div className="pt-0.5">
                    <h3 className="text-[15px] font-extrabold text-[#123d78]">
                      {benefit.title}
                    </h3>

                    <p className="mt-1 max-w-[220px] text-[12px] font-medium leading-5 text-slate-500">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <Link
            href="/about"
            className="group mt-8 inline-flex min-w-[300px] items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#1592ff] to-[#0768f2] px-7 py-3.5 text-[14px] font-extrabold text-white shadow-[0_12px_25px_rgba(24,118,255,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(24,118,255,0.32)] active:translate-y-0"
          >
            <Plane className="h-4 w-4 -rotate-12" />

            <span>Khám phá thêm về JourniTrip</span>

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
          </Link>
        </div>

        {/* RIGHT IMAGE COMPOSITION */}
        <div className="relative mx-auto min-h-[470px] w-full max-w-[600px] lg:min-h-[500px]">
          {/* Plane doodle */}
          <div className="pointer-events-none absolute right-[-2%] top-[11%] z-30 hidden xl:block">
            <Plane className="h-8 w-8 -rotate-[18deg] text-blue-400" />

            <svg
              className="absolute -left-20 top-7"
              width="90"
              height="55"
              viewBox="0 0 130 78"
              fill="none"
            >
              <path
                d="M1 40C28 14 42 66 65 39C80 22 74 4 94 8C110 11 104 34 128 29"
                stroke="#79B8FF"
                strokeWidth="2.4"
                strokeDasharray="7 7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Pin doodle */}
          <div className="pointer-events-none absolute right-[-1%] top-[42%] z-30 hidden xl:block">
            <MapPinned className="h-8 w-8 text-blue-400" />

            <svg
              className="absolute -left-16 top-4"
              width="75"
              height="55"
              viewBox="0 0 110 80"
              fill="none"
            >
              <path
                d="M2 43C22 12 41 75 60 41C77 10 85 47 108 24"
                stroke="#7BB9FF"
                strokeWidth="2.4"
                strokeDasharray="7 7"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Main image */}
          <div className="absolute left-[2%] top-[5%] z-10 w-[68%] rotate-[-2.5deg] overflow-hidden rounded-[32px] border-[7px] border-white bg-white shadow-[0_20px_45px_rgba(36,88,160,0.2)]">
            <div className="relative aspect-[4/4.2]">
              <Image
                src={primaryImage}
                alt="Khám phá Hạ Long cùng JourniTrip"
                fill
                className="object-cover transition duration-700 hover:scale-105"
                sizes="(max-width: 1024px) 70vw, 440px"
              />
            </div>
          </div>

          {/* Secondary image */}
          <div className="absolute right-[3%] top-[12%] z-20 w-[36%] rotate-[5deg] overflow-hidden rounded-[26px] border-[6px] border-white bg-white shadow-[0_16px_36px_rgba(36,88,160,0.18)]">
            <div className="relative aspect-[4/3.7]">
              <Image
                src={secondaryImage}
                alt="Điểm đến nổi bật"
                fill
                className="object-cover transition duration-700 hover:scale-105"
                sizes="220px"
              />
            </div>
          </div>

          {/* Verified card */}
          <div className="absolute right-[20%] top-[43%] z-40 rounded-[19px] bg-white/95 px-4 py-3 shadow-[0_14px_36px_rgba(19,75,145,0.16)] backdrop-blur-md">
            <div className="flex min-w-[205px] items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-100">
                <BadgeCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-[13px] font-extrabold text-[#123d78]">
                  Đã kiểm chứng
                </p>

                <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                  100% tour chất lượng cao
                </p>
              </div>
            </div>
          </div>

          {/* Trust card */}
          <div className="absolute bottom-[12%] right-[3%] z-30 w-[31%] rounded-[22px] bg-gradient-to-br from-[#138cff] to-[#005cef] px-5 py-4 text-white shadow-[0_16px_34px_rgba(0,99,236,0.28)]">
            <div className="mb-1.5 flex gap-0.5 text-amber-300">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="h-[13px] w-[13px] fill-current"
                />
              ))}
            </div>

            <p className="text-[26px] font-black leading-none">10k+</p>

            <p className="mt-1.5 text-[10px] font-bold uppercase leading-4 tracking-[0.08em]">
              Khách hàng tin
              <br />
              tưởng
            </p>
          </div>

          {/* Yellow doodle */}
          <div className="pointer-events-none absolute bottom-[18%] right-[-1%] hidden text-amber-400 xl:block">
            <svg
              width="24"
              height="52"
              viewBox="0 0 34 72"
              fill="none"
            >
              <path
                d="M7 5L14 18M27 19L18 27M30 44L17 41"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Go Further */}
          <div className="pointer-events-none absolute bottom-[2%] right-[0%] hidden rotate-[-7deg] text-right font-serif text-[20px] font-bold italic leading-[0.9] text-blue-400 xl:block">
            Go
            <br />
            Further
            <span className="ml-1">↗</span>
          </div>
        </div>
      </div>

      {/* Bottom landscape */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
        <svg
          viewBox="0 0 1600 150"
          preserveAspectRatio="none"
          className="absolute bottom-0 h-full w-full"
        >
          <path
            d="M0 96C53 30 88 108 147 101C217 92 223 56 290 70C369 88 396 70 461 72C529 73 566 92 645 88C733 83 770 91 859 98C955 107 1039 117 1123 112C1214 107 1250 52 1325 65C1390 77 1431 90 1504 56C1548 35 1582 33 1600 35V150H0V96Z"
            fill="#D7EDFF"
          />

          <path
            d="M0 111C85 103 132 123 215 121C303 118 367 103 456 111C558 120 639 124 730 122C841 119 917 137 1014 132C1099 128 1162 103 1259 112C1374 123 1457 90 1600 88V150H0V111Z"
            fill="#C3E4FF"
          />
        </svg>

        {/* Palm silhouettes */}
        <div className="absolute bottom-[-4px] right-[8%] hidden text-blue-300/60 lg:block">
          <svg
            width="125"
            height="75"
            viewBox="0 0 170 100"
            fill="none"
          >
            <path
              d="M86 97C87 75 90 50 99 28"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
            />

            <path
              d="M98 28C77 14 63 18 54 30M99 28C83 4 71 5 62 12M100 28C115 5 130 8 139 20M100 28C126 18 143 24 153 38"
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
            />

            <path
              d="M42 98C43 83 45 68 51 55"
              stroke="currentColor"
              strokeWidth="3.5"
            />

            <path
              d="M51 55C38 46 30 50 25 57M51 55C44 40 37 41 31 46M51 55C61 43 70 45 76 52"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}