import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Globe2,
  Heart,
  Leaf,
  ShieldCheck,
  Users,
} from "lucide-react";

export const metadata = {
  title: "Về chúng tôi - VietExplore",
  description:
    "VietExplore là đơn vị chuyên cung cấp các tour du lịch trong nước và quốc tế, mang đến những trải nghiệm đáng nhớ, an toàn và trọn vẹn.",
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
  { value: "10+", label: "Năm kinh nghiệm\ntrong ngành du lịch" },
  { value: "50.000+", label: "Khách hàng\nđã đồng hành" },
  { value: "1.000+", label: "Tour trong nước\nvà quốc tế" },
  { value: "100%", label: "Khách hàng hài lòng\nvới dịch vụ" },
];

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-white text-[#0b2c3d]">
      {/* HERO */}
      <section className="relative min-h-[330px] overflow-hidden sm:min-h-[390px] lg:min-h-[410px]">
        <Image
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=85&w=1800"
          alt="Khám phá thế giới cùng VietExplore"
          fill
          priority
          className="object-cover object-[68%_54%]"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#eefbff]/98 via-[#eefbff]/86 via-45% to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[330px] max-w-[1220px] items-center px-5 py-10 sm:min-h-[390px] sm:px-8 lg:min-h-[410px] lg:px-10">
          <div className="max-w-[450px]">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#0c797c]">
                VỀ CHÚNG TÔI
              </span>
              <span className="h-px w-8 bg-[#0c797c]" />
            </div>

            <h1 className="text-[38px] font-black leading-[1.02] tracking-[-0.04em] text-[#0b2c3d] sm:text-[46px] lg:text-[50px]">
              Chúng tôi là ai?
            </h1>

            <p className="mt-4 max-w-[410px] text-[14px] leading-6 text-slate-700 sm:text-[15px]">
              Chúng tôi là <strong className="font-extrabold text-[#0b2c3d]">VietExplore</strong> – đơn vị chuyên cung cấp
              các tour du lịch trong nước và quốc tế, mang đến những trải nghiệm đáng nhớ, an toàn và trọn vẹn cho mọi
              hành trình của bạn.
            </p>

            <div className="mt-6 flex items-center gap-4">
              <span className="font-handwriting max-w-[270px] rotate-[-3deg] text-[25px] font-bold leading-8 text-[#08777c] sm:text-[29px]">
                Khám phá thế giới
                <br />
                cùng chúng tôi!
              </span>
              <svg viewBox="0 0 72 42" className="h-11 w-[76px] text-[#08777c]" fill="none">
                <path d="M2 29c16-19 35-18 51-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="5 5" />
                <path d="m51 22 15-13-6 18-9-5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="bg-white py-14 sm:py-16 lg:py-[58px]">
        <div className="mx-auto grid max-w-[1220px] items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-10">
          <div className="relative mx-auto h-[350px] w-full max-w-[520px] sm:h-[390px] lg:mx-0">
            <div className="absolute left-0 top-0 w-[76%] -rotate-[5deg] bg-white p-2.5 shadow-[0_14px_35px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/70">
              <div className="relative aspect-[1.45/1] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=85&w=900"
                  alt="Đội ngũ VietExplore"
                  fill
                  className="object-cover"
                  sizes="520px"
                />
              </div>
            </div>

            <div className="absolute bottom-8 right-0 z-20 w-[52%] rotate-[5deg] bg-white p-2.5 shadow-[0_14px_35px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70">
              <div className="relative aspect-[1.45/1] overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1528127269322-539801943592?q=85&w=700"
                  alt="Vịnh Hạ Long"
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
            </div>

            <div className="absolute bottom-0 left-2 rotate-[-5deg]">
              <p className="font-handwriting text-[22px] font-bold leading-6 text-[#173746] sm:text-[24px]">
                Những hành trình
                <br />
                thật, những cảm xúc thật!
              </p>
              <div className="mt-2 h-[2px] w-28 rotate-[-4deg] bg-[#0c8d91]" />
            </div>

            <div className="absolute bottom-14 left-[54%] h-8 w-8 text-[#0c8d91]">
              <span className="absolute left-0 top-0 h-px w-7 rotate-[72deg] bg-current" />
              <span className="absolute left-1 top-2 h-px w-6 rotate-[30deg] bg-current" />
              <span className="absolute left-4 top-1 h-px w-6 -rotate-[18deg] bg-current" />
            </div>
          </div>

          <div className="max-w-[560px] lg:pl-2">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#0c797c]">
              CÂU CHUYỆN CỦA CHÚNG TÔI
            </p>
            <h2 className="mt-3 text-[30px] font-black leading-[1.12] tracking-[-0.03em] text-[#0b2c3d] sm:text-[34px] lg:max-w-[470px]">
              Từ đam mê du lịch
              <br className="hidden sm:block" /> đến sứ mệnh kết nối
            </h2>

            <div className="mt-5 space-y-4 text-[14px] leading-6 text-slate-600">
              <p>
                VietExplore được thành lập bởi những người trẻ yêu thích du lịch, luôn tin rằng: mỗi chuyến đi không chỉ
                là điểm đến, mà còn là cơ hội để khám phá văn hóa, con người và chính bản thân mình.
              </p>
              <p>
                Với kinh nghiệm nhiều năm trong ngành du lịch, chúng tôi không ngừng nỗ lực để mang đến những hành trình
                chất lượng, linh hoạt và phù hợp với mọi nhu cầu – từ những chuyến đi ngắn ngày đến hành trình khám phá
                thế giới.
              </p>
            </div>

            <Link
              href="/tours"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#109a9a] px-6 py-3 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(16,154,154,0.24)] transition hover:-translate-y-0.5 hover:bg-[#0d8686]"
            >
              Tìm hiểu thêm về chúng tôi
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-[#edf9fb] py-12 sm:py-14">
        <div className="mx-auto max-w-[1220px] px-5 sm:px-8 lg:px-10">
          <div className="text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#0c797c]">
              VÌ SAO CHỌN VIETEXPLORE
            </p>
            <h2 className="mt-2 text-[28px] font-black tracking-[-0.03em] text-[#0b2c3d] sm:text-[32px]">
              Giá trị chúng tôi mang lại
            </h2>
          </div>

          <div className="mt-8 grid gap-y-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="px-5 text-center lg:border-r lg:border-[#d9ecef] lg:last:border-r-0">
                <div className="mx-auto flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#dff3f4] text-[#0c8d91]">
                  <Icon className="h-7 w-7 stroke-[1.7]" />
                </div>
                <h3 className="mt-4 text-[13px] font-extrabold text-[#0b2c3d]">{title}</h3>
                <p className="mx-auto mt-2 max-w-[175px] text-[11px] leading-[1.7] text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-[1220px] items-stretch lg:grid-cols-[36%_64%]">
          <div className="relative min-h-[240px] sm:min-h-[290px] lg:min-h-[220px]">
            <Image
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=85&w=900"
              alt="Hành trình khám phá"
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 440px"
            />
          </div>

          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-8">
            <h2 className="text-[25px] font-black tracking-[-0.03em] text-[#0b2c3d] sm:text-[28px]">
              Những con số biết nói
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-y-8 sm:grid-cols-4 sm:gap-y-0">
              {stats.map((stat, index) => (
                <div key={stat.value} className={`px-4 ${index === 0 ? "sm:pl-0" : ""} sm:border-r sm:border-slate-200 sm:last:border-r-0`}>
                  <div className="text-[24px] font-black leading-none tracking-[-0.03em] text-[#0b2c3d] sm:text-[27px]">
                    {stat.value}
                  </div>
                  <p className="mt-2 whitespace-pre-line text-[11px] leading-[1.55] text-slate-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative min-h-[260px] overflow-hidden text-white sm:min-h-[285px]">
        <Image
          src="https://images.unsplash.com/photo-1528127269322-539801943592?q=85&w=1800"
          alt="Biến những ước mơ du lịch thành hiện thực"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06515d]/95 via-[#087489]/78 to-[#0b8191]/15" />

        <div className="relative z-10 mx-auto grid min-h-[260px] max-w-[1220px] items-center gap-8 px-5 py-10 sm:min-h-[285px] sm:px-8 lg:grid-cols-[1fr_0.75fr] lg:px-10">
          <div className="max-w-[500px]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/85">HÃY CÙNG CHÚNG TÔI</p>
            <h2 className="mt-2 text-[28px] font-black leading-[1.12] tracking-[-0.03em] sm:text-[32px] lg:text-[34px]">
              Biến những ước mơ du lịch
              <br />
              thành hiện thực
            </h2>
            <p className="mt-3 max-w-[475px] text-[12px] leading-5 text-white/90 sm:text-[13px]">
              Dù bạn muốn khám phá thiên nhiên, trải nghiệm văn hóa hay đơn giản là tìm một nơi để thư giãn – VietExplore
              luôn sẵn sàng đồng hành cùng bạn.
            </p>
            <Link
              href="/tours"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-[12px] font-extrabold text-[#0c767d] shadow-lg transition hover:-translate-y-0.5 hover:bg-slate-50"
            >
              Khám phá tour ngay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="hidden justify-end lg:flex">
            <div className="rotate-[-5deg] text-right">
              <p className="font-handwriting text-[31px] font-bold leading-[1.05] drop-shadow-md xl:text-[35px]">
                Cùng bạn
                <br />
                đi khắp muôn nơi ♡
              </p>
              <div className="ml-auto mt-2 h-[2px] w-36 rotate-[2deg] bg-white/90" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
