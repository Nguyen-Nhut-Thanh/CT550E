import Image from "next/image";
import Link from "next/link";
import { Camera, Lightbulb, Navigation, Send, Utensils } from "lucide-react";

export function BlogArticleContent() {
  return (
    <article className="space-y-8 text-slate-700">
      {/* Section 1 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Vịnh Hạ Long – Viên ngọc xanh của Việt Nam
        </h2>
        <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
          Vịnh Hạ Long, thuộc tỉnh Quảng Ninh, là một trong những kỳ quan thiên
          nhiên thế giới được UNESCO công nhận. Với hàng nghìn hòn đảo lớn nhỏ, làn
          nước trong xanh và cảnh quan kỳ vĩ, nơi đây luôn là điểm đến lý tưởng cho
          những ai yêu thích khám phá và trải nghiệm thiên nhiên.
        </p>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=1200"
            alt="Vịnh Hạ Long"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 800px"
          />
        </div>
      </div>

      {/* Section 2 */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Những trải nghiệm không thể bỏ lỡ
        </h2>

        <div className="space-y-5">
          {/* Experience Item 1 */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
              <Navigation className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                Du thuyền trên vịnh
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 sm:text-base">
                Ngắm nhìn những hòn đảo đá vôi kỳ vĩ, tận hưởng không khí trong
                lành và tham gia các hoạt động thú vị như chèo kayak, tắm biển.
              </p>
            </div>
          </div>

          {/* Experience Item 2 */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Camera className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                Khám phá hang động
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 sm:text-base">
                Các hang động nổi tiếng như Hang Sửng Sốt, Hang Luồn, Động Thiên
                Cung sẽ khiến bạn trầm trồ trước vẻ đẹp huyền bí của thiên nhiên.
              </p>
            </div>
          </div>

          {/* Experience Item 3 */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Utensils className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                Thưởng thức ẩm thực địa phương
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 sm:text-base">
                Đừng quên thưởng thức các món hải sản tươi ngon như chả mực, sam
                biển, hàu nướng mỡ hành...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tip / Callout Box */}
      <div className="flex items-start gap-4 rounded-2xl border border-sky-100 bg-sky-50/80 p-5 sm:p-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-sm">
          <Lightbulb className="h-5 w-5" />
        </div>
        <p className="text-sm font-medium italic text-slate-700 sm:text-base">
          “Thời điểm lý tưởng để du lịch Hạ Long là từ tháng 4 đến tháng 6, khi
          thời tiết mát mẻ, ít mưa và biển lặng.”
        </p>
      </div>

      {/* Section 3 (Conclusion & CTA) */}
      <div className="space-y-5 pt-2">
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Lời kết
        </h2>
        <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
          Vịnh Hạ Long không chỉ là một điểm đến, mà còn là một trải nghiệm đáng
          nhớ trong cuộc đời. Nếu bạn đang tìm kiếm một chuyến đi vừa thư giãn
          vừa khám phá, đừng bỏ lỡ cơ hội đặt chân đến nơi đây nhé!
        </p>

        <div className="pt-2">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2.5 rounded-full bg-sky-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition hover:bg-sky-700 active:scale-95"
          >
            <Send className="h-4 w-4" />
            <span>Đặt tour ngay</span>
            <span>→</span>
          </Link>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-4">
          {["#Vịnh Hạ Long", "#Quảng Ninh", "#Du lịch Việt Nam", "#Khám phá thiên nhiên"].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 cursor-pointer"
              >
                {tag}
              </span>
            ),
          )}
        </div>
      </div>
    </article>
  );
}
