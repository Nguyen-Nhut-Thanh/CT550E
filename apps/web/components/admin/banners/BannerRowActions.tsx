"use client";

import { AdminRowActions } from "@/components/common/AdminRowActions";
import { Pencil, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import type { Banner } from "shared";

export function BannerRowActions({ banner, busy, onToggle, onDuplicate, onDelete }: {
 banner: Banner; busy: boolean; onToggle: (banner: Banner) => void; onDuplicate: (banner: Banner) => void; onDelete: (banner: Banner) => void;
}) {
 return <AdminRowActions label={`Thao tác với ${banner.header}`} disabled={busy} actions={[
  {label:"Chỉnh sửa banner",icon:<Pencil size={16}/>,href:`/admin/banners/${banner.banner_id}`},
  {label:"Nhân bản banner",icon:<Copy size={16}/>,onClick:()=>onDuplicate(banner)},
  {label:banner.status===1 ? "Ẩn banner" : "Hiển thị banner",icon:banner.status===1 ? <EyeOff size={16}/> : <Eye size={16}/>,onClick:()=>onToggle(banner)},
  {label:"Xóa banner",icon:<Trash2 size={16}/>,danger:true,onClick:()=>onDelete(banner)},
 ]}/>;
}
