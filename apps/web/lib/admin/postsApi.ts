import type { PostCategory, PostCategoryDraft, PostItem } from "shared";
import { requestAdminJson } from "./requestAdminJson";

export function getAdminPosts() {
  return requestAdminJson<PostItem[]>(
    "/admin/posts",
    { method: "GET" },
    "Không thể tải danh sách bài viết.",
  );
}

export function getAdminPostCategories() {
  return requestAdminJson<PostCategory[]>(
    "/admin/post-categories",
    { method: "GET" },
    "Không thể tải danh mục bài viết.",
  );
}

export function createAdminPostCategory(body: PostCategoryDraft) {
  return requestAdminJson(
    "/admin/post-categories",
    {
      method: "POST",
      body: JSON.stringify(body),
    },
    "Không thể thêm danh mục.",
  );
}

export function deleteAdminPost(postId: number) {
  return requestAdminJson(
    `/admin/posts/${postId}`,
    { method: "DELETE" },
    "Không thể xóa bài viết.",
  );
}

export function saveAdminPost(
  path: string,
  method: "POST" | "PATCH",
  body: Record<string, unknown>,
) {
  return requestAdminJson(
    path,
    {
      method,
      body: JSON.stringify(body),
    },
    "Không thể lưu bài viết.",
  );
}
