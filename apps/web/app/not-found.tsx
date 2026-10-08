import Link from "next/link";
import { ArrowLeft, Compass, Home, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[75vh] items-center justify-center overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-50 px-4 py-16">
      {/* Background decoration */}
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

      {/* Decorative icons */}
      <MapPin className="absolute left-[12%] top-[20%] hidden h-8 w-8 rotate-[-15deg] text-sky-300 md:block" />
      <Compass className="absolute bottom-[18%] right-[12%] hidden h-10 w-10 rotate-12 text-blue-300 md:block" />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-sm font-medium text-sky-700 shadow-sm backdrop-blur">
          <MapPin className="h-4 w-4" />
          Có vẻ bạn đã đi lạc
        </div>

        {/* 404 */}
        <h1 className="bg-gradient-to-r from-sky-500 to-blue-700 bg-clip-text text-[110px] font-black leading-none tracking-tight text-transparent sm:text-[150px] md:text-[180px]">
          404
        </h1>

        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Điểm đến này không tồn tại
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
          Có vẻ như hành trình này đã thay đổi hoặc trang bạn đang tìm kiếm
          không còn tồn tại. Hãy quay lại và tiếp tục khám phá những điểm đến
          tuyệt vời khác.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Trở về trang chủ
          </Link>

          <Link
            href="/tours"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-600 hover:shadow-md sm:w-auto"
          >
            Khám phá tour
            <ArrowLeft className="h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Suggestion */}
        <div className="mt-12 border-t border-slate-200/70 pt-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            Hành trình vẫn tiếp tục
          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm">
            <Link
              href="/tours"
              className="text-slate-500 transition hover:text-blue-600"
            >
              Tour nổi bật
            </Link>

            <Link
              href="/destinations"
              className="text-slate-500 transition hover:text-blue-600"
            >
              Điểm đến
            </Link>

            <Link
              href="/blog"
              className="text-slate-500 transition hover:text-blue-600"
            >
              Cẩm nang du lịch
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}