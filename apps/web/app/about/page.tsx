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
import styles from "./about.module.css";

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
      className={`${styles.wave} ${top ? styles.waveTop : ""}`}
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
    <div aria-hidden="true" className={`${styles.flight} ${className}`}>
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
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroPhoto}>
          <Image
            src="/images/about/hero-bay-traveler.png"
            alt="Du khách dang tay đón hành trình khám phá vịnh Hạ Long"
            fill
            priority
            sizes="(max-width: 700px) 100vw, 60vw"
            className={styles.cover}
          />
          <span className={`${styles.handwriting} ${styles.heroNote}`}>
            JourniTrip More
            <br />
            Live Brighter ♡
          </span>
        </div>
        <Flight className={styles.heroFlight} />
        <div className={`${styles.container} ${styles.heroContent}`}>
          <p className={styles.eyebrow}>Về chúng tôi</p>
          <h1 id="about-title">
            Chúng tôi là
            <br />
            JourniTrip
          </h1>
          <p className={styles.heroDescription}>
            Đồng hành cùng bạn trên mọi hành trình khám phá thế giới, mang đến
            những trải nghiệm du lịch đáng nhớ và ý nghĩa.
          </p>
          <a href="#cau-chuyen" className={styles.primaryButton}>
            Khám phá câu chuyện của chúng tôi <ArrowRight size={17} />
          </a>
        </div>
        <Wave />
      </section>

      <section
        id="cau-chuyen"
        className={`${styles.story} ${styles.container}`}
        aria-labelledby="story-title"
      >
        <div className={styles.collage}>
          <div className={styles.collageBackdrop} />
          <div className={styles.storyPhoto}>
            <Image
              src="/images/about/our-story-team.png"
              alt="Những người bạn cùng nhau tận hưởng chuyến đi"
              fill
              sizes="(max-width: 700px) 75vw, 380px"
              className={styles.cover}
            />
          </div>
          <span className={`${styles.sticker} ${styles.storySticker}`}>
            <Sun size={34} />
            Những hành trình
            <br />
            thật, những cảm xúc thật!
          </span>
          <div className={styles.detailPhoto}>
            <Image
              src="/images/about/our-story-ha-long-bay.png"
              alt="Cảnh sắc vịnh Hạ Long trong hành trình khám phá"
              fill
              sizes="(max-width: 700px) 55vw, 280px"
              className={styles.cover}
            />
          </div>
          <span className={`${styles.sticker} ${styles.detailSticker}`}>
            <MapPin size={25} />
            Khám phá nhiều hơn
            <br />
            cùng JourniTrip
          </span>
        </div>
        <div className={styles.storyCopy}>
          <Compass
            aria-hidden="true"
            className={styles.compass}
            strokeWidth={0.6}
          />
          <p className={styles.eyebrow}>Câu chuyện của chúng tôi</p>
          <h2 id="story-title">
            Từ đam mê du lịch
            <br />
            đến sứ mệnh kết nối thế giới
          </h2>
          <p>
            JourniTrip được thành lập bởi những người trẻ yêu thích du lịch,
            luôn tin rằng mỗi chuyến đi không chỉ là đến một điểm đến, mà còn là
            cơ hội để khám phá văn hóa, con người và chính bản thân mình.
          </p>
          <p>
            Với kinh nghiệm nhiều năm trong ngành du lịch, chúng tôi không ngừng
            nỗ lực để mang đến những hành trình chất lượng, linh hoạt và phù hợp
            với mọi nhu cầu – từ những chuyến đi ngắn ngày đến hành trình khám
            phá thế giới.
          </p>
          <a href="#gia-tri" className={styles.outlineButton}>
            Tìm hiểu thêm về chúng tôi <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section className={styles.statistics} aria-labelledby="stats-title">
        <Image
          src="/images/about/hero-bay-traveler.png"
          alt=""
          fill
          sizes="100vw"
          className={styles.statsPhoto}
        />
        <div className={styles.statsVeil} />
        <Wave top />
        <div className={`${styles.container} ${styles.statsContent}`}>
          <h2 id="stats-title">Những con số biết nói</h2>
          <p>
            Sự tin tưởng của bạn là động lực để chúng tôi không ngừng phát
            triển.
          </p>
          <div className={styles.statsGrid}>
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={value} className={styles.statCard}>
                <span>
                  <Icon size={27} strokeWidth={1.7} />
                </span>
                <strong>{value}</strong>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>
        <span className={`${styles.handwriting} ${styles.statsNote}`}>
          Good Trips
          <br />
          Better People ♡
        </span>
        <Wave />
      </section>

      <section
        id="gia-tri"
        className={styles.values}
        aria-labelledby="values-title"
      >
        <Flight className={styles.valuesFlight} />
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>Vì sao chọn JourniTrip</p>
            <h2 id="values-title">Giá trị chúng tôi mang lại</h2>
          </div>
          <div className={styles.valuesGrid}>
            {values.map(({ icon: Icon, title, desc }) => (
              <article key={title} className={styles.value}>
                <span className={styles.valueIcon}>
                  <Icon size={31} strokeWidth={1.7} />
                </span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </article>
            ))}
          </div>
          <div className={styles.quoteRow}>
            <div className={styles.quotePhoto}>
              <Image
                src="/images/about/hero-bay-traveler.png"
                alt="Tìm cảm hứng giữa thiên nhiên và những hành trình mới"
                fill
                sizes="(max-width: 700px) 100vw, 50vw"
                className={styles.cover}
              />
            </div>
            <blockquote className={styles.quote}>
              <Quote aria-hidden="true" size={36} fill="currentColor" />
              <p>
                Chúng tôi tin rằng du lịch không chỉ giúp bạn nhìn thấy thế
                giới, mà còn giúp bạn nhìn thấy một phiên bản tốt hơn của chính
                mình.
              </p>
              <cite>— Đội ngũ JourniTrip</cite>
              <Send
                aria-hidden="true"
                className={styles.paperPlane}
                size={49}
                strokeWidth={1}
              />
            </blockquote>
          </div>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="cta-title">
        <Image
          src="/images/about/travel-dreams-banner.png"
          alt=""
          fill
          sizes="100vw"
          className={styles.cover}
        />
        <div className={styles.ctaVeil} />
        <Wave top />
        <div className={`${styles.container} ${styles.ctaContent}`}>
          <p>Hãy cùng chúng tôi</p>
          <h2 id="cta-title">biến những ước mơ du lịch thành hiện thực</h2>
          <span>
            Khám phá thế giới, tạo nên những hành trình đáng nhớ cùng
            JourniTrip.
          </span>
          <Link href="/tours" className={styles.primaryButton}>
            Khám phá tour ngay <ArrowRight size={17} />
          </Link>
        </div>
        <div aria-hidden="true" className={styles.signpost}>
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
