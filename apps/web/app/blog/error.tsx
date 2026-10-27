"use client";
export default function BlogError({ reset }: { reset: () => void }) {
  return (
    <main className="px-6 py-24 text-center">
      <h1 className="text-2xl font-bold">Chưa thể tải bài viết</h1>
      <p className="my-4 text-slate-500">Vui lòng thử lại sau ít phút.</p>
      <button
        onClick={reset}
        className="rounded-xl bg-sky-600 px-5 py-3 text-white"
      >
        Thử lại
      </button>
    </main>
  );
}
