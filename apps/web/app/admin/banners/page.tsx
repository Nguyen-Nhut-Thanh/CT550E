"use client";

import { AdminPageHeader } from "@/components/admin/common/AdminPageHeader";
import CustomDropdown from "@/components/common/forms/CustomDropdown";
import { AdminSearchInput } from "@/components/admin/common/AdminSearchInput";
import { BannerManagementTable } from "@/components/admin/banners/BannerManagementTable";
import { deleteAdminBanner, fetchAdminBanners, saveAdminBanner, updateAdminBannerStatus } from "@/lib/admin/banners/api";
import { useToast } from "@/lib/notifications/useToast";
import { confirmAction } from "@/lib/utils/confirm";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Banner } from "shared";

export default function AdminBannersPage() {
 const router=useRouter();
 const {success,error:showError}=useToast();
 const [loading,setLoading]=useState(true);
 const [items,setItems]=useState<Banner[]>([]);
 const [search,setSearch]=useState("");
 const [status,setStatus]=useState("ALL");
 const [busyIds,setBusyIds]=useState<Set<number>>(new Set());
 const pending=useRef(new Set<number>());
 const loadData=useCallback(async()=>{
  setLoading(true);
  try {setItems(await fetchAdminBanners());} catch {showError("Không tải được danh sách banner");} finally {setLoading(false);}
 },[showError]);
 useEffect(()=>{void loadData();},[loadData]);
 const run=async(item:Banner,task:()=>Promise<void>)=>{
  if(pending.current.has(item.banner_id))return;
  pending.current.add(item.banner_id);setBusyIds(new Set(pending.current));
  try{await task();}catch(e){showError(e instanceof Error?e.message:"Không thực hiện được thao tác");}finally{pending.current.delete(item.banner_id);setBusyIds(new Set(pending.current));}
 };
 const toggle=(item:Banner)=>void run(item,async()=>{
  const next=item.status===1?0:1;
  await updateAdminBannerStatus(item.banner_id,next);
  setItems(current=>current.map(row=>row.banner_id===item.banner_id?{...row,status:next}:row));
  success(next===1?"Đã hiển thị banner":"Đã ẩn banner");
 });
 const duplicate=(item:Banner)=>void run(item,async()=>{
  const response=await saveAdminBanner({location_name:item.location_name,header:`${item.header.slice(0,240)} (bản sao)`,description:item.description,image_url:item.image_url,link_to:item.link_to||"",status:0});
  const created=await response.json() as Banner;
  setItems(current=>[...current,created].sort((a,b)=>a.banner_id-b.banner_id));
  success("Đã nhân bản banner ở trạng thái ẩn");
 });
 const remove=(item:Banner)=>{
  if(!confirmAction(`Xóa banner “${item.header}”?`))return;
  void run(item,async()=>{await deleteAdminBanner(item.banner_id);setItems(current=>current.filter(row=>row.banner_id!==item.banner_id));success("Đã xóa banner");});
 };
 const bulkStatus=async(ids:number[],next:number)=>{
  const targets=items.filter(item=>ids.includes(item.banner_id)&&item.status!==next);
  await Promise.all(targets.map(item=>run(item,async()=>{await updateAdminBannerStatus(item.banner_id,next);setItems(current=>current.map(row=>row.banner_id===item.banner_id?{...row,status:next}:row));})));
 };
 const filtered=useMemo(()=>items.filter(item=>(status==="ALL"||String(item.status)===status)&&`${item.header} ${item.location_name} ${item.description}`.toLocaleLowerCase("vi").includes(search.trim().toLocaleLowerCase("vi"))),[items,status,search]);
 return <div className="space-y-4">
  <AdminPageHeader title="Quản lý Banner" description="Quản lý hình ảnh và nội dung quảng bá trên website." primaryAction={{label:"Thêm banner mới",onClick:()=>router.push("/admin/banners/new")}}/>
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><AdminSearchInput value={search} onChange={setSearch} placeholder="Tìm tiêu đề, mô tả hoặc địa điểm…"/></div><CustomDropdown variant="compact" matchTriggerWidth selectedValue={status} onSelect={setStatus} options={[{value:"ALL",label:"Tất cả trạng thái"},{value:"1",label:"Đang hiển thị"},{value:"0",label:"Đang ẩn"}]} className="w-full sm:w-[210px]"/></div>
  <BannerManagementTable items={filtered} loading={loading} busyIds={busyIds} onToggle={toggle} onDuplicate={duplicate} onDelete={remove} onBulkStatus={bulkStatus}/>
 </div>;
}
