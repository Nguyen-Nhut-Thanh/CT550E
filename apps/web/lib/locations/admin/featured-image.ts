import { uploadValidatedImage } from "@/lib/http/uploadApi";

export async function uploadFeaturedLocationImage(file: File): Promise<string> {
  const result = await uploadValidatedImage(
    "/admin/locations/upload",
    file,
    "Không tải được ảnh, vui lòng thử lại.",
  );
  return result.url;
}
