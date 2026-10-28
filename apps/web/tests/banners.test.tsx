import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { BannerManagementTable } from "@/components/admin/banners/BannerManagementTable";
import type { Banner } from "shared";

const banner: Banner={banner_id:1,header:"Khám phá Vịnh Hạ Long",description:"Hành trình thiên nhiên",image_url:"https://example.com/banner.jpg",location_name:"Hạ Long",status:1,link_to:"/tours/1",created_at:"2026-10-25T09:24:00Z",updated_at:"2026-10-25T09:24:00Z"};
const props={loading:false,busyIds:new Set<number>(),onToggle:()=>{},onDuplicate:()=>{},onDelete:()=>{},onBulkStatus:async()=>{}};
test("banner table shows reference columns, persisted status and shared row actions",()=>{
 const html=renderToStaticMarkup(<BannerManagementTable {...props} items={[banner,{...banner,banner_id:2,header:"Banner ẩn",status:0}]}/>);
 for(const label of ["Hình ảnh","Tiêu đề","Vị trí hiển thị","Thứ tự","Trạng thái","Thời gian tạo","Thao tác"])assert.ok(html.includes(label));
 assert.equal((html.match(/role="switch"/g)||[]).length,2);
 assert.match(html,/aria-checked="true"/);
 assert.match(html,/aria-checked="false"/);
 assert.equal((html.match(/ui-admin-row-actions-trigger/g)||[]).length,2);
 assert.match(html,/Trang chủ/);
});
test("banner table paginates and handles empty results",()=>{
 const html=renderToStaticMarkup(<BannerManagementTable {...props} items={Array.from({length:12},(_,i)=>({...banner,banner_id:i+1}))}/>);
 assert.equal((html.match(/role="switch"/g)||[]).length,10);
 assert.match(html,/Trang 2/);
 const empty=renderToStaticMarkup(<BannerManagementTable {...props} items={[]}/>);
 assert.match(empty,/Không tìm thấy banner phù hợp/);
});
