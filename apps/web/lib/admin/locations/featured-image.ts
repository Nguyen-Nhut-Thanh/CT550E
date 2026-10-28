import { getToken } from "@/lib/auth/session";
import { API_BASE } from "@/lib/http/config";
import { uploadAuthenticatedFile } from "@/lib/http/uploadApi";

export async function uploadFeaturedLocationImage(file: File) {
 if (!["image/png","image/jpeg","image/webp"].includes(file.type)) throw new Error("Chọn ảnh PNG, JPG hoặc WebP.");
 if (file.size > 5 * 1024 * 1024) throw new Error("Ảnh không được vượt quá 5 MB.");
 const token=getToken();
 if (!token) throw new Error("Vui lòng đăng nhập để tải ảnh.");
 const result=await uploadAuthenticatedFile(`${API_BASE}/admin/locations/upload`,token,file,"Không tải được ảnh, vui lòng thử lại.");
 if (!result?.url) throw new Error("Máy chủ chưa trả về ảnh tải lên.");
 return result.url;
}
