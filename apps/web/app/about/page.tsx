import {
  ArrowRight,
  BriefcaseBusiness,
  Compass,
  Globe2,
  Heart,
  Leaf,
  MapPin,
  Plane,
  Quote,
  Send,
  ShieldCheck,
  Star,
  Sun,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Về chúng tôi - JourniTrip",
  description:
    "Từ đam mê du lịch đến sứ mệnh kết nối thế giới. Khám phá câu chuyện, con người và những giá trị của JourniTrip.",
};
const values = [
  {
    icon: ShieldCheck,
    title: "An toàn là ưu tiên",
    desc: "Luôn đặt sự an toàn của khách hàng lên hàng đầu trong mọi hành trình.",
  },
  {
    icon: Users,
    title: "Đội ngũ chuyên nghiệp",
    desc: "Hướng dẫn viên giàu kinh nghiệm, nhiệt tình, am hiểu văn hóa địa phương.",
  },
  {
    icon: Leaf,
    title: "Trải nghiệm độc đáo",
    desc: "Thiết kế tour riêng biệt, khám phá những điểm đến ít người biết đến.",
  },
  {
    icon: Heart,
    title: "Dịch vụ tận tâm",
    desc: "Hỗ trợ 24/7, đồng hành cùng bạn từ lúc đặt tour đến khi trở về.",
  },
  {
    icon: Globe2,
    title: "Kết nối bền vững",
    desc: "Góp phần phát triển du lịch có trách nhiệm với cộng đồng và môi trường.",
  },
];
const stats = [
  {
    icon: BriefcaseBusiness,
    value: "10+",
    label: "Năm kinh nghiệm\ntrong ngành du lịch",
  },
  { icon: Users, value: "50.000+", label: "Khách hàng\nđã đồng hành" },
  { icon: MapPin, value: "1.000+", label: "Tour trong nước\nvà quốc tế" },
  { icon: Star, value: "100%", label: "Khách hàng hài lòng\nvới dịch vụ" },
];
function Wave({ top = false }: { top?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={top ? "pointer-events-none absolute top-[-1px] bottom-auto rotate-180 left-0 z-[3] h-[58px] w-full text-white" : "pointer-events-none absolute bottom-[-1px] left-0 z-[3] h-[58px] w-full text-white"}
      viewBox="0 0 1440 100"
      preserveAspectRatio="none"
    >
      <path
        d="M0 62C175-12 255 118 500 58S758 28 946 55s306-61 494-16v61H0Z"
        fill="currentColor"
      />
    </svg>
  );
}
function Flight({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute h-[120px] w-[230px] text-[#75ceff] [&_svg:first-child]:h-full [&_svg:first-child]:w-full [&>svg:last-child]:absolute [&>svg:last-child]:top-px [&>svg:last-child]:right-[7px] [&>svg:last-child]:rotate-12 ${className}`}>
      <svg viewBox="0 0 260 130" fill="none">
        <path
          d="M0 115C40 100 100 60 104 90s-52 19-21-19S170 51 235 12"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="7 7"
          strokeLinecap="round"
        />
      </svg>
      <Plane size={34} fill="currentColor" strokeWidth={1} />
    </div>
  );
}
export default function AboutPage() {
  return (
    <div className="[--navy:#092c59] [--blue:#0064ff] [--teal:#0094a9] overflow-hidden bg-white text-[var(--navy)]">
      <section className="relative min-h-[440px] bg-[linear-gradient(115deg,#edfaff,#dff5ff_60%,#b4e0fa)] min-[1500px]:min-h-[520px] max-[700px]:flex max-[700px]:min-h-0 max-[700px]:flex-col max-[700px]:pb-0 max-[700px]:[&>svg]:h-[35px]" aria-labelledby="about-title">
        <div className="absolute inset-y-0 right-0 left-[43%] overflow-hidden rounded-[42%_0_0_19%/55%_0_0_40%] [&_img]:object-[68%_center] min-[1500px]:left-[45%] max-[1000px]:left-[40%] min-[701px]:max-[1000px]:left-[45%] max-[700px]:relative max-[700px]:inset-auto max-[700px]:order-1 max-[700px]:h-[275px] max-[700px]:w-full max-[700px]:rounded-[38%_0_0_0/20%_0_0_0] max-[700px]:[&_img]:object-[center_52%]">
          <Image
            src="/images/about/hero-bay-traveler.png"
            alt="Du khách dang tay đón hành trình khám phá vịnh Hạ Long"
            fill
            priority
            sizes="(max-width: 700px) 100vw, 60vw"
            className="object-cover"
          />
          <span className="[font-family:'Caveat',cursive] text-[32px] font-bold leading-[1.05] absolute bottom-[85px] left-[13%] -rotate-12 text-white [text-shadow:0_2px_12px_#18456c44] max-[700px]:bottom-[55px] max-[700px]:left-[8%] max-[700px]:text-[28px]">
            JourniTrip More
            <br />
            Live Brighter ♡
          </span>
        </div>
        <Flight className="top-[21px] left-[33%] z-[2] max-[1000px]:left-[29%] max-[1000px]:scale-[.8] min-[701px]:max-[1000px]:left-[31%] max-[700px]:top-2 max-[700px]:right-0 max-[700px]:left-auto max-[700px]:w-[150px] max-[700px]:opacity-[.65]" />
        <div className="mx-auto w-[min(1180px,90%)] pointer-events-none relative py-0 pt-[62px] pb-[84px] [&>*]:pointer-events-auto min-[1500px]:pt-[90px] min-[1500px]:pb-[110px] max-[700px]:order-0 max-[700px]:pt-[38px] max-[700px]:pb-[27px]">
          <p className="mb-[13px] flex items-center gap-[9px] text-[10px]! font-extrabold tracking-[.17em] text-[var(--teal)] uppercase max-w-[420px] max-[1000px]:max-w-[350px] min-[701px]:max-[1000px]:max-w-[37vw] max-[700px]:max-w-full before:h-px before:w-6 before:bg-[var(--teal)] before:content-[''] after:h-px after:w-6 after:bg-[var(--teal)] after:content-['']">Về chúng tôi</p>
          <h1 id="about-title" className="font-extrabold tracking-[-.045em]! max-w-[420px] max-[1000px]:max-w-[350px] min-[701px]:max-[1000px]:max-w-[37vw] max-[700px]:max-w-full mb-[18px] text-[clamp(42px,4.8vw,64px)] leading-[1.03] max-[700px]:text-[46px]">
            Chúng tôi là
            <br />
            JourniTrip
          </h1>
          <p className="mb-5 max-w-[390px] text-[16px] leading-[1.65] text-[#405779] max-[1000px]:max-w-[350px] max-[1000px]:text-[14px] min-[701px]:max-[1000px]:max-w-[37vw] max-[700px]:max-w-[400px]">
            Đồng hành cùng bạn trên mọi hành trình khám phá thế giới, mang đến
            những trải nghiệm du lịch đáng nhớ và ý nghĩa.
          </p>
          <a href="#cau-chuyen" className="inline-flex items-center justify-center gap-3 rounded-[40px] bg-[var(--blue)] px-[25px] py-[13px] text-[12px] font-[750] text-white no-underline shadow-[0_7px_16px_#0064ff26] transition-[transform,background] duration-200 hover:-translate-y-0.5 hover:bg-[#004ed1] focus-visible:outline-[3px] focus-visible:outline-[#04acc1] focus-visible:outline-offset-[5px] max-[700px]:px-[19px] max-[700px]:py-3 max-[700px]:text-[11px] motion-reduce:transition-none max-w-[420px] max-[1000px]:max-w-[350px] min-[701px]:max-[1000px]:max-w-[37vw] max-[700px]:max-w-full min-[701px]:max-[1000px]:max-w-[340px]! min-[701px]:max-[1000px]:px-5 min-[701px]:max-[1000px]:text-[11px]">
            Khám phá câu chuyện của chúng tôi <ArrowRight size={17} />
          </a>
        </div>
        <Wave />
      </section>

      <section
        id="cau-chuyen"
        className="relative grid scroll-mt-[95px] grid-cols-[1fr_1fr] items-center gap-[70px] pt-6 pb-[38px] min-[1500px]:pt-[45px] min-[1500px]:pb-[60px] max-[1000px]:gap-[35px] max-[700px]:grid-cols-1 max-[700px]:gap-[30px] max-[700px]:pt-7 max-[700px]:pb-[45px] mx-auto w-[min(1180px,90%)]"
        aria-labelledby="story-title"
      >
        <div className="relative h-[380px] max-[1000px]:h-[340px] max-[700px]:m-auto max-[700px]:h-[335px] max-[700px]:w-[min(440px,100%)]">
          <div className="absolute top-[35px] right-[5%] bottom-5 left-0 -rotate-6 rounded-[15%_35%_21%_12%] bg-[linear-gradient(130deg,#e4f8fc,#f4fcff)]" />
          <div className="absolute top-2.5 left-[20%] h-[245px] w-[70%] -rotate-[7deg] border-[9px] border-white shadow-[0_7px_20px_#16365320] max-[1000px]:h-[215px] max-[700px]:h-[220px]">
            <Image
              src="/images/about/our-story-team.png"
              alt="Những người bạn cùng nhau tận hưởng chuyến đi"
              fill
              sizes="(max-width: 700px) 75vw, 380px"
              className="object-cover"
            />
          </div>
          <span className="absolute z-[2] rounded-2xl bg-white px-[17px] py-[13px] [font-family:'Caveat',cursive] text-[22px] font-bold leading-[1.05] text-[#15506a] shadow-[0_6px_18px_#183c6110] max-[1000px]:text-[19px] top-[125px] left-0 -rotate-[8deg] [&_svg]:absolute [&_svg]:top-[-35px] [&_svg]:left-4 [&_svg]:text-[#ffbd00]">
            <Sun size={34} />
            Những hành trình
            <br />
            thật, những cảm xúc thật!
          </span>
          <div className="absolute right-0 bottom-1.5 h-[185px] w-[55%] rotate-[9deg] border-[9px] border-white shadow-[0_7px_20px_#16365320] max-[1000px]:h-[160px] max-[700px]:h-[164px]">
            <Image
              src="/images/about/our-story-ha-long-bay.png"
              alt="Cảnh sắc vịnh Hạ Long trong hành trình khám phá"
              fill
              sizes="(max-width: 700px) 55vw, 280px"
              className="object-cover"
            />
          </div>
          <span className="absolute z-[2] rounded-2xl bg-white px-[17px] py-[13px] [font-family:'Caveat',cursive] text-[21px] font-bold leading-[1.05] text-[#15506a] shadow-[0_6px_18px_#183c6110] max-[1000px]:text-[19px] bottom-0 left-[40%] -rotate-[8deg] [&_svg]:absolute [&_svg]:top-[-22px] [&_svg]:left-0 [&_svg]:text-[#ff5f65]">
            <MapPin size={25} />
            Khám phá nhiều hơn
            <br />
            cùng JourniTrip
          </span>
        </div>
        <div className="relative">
          <Compass
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-[-135px] size-[155px] -rotate-[15deg] text-[#c0eeff] max-[700px]:right-[-60px] max-[700px]:opacity-[.55]"
            strokeWidth={0.6}
          />
          <p className="mb-[13px] flex items-center gap-[9px] text-[10px]! font-extrabold tracking-[.17em] text-[var(--teal)] uppercase">Câu chuyện của chúng tôi</p>
          <h2 id="story-title" className="font-extrabold tracking-[-.045em]! text-[clamp(26px,2.7vw,36px)] leading-[1.22] max-[700px]:text-[27px]">
            Từ đam mê du lịch
            <br />
            đến sứ mệnh kết nối thế giới
          </h2>
          <p className="my-4 text-[13px] leading-[1.85] text-[#748199]">
            JourniTrip được thành lập bởi những người trẻ yêu thích du lịch,
            luôn tin rằng mỗi chuyến đi không chỉ là đến một điểm đến, mà còn là
            cơ hội để khám phá văn hóa, con người và chính bản thân mình.
          </p>
          <p className="my-4 text-[13px] leading-[1.85] text-[#748199]">
            Với kinh nghiệm nhiều năm trong ngành du lịch, chúng tôi không ngừng
            nỗ lực để mang đến những hành trình chất lượng, linh hoạt và phù hợp
            với mọi nhu cầu – từ những chuyến đi ngắn ngày đến hành trình khám
            phá thế giới.
          </p>
          <a href="#gia-tri" className="mt-[9px] inline-flex items-center justify-center gap-3 rounded-[40px] border border-[var(--blue)] px-6 py-[11px] text-[12px] font-[750] text-[var(--blue)] no-underline transition-[transform,background] duration-200 hover:bg-[#edf6ff] focus-visible:outline-[3px] focus-visible:outline-[#04acc1] focus-visible:outline-offset-[5px] motion-reduce:transition-none">
            Tìm hiểu thêm về chúng tôi <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section className="relative isolate min-h-[390px] bg-[#ddf5ff] min-[1500px]:min-h-[450px] max-[700px]:min-h-0 max-[700px]:[&>svg]:h-[30px]" aria-labelledby="stats-title">
        <Image
          src="/images/about/hero-bay-traveler.png"
          alt=""
          fill
          sizes="100vw"
          className="-z-[2] object-cover object-[center_58%]"
        />
        <div className="absolute inset-0 -z-[1] [background:linear-gradient(90deg,#dbf4fff5_0%,#e5f7fff2_34%,#e8f7ffb0_58%,#c5edff10_85%)] max-[700px]:[background:#e1f5ffdb]" />
        <Wave top />
        <div className="mx-auto w-[min(1180px,90%)] pt-[88px] pb-[85px] [&>p]:mt-[9px] [&>p]:text-[13px] [&>p]:text-[#687e9b] min-[1500px]:py-[105px] max-[700px]:pt-[65px] max-[700px]:pb-[70px]">
          <h2 id="stats-title" className="font-extrabold tracking-[-.045em]! text-[clamp(26px,2.7vw,36px)] leading-[1.22] max-[700px]:text-[26px]">Những con số biết nói</h2>
          <p>
            Sự tin tưởng của bạn là động lực để chúng tôi không ngừng phát
            triển.
          </p>
          <div className="mt-[25px] grid max-w-[760px] grid-cols-[repeat(4,1fr)] gap-[14px] max-[1000px]:max-w-[72%] max-[1000px]:gap-2.5 max-[700px]:mt-[22px] max-[700px]:max-w-full max-[700px]:grid-cols-[repeat(2,1fr)] max-[700px]:gap-3">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={value} className="rounded-[17px] bg-[#ffffffdc] px-2.5 pt-[17px] pb-5 text-center backdrop-blur-[6px] [&>span]:mx-auto [&>span]:mb-2.5 [&>span]:grid [&>span]:size-[43px] [&>span]:place-items-center [&>span]:rounded-full [&>span]:bg-[#ddf4ff] [&>span]:text-[#0099ff] [&_strong]:text-[29px] [&_strong]:leading-[1.4] [&_strong]:tracking-[-.04em] [&_p]:mt-1 [&_p]:text-[12px] [&_p]:leading-[1.65] [&_p]:whitespace-pre-line [&_p]:text-[#71829c] max-[1000px]:[&_strong]:text-[25px] max-[1000px]:[&_p]:text-[11px] max-[700px]:px-2 max-[700px]:py-4 max-[700px]:[&_p]:text-[12px]">
                <span>
                  <Icon size={27} strokeWidth={1.7} />
                </span>
                <strong>{value}</strong>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>
        <span className="[font-family:'Caveat',cursive] text-[32px] font-bold leading-[1.05] absolute top-[110px] right-[6%] -rotate-12 text-white [text-shadow:0_2px_9px_#12496d66] max-[700px]:hidden">
          Good Trips
          <br />
          Better People ♡
        </span>
        <Wave />
      </section>

      <section
        id="gia-tri"
        className="relative scroll-mt-[95px] bg-[linear-gradient(125deg,#fff_40%,#e7f8ff)] pt-5 pb-[30px] min-[1500px]:pt-[30px] max-[700px]:pt-5"
        aria-labelledby="values-title"
      >
        <Flight className="top-0 left-[-30px] scale-[.8] max-[700px]:top-[-5px] max-[700px]:w-[140px] max-[700px]:opacity-50" />
        <div className="mx-auto w-[min(1180px,90%)]">
          <div className="text-center">
            <p className="mb-[13px] flex items-center gap-[9px] text-[10px]! font-extrabold tracking-[.17em] text-[var(--teal)] uppercase justify-center">Vì sao chọn JourniTrip</p>
            <h2 id="values-title" className="font-extrabold tracking-[-.045em]! text-[clamp(26px,2.7vw,36px)] leading-[1.22]">Giá trị chúng tôi mang lại</h2>
          </div>
          <div className="mt-[30px] grid grid-cols-[repeat(5,1fr)] max-[700px]:grid-cols-[repeat(2,1fr)] max-[700px]:gap-x-0 max-[700px]:gap-y-[27px]">
            {values.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="border-r border-[#e3edf4] px-[19px] text-center last:border-0 [&_p]:text-[12px] [&_p]:leading-[1.75] [&_p]:text-[#78879f] max-[1000px]:px-2.5 max-[700px]:px-[15px] max-[700px]:even:border-0 max-[700px]:last:col-span-full max-[700px]:last:max-w-[260px] max-[700px]:last:justify-self-center">
                <span className="mx-auto mb-[17px] grid size-[68px] place-items-center rounded-full bg-[#e1f6f9] text-[#0099ae] max-[700px]:size-[60px]">
                  <Icon size={31} strokeWidth={1.7} />
                </span>
                <h3 className="mb-[9px] text-[13px] font-extrabold tracking-[-.02em]! max-[1000px]:text-[12px] max-[700px]:text-[13px]">{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
          <div className="mt-7 grid grid-cols-[1.05fr_1fr] items-center gap-10 max-[1000px]:gap-5 max-[700px]:mt-[27px] max-[700px]:grid-cols-1 max-[700px]:gap-[15px]">
            <div className="relative h-[230px] -rotate-[3deg] overflow-hidden rounded-[60%_22%_47%_25%/25%_32%_22%_35%] border-8 border-white [&_img]:rotate-[3deg] [&_img]:scale-[1.06] [&_img]:object-[center_65%] max-[700px]:h-[220px]">
              <Image
                src="/images/about/hero-bay-traveler.png"
                alt="Tìm cảm hứng giữa thiên nhiên và những hành trình mới"
                fill
                sizes="(max-width: 700px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <blockquote className="relative m-0 rounded-3xl bg-[#ffffffed] px-[35px] py-[30px] [&>svg:first-child]:absolute [&>svg:first-child]:top-2.5 [&>svg:first-child]:left-5 [&>svg:first-child]:rotate-180 [&>svg:first-child]:text-[#8fc5ff] [&_p]:relative [&_p]:mt-[9px] [&_p]:mb-2.5 [&_p]:text-[15px] [&_p]:leading-[1.8] [&_p]:text-[#405779] [&_cite]:text-[12px] [&_cite]:text-[#244d6a] [&_cite]:not-italic max-[1000px]:p-7 max-[700px]:px-[25px] max-[700px]:py-[30px] max-[700px]:[&_p]:text-[14px]">
              <Quote aria-hidden="true" size={36} fill="currentColor" />
              <p>
                Chúng tôi tin rằng du lịch không chỉ giúp bạn nhìn thấy thế
                giới, mà còn giúp bạn nhìn thấy một phiên bản tốt hơn của chính
                mình.
              </p>
              <cite>— Đội ngũ JourniTrip</cite>
              <Send
                aria-hidden="true"
                className="absolute right-[-38px] bottom-[-12px] rotate-[8deg] text-[#00a1be] max-[700px]:right-[-8px] max-[700px]:bottom-[-16px] max-[700px]:w-[35px]"
                size={49}
                strokeWidth={1}
              />
            </blockquote>
          </div>
        </div>
      </section>

      <section className="relative isolate min-h-[300px] [&>img]:-z-[2] [&>img]:object-[center_62%] max-[700px]:min-h-[390px] max-[700px]:[&>svg]:h-[28px]" aria-labelledby="cta-title">
        <Image
          src="/images/about/travel-dreams-banner.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 -z-[1] bg-[linear-gradient(#effaffee,#e8f6ffb0_58%,#e7f6ff18)]" />
        <Wave top />
        <div className="mx-auto w-[min(1180px,90%)] relative px-[110px] pt-[65px] pb-20 text-center [&>p]:mb-[5px] [&>p]:text-[18px] [&>span]:mt-2.5 [&>span]:mb-[19px] [&>span]:block [&>span]:text-[12px] [&>span]:text-[#637b98] max-[1000px]:px-[90px] max-[700px]:px-0 max-[700px]:pt-[66px] max-[700px]:pb-[135px] max-[700px]:[&>p]:text-[17px] max-[700px]:[&>span]:mx-auto max-[700px]:[&>span]:mt-3 max-[700px]:[&>span]:mb-5 max-[700px]:[&>span]:max-w-[300px] max-[700px]:[&>span]:leading-[1.7]">
          <p>Hãy cùng chúng tôi</p>
          <h2 id="cta-title" className="font-extrabold tracking-[-.045em]! text-[clamp(24px,2.3vw,31px)] leading-[1.22] max-[700px]:text-[27px]">biến những ước mơ du lịch thành hiện thực</h2>
          <span>
            Khám phá thế giới, tạo nên những hành trình đáng nhớ cùng
            JourniTrip.
          </span>
          <Link href="/tours" className="inline-flex items-center justify-center gap-3 rounded-[40px] bg-[var(--blue)] px-[25px] py-[13px] text-[12px] font-[750] text-white no-underline shadow-[0_7px_16px_#0064ff26] transition-[transform,background] duration-200 hover:-translate-y-0.5 hover:bg-[#004ed1] focus-visible:outline-[3px] focus-visible:outline-[#04acc1] focus-visible:outline-offset-[5px] max-[700px]:px-[19px] max-[700px]:py-3 max-[700px]:text-[11px] motion-reduce:transition-none">
            Khám phá tour ngay <ArrowRight size={17} />
          </Link>
        </div>
        <div aria-hidden="true" className="absolute right-[5%] bottom-[5px] flex rotate-[6deg] flex-col items-center gap-1.5 pb-[18px] before:absolute before:inset-y-0 before:-z-[1] before:w-[9px] before:bg-[#80604a] before:content-[''] [&_span]:min-w-[118px] [&_span]:bg-[linear-gradient(10deg,#b5916d,#e7c9a1_55%,#bd9671)] [&_span]:px-4 [&_span]:py-[7px] [&_span]:text-center [&_span]:text-[14px] [&_span]:font-semibold [&_span]:text-[#5b422e] [&_span]:shadow-[1px_3px_4px_#49372233] [&_span]:[clip-path:polygon(7%_0,100%_0,96%_80%,0_100%,0_20%)] [&_span:nth-child(even)]:-rotate-[9deg] max-[1000px]:right-[2%] max-[1000px]:origin-bottom-right max-[1000px]:scale-[.8] max-[700px]:scale-[.65]">
          <span>New Places</span>
          <span>New Friends</span>
          <span>New Stories</span>
          <span>
            Same You
            <br />
            Happier
          </span>
        </div>
      </section>
    </div>
  );
}
