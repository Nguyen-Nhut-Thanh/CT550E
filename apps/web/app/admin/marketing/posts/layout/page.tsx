"use client";

import CustomDropdown from "@/components/common/CustomDropdown";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Loader2, Save, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/common/AdminPageHeader";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { getAdminPosts } from "@/lib/admin/posts/api";
import { requestAdminJson } from "@/lib/http/requestAdminJson";
import { useToast } from "@/lib/notifications/useToast";
import type { PostItem } from "shared";

type Placement = { slot: number; post_id: number };
const label = (index: number) =>
  index === 0
    ? "Bài chủ đạo"
    : index < 5
      ? "Bài nổi bật"
      : "Có thể bạn sẽ thích";

export default function BlogLayoutAdminPage() {
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [slots, setSlots] = useState<(number | null)[]>(Array(9).fill(null));
  const [active, setActive] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [failure, setFailure] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const { success, error } = useToast();
  const load = useCallback(async () => {
    setLoading(true);
    setFailure("");
    try {
      const [items, placements] = await Promise.all([
        getAdminPosts(),
        requestAdminJson<Placement[]>(
          "/admin/posts/layout",
          { method: "GET" },
          "Không thể tải bố cục.",
        ),
      ]);
      setPosts(items);
      setSlots(
        Array.from(
          { length: 9 },
          (_, index) =>
            placements.find((item) => item.slot === index + 1)?.post_id ?? null,
        ),
      );
      setDirty(false);
    } catch (cause) {
      setFailure(
        cause instanceof Error ? cause.message : "Không thể tải dữ liệu.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const published = posts.filter((post) => post.status === 1);
  const selected = slots.map((id) =>
    published.find((post) => post.post_id === id),
  );
  const remaining = published.filter(
    (post) => !selected.some((item) => item?.post_id === post.post_id),
  );
  const effective = selected.map((post) => post ?? remaining.shift());
  if (!effective[0]) {
    const first = effective.findIndex(Boolean);
    if (first > 0) {
      effective[0] = effective[first];
      effective[first] = undefined;
    }
  }
  const categories = [
    ...new Map(
      posts.map((post) => [
        post.category_id,
        post.category?.name || "Chưa phân loại",
      ]),
    ).entries(),
  ];
  const filtered = published.filter(
    (post) =>
      post.title
        .toLocaleLowerCase("vi")
        .includes(search.trim().toLocaleLowerCase("vi")) &&
      (!category || post.category_id === Number(category)),
  );
  const assign = (id: number | null) => {
    setSlots((previous) =>
      previous.map((value, index) => (index === active ? id : value)),
    );
    setDirty(true);
  };
  async function save() {
    setSaving(true);
    try {
      await requestAdminJson(
        "/admin/posts/layout",
        { method: "PATCH", body: JSON.stringify({ slots }) },
        "Không thể lưu bố cục.",
      );
      setDirty(false);
      success("Đã cập nhật bố cục trang bài viết.");
    } catch (cause) {
      error(cause instanceof Error ? cause.message : "Không thể lưu bố cục.");
    } finally {
      setSaving(false);
    }
  }
  function slot(index: number, compact = false) {
    const post = effective[index];
    const invalid = slots[index] !== null && !selected[index];
    return (
      <button
        type="button"
        onClick={() => setActive(index)}
        aria-pressed={active === index}
        className={`relative w-full overflow-hidden rounded-xl border-2 text-left transition ${active === index ? "border-blue-500 ring-4 ring-blue-100" : "border-slate-200 hover:border-blue-300"} ${compact ? "min-h-20" : "min-h-36"}`}
      >
        {post && (
          <ImageWithFallback
            src={post.thumbnail || undefined}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div
          className={`absolute inset-0 ${post ? "bg-gradient-to-t from-slate-950/95 to-slate-950/20" : "bg-slate-100"}`}
        />
        <div
          className={`relative flex h-full flex-col justify-end gap-1 p-3 ${post ? "text-white" : "text-slate-600"}`}
        >
          <span className="w-fit rounded-md bg-blue-600 px-2 py-1 text-xs font-bold text-white">
            {String(index + 1).padStart(2, "0")} · {label(index)}
          </span>
          <span className="line-clamp-2 text-sm font-semibold">
            {post?.title || "Chưa có bài viết"}
          </span>
          <span
            className={`text-[11px] ${invalid ? "text-red-300" : "opacity-80"}`}
          >
            {invalid
              ? "Bài đã ẩn hoặc bị xóa · đang tự bù"
              : selected[index]
                ? "Đã chọn thủ công"
                : "Tự lấy bài mới nhất"}
          </span>
        </div>
      </button>
    );
  }
  if (loading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-blue-600" />
        <span className="sr-only">Đang tải bố cục</span>
      </div>
    );
  if (failure)
    return (
      <div role="alert" className="rounded-xl bg-red-50 p-6 text-red-700">
        {failure}
        <button onClick={load} className="ml-4 underline">
          Thử lại
        </button>
      </div>
    );
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Thiết lập trang bài viết"
        description="Chọn bài vào từng vị trí. Ảnh bìa và nội dung tự cập nhật theo bài viết."
        actions={
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving || !dirty}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Lưu bố cục
            </button>
          </div>
        }
      />
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <Link href="/admin/marketing/posts" className="text-blue-600">
          ← Quản lý bài viết
        </Link>
        <span className={dirty ? "text-amber-600" : "text-slate-500"}>
          {dirty ? "Có thay đổi chưa lưu" : "Bố cục đã lưu"} ·{" "}
          {slots.filter(Boolean).length}/9 vị trí chọn thủ công
        </span>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-slate-900">
            <LayoutGrid size={18} />
            Sơ đồ trang bài viết
          </h2>
          {slot(0)}
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(150px,.8fr)] gap-3">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
              <span className="text-xs font-bold uppercase text-slate-400">
                Nội dung bài 01
              </span>
              <p className="mt-3 line-clamp-5 text-sm leading-6 text-slate-600">
                {effective[0]?.summary ||
                  "Nội dung chính luôn đi cùng bài chủ đạo, không cần chọn riêng."}
              </p>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((index) => (
                <div key={index}>{slot(index, true)}</div>
              ))}
            </div>
          </div>
          <h3 className="text-sm font-bold text-slate-700">
            Có thể bạn sẽ thích
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[5, 6, 7, 8].map((index) => (
              <div key={index}>{slot(index)}</div>
            ))}
          </div>
          <p className="text-xs leading-5 text-slate-500">
            Ô để tự động sẽ lấy bài công khai mới nhất chưa xuất hiện ở vị trí
            khác. Không đủ bài thì khối hiển thị sẽ thu gọn và ưu tiên có bài
            chủ đạo.
          </p>
        </section>
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-bold text-slate-900">
                Vị trí {String(active + 1).padStart(2, "0")} · {label(active)}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Chỉ bài đã xuất bản mới có thể được chọn.
              </p>
            </div>
            <button
              onClick={() => assign(null)}
              disabled={slots[active] === null || saving}
              className="shrink-0 text-xs font-semibold text-blue-600 disabled:opacity-40"
            >
              Để tự động
            </button>
          </div>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-3 text-slate-400"
            />
            <input
              aria-label="Tìm bài viết"
              placeholder="Tìm tiêu đề bài viết..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm"
            />
          </div>
          <CustomDropdown
            variant="compact"
            matchTriggerWidth
            selectedValue={category}
            onSelect={setCategory}
            options={[
              { value: "", label: "Tất cả danh mục" },
              ...categories.map(([id, name]) => ({
                value: String(id),
                label: name,
              })),
            ]}
          />
          <div className="max-h-[620px] space-y-2 overflow-y-auto">
            {filtered.map((post) => {
              const usedAt = slots.indexOf(post.post_id);
              return (
                <button
                  key={post.post_id}
                  disabled={saving || (usedAt !== -1 && usedAt !== active)}
                  onClick={() => assign(post.post_id)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left disabled:opacity-40 ${slots[active] === post.post_id ? "border-blue-400 bg-blue-50" : "border-slate-100 hover:bg-slate-50"}`}
                >
                  <ImageWithFallback
                    src={post.thumbnail || undefined}
                    alt=""
                    className="h-14 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-800">
                      {post.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {usedAt !== -1
                        ? `Đã chọn ở vị trí ${String(usedAt + 1).padStart(2, "0")}`
                        : post.category?.name}
                    </p>
                  </div>
                </button>
              );
            })}
            {!filtered.length && (
              <div className="space-y-3 py-10 text-center text-sm text-slate-500">
                <p>Chưa có bài công khai phù hợp.</p>
                <Link
                  href="/admin/marketing/posts/new"
                  className="text-blue-600"
                >
                  Viết bài mới
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
