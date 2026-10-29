"use client";
import { CalendarDays, ArrowRight, MapPin, BusFront, Utensils, BedDouble, Star, Flame, ImageIcon, Send } from "lucide-react";
import FavoriteButton from "@/components/common/tours/FavoriteButton";
export type TourRecommendationData = {
 id: number;
 title: string;
 url: string;
 image_url?: string;
 price?: number;
 duration?: string;
 schedule_id?: number;
 departure_date?: string;
 original_price?: number;
 summary?: string;
 destination?: string;
 transport?: string;
 meals?: string;
 hotel?: string;
 rating?: number;
 rating_count?: number;
 category?: string;
};
export type TourRecommendationCardProps = {
 tour: TourRecommendationData;
 favorite?: boolean;
 favoritePending?: boolean;
 onToggleFavorite?: () => void;
 error?: string;
};

/** Hiển thị khung giới thiệu tour dùng chung cho chat hỗ trợ và chatbot. */
export function TourRecommendationCard({ tour: context, favorite = false, favoritePending = false, onToggleFavorite, error }: TourRecommendationCardProps) {
 const href = context.schedule_id ? `${context.url}?scheduleId=${context.schedule_id}` : context.url;
 const discount = context.original_price && context.price !== undefined && context.original_price > context.price ? Math.round((1 - context.price / context.original_price) * 100) : 0;
 const services = [
  {icon: BusFront, label: "Di chuyển", value: context.transport || "Theo lịch trình"},
  {icon: Utensils, label: "Ăn uống", value: context.meals || "Xem chi tiết"},
  {icon: BedDouble, label: "Khách sạn", value: context.hotel || "Xem chi tiết"},
 ];
 return <article style={{containerType:"inline-size"}} className="w-full min-w-0 max-w-[600px] text-[#17264f]">
 <div className="relative flex overflow-hidden border border-blue-100 bg-white" style={{borderRadius:"2.2cqw",boxShadow:"0 1.2cqw 4cqw -2cqw #bad7ff"}}>
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Xem tour ${context.title}`} className="relative shrink-0 overflow-hidden bg-blue-50" style={{width:"39%",borderRadius:"2.1cqw"}}>
   {context.image_url ? <img src={context.image_url} alt={context.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover"/> : <ImageIcon className="absolute left-1/3 top-1/3 h-1/3 w-1/3 text-blue-200"/>}
   {discount > 0 && <span className="absolute flex items-center bg-[#ff5575] font-bold text-white" style={{left:"1.7cqw",top:"1.8cqw",gap:".4cqw",borderRadius:"4cqw",padding:".7cqw 1.1cqw",fontSize:"1.566667cqw"}}><Flame style={{width:"1.8cqw",height:"1.8cqw"}} fill="currentColor"/>HOT</span>}
   <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-slate-950/60 to-transparent" style={{padding:"4cqw 1.5cqw 1.5cqw",gap:".6cqw"}}>
    {context.destination && <span className="flex items-center font-semibold text-white" style={{gap:".5cqw",fontSize:"1.566667cqw"}}><MapPin style={{width:"1.8cqw",height:"1.8cqw"}}/>{context.destination}</span>}
    {!!context.rating_count && context.rating !== undefined && <span className="ml-auto flex shrink-0 items-center rounded-full bg-white" style={{gap:".4cqw",padding:".7cqw 1cqw",fontSize:"1.416667cqw"}}><Star className="fill-amber-400 text-amber-400" style={{width:"1.8cqw",height:"1.8cqw"}}/><strong>{context.rating.toFixed(1)}</strong><span className="text-[#7186ac]">({context.rating_count >= 1000 ? `${(context.rating_count / 1000).toFixed(1)}k` : context.rating_count})</span></span>}
   </div>
  </a>
  <div className="relative flex min-w-0 flex-1 flex-col" style={{padding:"1.7cqw 2cqw 2.4cqw 2.8cqw"}}>
   <div className="flex items-center justify-between" style={{marginBottom:"1.2cqw"}}>
    <span className="inline-flex items-center rounded-full bg-[#deebff] font-bold text-[#1475ff]" style={{gap:".6cqw",padding:".5cqw 1.1cqw",fontSize:"1.566667cqw"}}><MapPin style={{width:"1.7cqw",height:"1.7cqw"}}/>{context.category || "Khám phá tour"}</span>
    {onToggleFavorite && <FavoriteButton active={favorite} loading={favoritePending} onClick={onToggleFavorite} className="flex h-[4.2cqw] w-[4.2cqw] items-center justify-center rounded-full bg-[#f0f1ff] text-[#2d4377] [&>svg]:h-[2.1cqw] [&>svg]:w-[2.1cqw]" iconClassName="" label={favorite ? "Bỏ tour khỏi yêu thích" : "Lưu tour yêu thích"} />}
   </div>
   <a href={href} target="_blank" rel="noopener noreferrer" className="font-extrabold tracking-tight hover:text-blue-600" style={{fontSize:"3.316667cqw",lineHeight:1.22,paddingRight:".4cqw"}}>{context.title}</a>
   <div className="flex flex-wrap items-center text-[#7890b6]" style={{gap:"1cqw",marginTop:"2.1cqw",fontSize:"2.016667cqw",lineHeight:1.5}}>
    {context.duration && <span className="flex items-center" style={{gap:".7cqw"}}><CalendarDays className="text-[#5279b6]" style={{width:"2.5cqw",height:"2.5cqw"}}/>{context.duration}</span>}
    {context.departure_date && <span className="flex items-center border-l border-blue-200" style={{gap:".7cqw",paddingLeft:"1.3cqw"}}><MapPin className="text-[#5279b6]" style={{width:"2.5cqw",height:"2.5cqw"}}/>Khởi hành: {new Date(context.departure_date).toLocaleDateString("vi-VN",{timeZone:"Asia/Ho_Chi_Minh"})}</span>}
   </div>
   <div className="grid grid-cols-3 bg-[#f1f8ff]" style={{marginTop:"2.3cqw",borderRadius:"1.7cqw",padding:"1.6cqw 1cqw"}}>
    {services.map(({icon:Icon,label,value},index) => <div key={label} className={`flex min-w-0 text-[#4167a5] ${index ? "border-l border-[#b9d1f4]" : ""}`} style={{gap:"1cqw",padding:"0 1.2cqw"}}><Icon className="shrink-0" style={{width:"2.8cqw",height:"2.8cqw"}}/><div className="min-w-0" style={{fontSize:"1.466667cqw",lineHeight:1.45}}><p className="font-semibold">{label}</p><p className="line-clamp-2" title={value} style={{marginTop:".3cqw"}}>{value}</p></div></div>)}
   </div>
   <div className="relative z-10 grid min-w-0" style={{gridTemplateColumns:"minmax(0, 1fr) auto",columnGap:"1.6cqw",rowGap:"1cqw",marginTop:"2cqw"}}>
    <div className="flex min-w-0 flex-wrap items-center" style={{gap:".7cqw"}}>
     {context.price !== undefined && <p className="font-extrabold tracking-tight text-[#ff375f]" style={{fontSize:"3.416667cqw",lineHeight:1.2}}>{context.price.toLocaleString("vi-VN")} đ</p>}
     {discount > 0 && <><span className="text-[#a7b9d7] line-through" style={{fontSize:"1.866667cqw"}}>{context.original_price!.toLocaleString("vi-VN")} đ</span><span className="rounded-full bg-[#ff6685] font-bold text-white" style={{padding:".4cqw 1cqw",fontSize:"1.566667cqw"}}>-{discount}%</span></>}
    </div>
    <p className="col-start-1 row-start-2 line-clamp-3 min-w-0 text-[#6a8fca]" style={{fontSize:"1.516667cqw",lineHeight:1.5}}>{context.summary || "Xem lịch trình, dịch vụ và thông tin chi tiết của tour."}</p>
    <a href={href} target="_blank" rel="noopener noreferrer" className="col-start-2 row-start-1 row-span-2 inline-flex items-center self-center whitespace-nowrap rounded-full bg-[#1475ff] font-bold text-white hover:bg-blue-600" style={{gap:".8cqw",padding:"1.4cqw 2cqw",fontSize:"1.716667cqw"}}>Xem chi tiết <ArrowRight style={{width:"2cqw",height:"2cqw"}}/></a>
   </div>
   {error && <p role="alert" className="text-rose-500" style={{marginTop:".666667cqw",fontSize:"2cqw"}}>{error}</p>}
  </div>
  <svg aria-hidden="true" viewBox="0 0 600 55" preserveAspectRatio="none" className="pointer-events-none absolute bottom-0 right-0 text-blue-100" style={{width:"61%",height:"5.5cqw"}}><path d="M0 36 Q35 12 70 32 T140 36" fill="none" stroke="#bad8ff" strokeWidth="1.5" strokeDasharray="5 7"/><path d="M365 55 L395 28 418 48 449 16 479 49 500 32 530 55Z" fill="#e8f3ff"/><path d="M430 55 L468 37 478 18 485 35 497 32 503 8 512 32 526 35 535 20 543 40 556 55Z" fill="#d6e9ff"/><path d="M345 31 Q450 -5 550 10" fill="none" stroke="#dfedff"/><path d="M397 18v14m51-25v14m51-13v14" stroke="#d6e9ff"/><rect x="393" y="31" width="8" height="10" rx="2" fill="#d6e9ff"/><rect x="444" y="20" width="8" height="10" rx="2" fill="#d6e9ff"/></svg>
  <Send aria-hidden="true" className="pointer-events-none absolute fill-blue-400 text-blue-400" style={{left:"51%",bottom:"1.6cqw",width:"2.4cqw",height:"2.4cqw",transform:"rotate(8deg)"}}/>
 </div>
 </article>;
}
