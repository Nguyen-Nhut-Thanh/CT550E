"use client";

import { useId } from "react";

import CustomDropdown from "@/components/common/forms/CustomDropdown";
import { ARTICLE_ICONS, type ArticleBlock } from "shared";
import { ImageUpload } from "@/components/common/forms/ImageUpload";
import { ArticleBlockIcon } from "@/components/blog/article/ArticleBlockIcon";
import { PostRichTextInput } from "@/components/admin/posts/editor/PostRichTextInput";
import { PostTourPicker } from "@/components/admin/posts/editor/PostTourPicker";

const icons = {
  ship: "Du thuyền",
  camera: "Máy ảnh",
  utensils: "Ẩm thực",
  lightbulb: "Mẹo hay",
  map: "Địa điểm",
  mountain: "Núi",
  sun: "Thời tiết",
  info: "Thông tin",
};

export function PostBlockFields({
  block,
  onChange,
}: {
  block: ArticleBlock;
  onChange: (block: ArticleBlock) => void;
}) {
  const fieldId = useId();
  switch (block.type) {
    case "paragraph":
      return (
        <PostRichTextInput
          label="Nội dung đoạn văn"
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
        />
      );
    case "heading":
      return (
        <div className="ui-post-block-fields-fieldRow grid grid-cols-[minmax(0,_1fr)_minmax(0,_2fr)] [align-items:start] gap-[12px] [&>*]:min-w-0 [&_label]:block [&_label]:m-[0_0_6px] [&_label]:overflow-hidden [&_label]:text-[#64748b] [&_label]:text-[14px] [&_label]:font-medium [&_label]:leading-[20px] [&_label]:text-ellipsis [&_label]:whitespace-nowrap [&_input]:h-[44px] [&_input]:min-w-0 [&_button[aria-haspopup=listbox]]:h-[44px] [&_button[aria-haspopup=listbox]]:min-w-0 admin-max-600:grid-cols-[minmax(0,_1fr)]">
          <CustomDropdown
            label="Cấp tiêu đề"
            variant="compact"
            matchTriggerWidth
            selectedValue={String(block.level)}
            onSelect={(value) =>
              onChange({ ...block, level: Number(value) as 2 | 3 })
            }
            options={[
              { value: "2", label: "Tiêu đề mục" },
              { value: "3", label: "Tiêu đề phụ" },
            ]}
          />
          <div>
            <label htmlFor={`${fieldId}-heading`}>Nội dung tiêu đề</label>
            <input
              id={`${fieldId}-heading`}
              aria-label="Nội dung tiêu đề mục"
              maxLength={500}
              value={block.text}
              onChange={(event) =>
                onChange({ ...block, text: event.target.value })
              }
              placeholder="Ví dụ: Vịnh Hạ Long – Viên ngọc xanh của Việt Nam"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
            />
          </div>
        </div>
      );
    case "image":
      return (
        <div className="space-y-3">
          <ImageUpload
            endpoint="/admin/posts/upload-image"
            value={block.url}
            onChange={(value) =>
              onChange({
                ...block,
                url: Array.isArray(value) ? value[0] || "" : value,
              })
            }
          />
          <label className="block space-y-1 text-xs font-medium text-slate-600">
            <span>Mô tả ảnh · bắt buộc khi đăng</span>
            <input
              maxLength={500}
              value={block.alt}
              onChange={(event) =>
                onChange({ ...block, alt: event.target.value })
              }
              placeholder="Ví dụ: Toàn cảnh vịnh Hạ Long nhìn từ trên cao"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
            />
          </label>
          <label className="block space-y-1 text-xs font-medium text-slate-600">
            <span>Chú thích dưới ảnh · tùy chọn</span>
            <input
              maxLength={1000}
              value={block.caption}
              onChange={(event) =>
                onChange({ ...block, caption: event.target.value })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
            />
          </label>
        </div>
      );
    case "experiences":
      return (
        <div className="space-y-4">
          <input
            aria-label="Tiêu đề nhóm trải nghiệm"
            value={block.title}
            maxLength={500}
            onChange={(event) =>
              onChange({ ...block, title: event.target.value })
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
          />
          {block.items.map((item, index) => (
            <div
              key={index}
              className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold text-slate-600">
                  <ArticleBlockIcon name={item.icon} className="h-4 w-4" />
                  Trải nghiệm {index + 1}
                </span>
                <div className="flex gap-3 text-xs">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      const items = [...block.items];
                      [items[index - 1], items[index]] = [
                        items[index],
                        items[index - 1],
                      ];
                      onChange({ ...block, items });
                    }}
                    className="text-blue-600 disabled:opacity-30"
                  >
                    Lên
                  </button>
                  <button
                    type="button"
                    disabled={index === block.items.length - 1}
                    onClick={() => {
                      const items = [...block.items];
                      [items[index + 1], items[index]] = [
                        items[index],
                        items[index + 1],
                      ];
                      onChange({ ...block, items });
                    }}
                    className="text-blue-600 disabled:opacity-30"
                  >
                    Xuống
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...block,
                        items: block.items.filter(
                          (_, position) => position !== index,
                        ),
                      })
                    }
                    className="text-red-600"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <div className="ui-post-block-fields-fieldRow grid grid-cols-[minmax(0,_1fr)_minmax(0,_2fr)] [align-items:start] gap-[12px] [&>*]:min-w-0 [&_label]:block [&_label]:m-[0_0_6px] [&_label]:overflow-hidden [&_label]:text-[#64748b] [&_label]:text-[14px] [&_label]:font-medium [&_label]:leading-[20px] [&_label]:text-ellipsis [&_label]:whitespace-nowrap [&_input]:h-[44px] [&_input]:min-w-0 [&_button[aria-haspopup=listbox]]:h-[44px] [&_button[aria-haspopup=listbox]]:min-w-0 admin-max-600:grid-cols-[minmax(0,_1fr)]">
                <CustomDropdown
                  label={`Biểu tượng trải nghiệm ${index + 1}`}
                  variant="compact"
                  matchTriggerWidth
                  selectedValue={item.icon}
                  onSelect={(selected) =>
                    onChange({
                      ...block,
                      items: block.items.map((value, position) =>
                        position === index
                          ? { ...value, icon: selected as typeof item.icon }
                          : value,
                      ),
                    })
                  }
                  options={ARTICLE_ICONS.map((icon) => ({
                    value: icon,
                    label: icons[icon],
                  }))}
                />
                <div>
                  <label htmlFor={`${fieldId}-experience-${index}`}>
                    Tên trải nghiệm
                  </label>
                  <input
                    id={`${fieldId}-experience-${index}`}
                    aria-label={`Tên trải nghiệm ${index + 1}`}
                    maxLength={500}
                    value={item.title}
                    placeholder="Ví dụ: Du thuyền trên vịnh"
                    onChange={(event) =>
                      onChange({
                        ...block,
                        items: block.items.map((value, position) =>
                          position === index
                            ? { ...value, title: event.target.value }
                            : value,
                        ),
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
                  />
                </div>
              </div>
              <textarea
                aria-label={`Mô tả trải nghiệm ${index + 1}`}
                maxLength={5000}
                value={item.description}
                placeholder="Mô tả trải nghiệm..."
                onChange={(event) =>
                  onChange({
                    ...block,
                    items: block.items.map((value, position) =>
                      position === index
                        ? { ...value, description: event.target.value }
                        : value,
                    ),
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 min-h-24"
              />
            </div>
          ))}
          <button
            type="button"
            disabled={block.items.length >= 30}
            onClick={() =>
              onChange({
                ...block,
                items: [
                  ...block.items,
                  { icon: "camera", title: "", description: "" },
                ],
              })
            }
            className="text-sm font-semibold text-blue-600 disabled:opacity-40"
          >
            + Thêm trải nghiệm
          </button>
        </div>
      );
    case "callout":
      return (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <CustomDropdown
              label="Kiểu ô lưu ý"
              variant="compact"
              matchTriggerWidth
              selectedValue={block.tone}
              onSelect={(value) =>
                onChange({ ...block, tone: value as typeof block.tone })
              }
              options={[
                { value: "tip", label: "Mẹo du lịch · xanh dương" },
                { value: "note", label: "Ghi chú · xám" },
                { value: "warning", label: "Lưu ý · vàng" },
              ]}
            />
            <CustomDropdown
              label="Biểu tượng lưu ý"
              variant="compact"
              matchTriggerWidth
              selectedValue={block.icon}
              onSelect={(value) =>
                onChange({ ...block, icon: value as typeof block.icon })
              }
              options={ARTICLE_ICONS.map((icon) => ({
                value: icon,
                label: icons[icon],
              }))}
            />
          </div>
          <textarea
            aria-label="Nội dung lưu ý"
            value={block.text}
            onChange={(event) =>
              onChange({ ...block, text: event.target.value })
            }
            placeholder="Ví dụ: Thời điểm lý tưởng để du lịch Hạ Long là tháng 4 đến tháng 6..."
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 min-h-28"
          />
        </div>
      );
    case "list":
      return (
        <div className="space-y-3">
          <CustomDropdown
            label="Kiểu danh sách"
            variant="compact"
            matchTriggerWidth
            selectedValue={String(block.ordered)}
            onSelect={(value) =>
              onChange({ ...block, ordered: value === "true" })
            }
            options={[
              { value: "false", label: "Dấu đầu dòng" },
              { value: "true", label: "Đánh số" },
            ]}
          />
          {block.items.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {block.ordered ? `${index + 1}.` : "•"}
              </span>
              <input
                aria-label={`Mục danh sách ${index + 1}`}
                maxLength={5000}
                value={item}
                onChange={(event) =>
                  onChange({
                    ...block,
                    items: block.items.map((value, position) =>
                      position === index ? event.target.value : value,
                    ),
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
              />
              <button
                type="button"
                aria-label={`Xóa mục ${index + 1}`}
                onClick={() =>
                  onChange({
                    ...block,
                    items: block.items.filter(
                      (_, position) => position !== index,
                    ),
                  })
                }
                className="p-2 text-red-500"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={block.items.length >= 100}
            onClick={() => onChange({ ...block, items: [...block.items, ""] })}
            className="text-sm font-semibold text-blue-600"
          >
            + Thêm mục
          </button>
        </div>
      );
    case "cta":
      return (
        <div className="space-y-3">
          <label className="block space-y-1 text-xs font-medium text-slate-600">
            <span>Chữ trên nút</span>
            <input
              value={block.label}
              maxLength={150}
              onChange={(event) =>
                onChange({ ...block, label: event.target.value })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400"
            />
          </label>
          <PostTourPicker
            value={block.tour_id}
            onChange={(tour) =>
              onChange({
                ...block,
                tour_id: tour?.tour_id,
                url: tour ? `/tours/${tour.tour_id}` : "",
              })
            }
          />
          <label className="block space-y-1 text-xs font-medium text-slate-600">
            <span>
              {block.tour_id
                ? "Đường dẫn tự điền theo tour đã chọn"
                : "Hoặc nhập liên kết đến trang khác"}
            </span>
            <input
              aria-label="Liên kết nút hành động"
              disabled={!!block.tour_id}
              value={block.url}
              onChange={(event) =>
                onChange({ ...block, url: event.target.value })
              }
              placeholder="/tours hoặc https://..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-400 disabled:bg-slate-50"
            />
          </label>
        </div>
      );
  }
}
