import Image from "next/image";
import { ArrowRight, Compass, MapPin, Sun } from "lucide-react";

export function AboutStorySection() {
  return (
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
        <p className="mb-[13px] flex items-center gap-[9px] text-[10px]! font-extrabold tracking-[.17em] text-[var(--teal)] uppercase">
          Câu chuyện của chúng tôi
        </p>
        <h2
          id="story-title"
          className="font-extrabold tracking-[-.045em]! text-[clamp(26px,2.7vw,36px)] leading-[1.22] max-[700px]:text-[27px]"
        >
          Từ đam mê du lịch
          <br />
          đến sứ mệnh kết nối thế giới
        </h2>
        <p className="my-4 text-[13px] leading-[1.85] text-[#748199]">
          JourniTrip được thành lập bởi những người trẻ yêu thích du lịch, luôn
          tin rằng mỗi chuyến đi không chỉ là đến một điểm đến, mà còn là cơ hội
          để khám phá văn hóa, con người và chính bản thân mình.
        </p>
        <p className="my-4 text-[13px] leading-[1.85] text-[#748199]">
          Với kinh nghiệm nhiều năm trong ngành du lịch, chúng tôi không ngừng nỗ
          lực để mang đến những hành trình chất lượng, linh hoạt và phù hợp với
          mọi nhu cầu – từ những chuyến đi ngắn ngày đến hành trình khám phá thế
          giới.
        </p>
        <a
          href="#gia-tri"
          className="mt-[9px] inline-flex items-center justify-center gap-3 rounded-[40px] border border-[var(--blue)] px-6 py-[11px] text-[12px] font-[750] text-[var(--blue)] no-underline transition-[transform,background] duration-200 hover:bg-[#edf6ff] focus-visible:outline-[3px] focus-visible:outline-[#04acc1] focus-visible:outline-offset-[5px] motion-reduce:transition-none"
        >
          Tìm hiểu thêm về chúng tôi <ArrowRight size={16} />
        </a>
      </div>
    </section>
  );
}

