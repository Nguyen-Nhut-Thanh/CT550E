"use client";

import { AdminRowActions } from "@/components/admin/common/AdminRowActions";
import { AdminTable } from "@/components/admin/common/AdminTable";
import { Calendar, Edit, ExternalLink, FileText, Tag, Trash2 } from "lucide-react";
import type { PostItem } from "shared";

export interface PostManagementTableProps {
  posts: PostItem[];
  loading: boolean;
  onDelete: (postId: number) => void;
}

export function PostManagementTable({
  posts,
  loading,
  onDelete,
}: PostManagementTableProps) {
  const columns = [
    {
      header: "STT",
      render: (_: PostItem, index: number) => (
        <span className="font-medium text-slate-400">{String(index + 1).padStart(2, "0")}</span>
      ),
    },
    {
      header: "Bài viết",
      render: (post: PostItem) => (
        <div className="flex items-center gap-4">
          {post.thumbnail ? (
            <img
              src={post.thumbnail}
              className="h-10 w-16 rounded-lg object-cover shadow-xs"
              alt=""
            />
          ) : (
            <div className="flex h-10 w-16 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              <FileText size={16} />
            </div>
          )}
          <div className="space-y-0.5 min-w-0">
            <p className="line-clamp-1 font-bold text-slate-900">{post.title}</p>
            <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-tight text-slate-400">
              <span className="flex items-center gap-1">
                <Tag size={12} /> {post.category?.name || "Chưa phân loại"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {post.created_at ? new Date(post.created_at).toLocaleDateString("vi-VN") : "---"}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Trạng thái",
      align: "center" as const,
      render: (post: PostItem) => (
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
            post.status === 1
              ? "border-green-100 bg-green-50 text-green-600"
              : "border-slate-100 bg-slate-50 text-slate-400"
          }`}
        >
          {post.status === 1 ? "Công khai" : "Nháp"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      align: "right" as const,
      render: (post: PostItem) => (
        <div className="flex justify-end">
          <AdminRowActions
            label={`Thao tác với ${post.title}`}
            actions={[
              ...(post.status === 1
                ? [
                    {
                      label: "Xem bài viết",
                      access: "view" as const,
                      icon: <ExternalLink size={16} />,
                      onClick: () => {
                        window.open(`/blog/${post.slug}`, "_blank", "noopener,noreferrer");
                      },
                    },
                  ]
                : []),
              {
                label: "Chỉnh sửa bài viết",
                icon: <Edit size={16} />,
                href: `/admin/marketing/posts/${post.post_id}`,
              },
              {
                label: "Xóa bài viết",
                icon: <Trash2 size={16} />,
                danger: true,
                onClick: () => onDelete(post.post_id),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <AdminTable
      items={posts}
      columns={columns}
      loading={loading}
      rowKey={(post) => post.post_id}
      pageSize={10}
      itemLabel="bài viết"
      emptyMessage="Không tìm thấy bài viết nào phù hợp."
    />
  );
}

