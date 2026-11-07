import { Phone, UsersRound } from 'lucide-react';
import { CREW_ROLES, type BookingDetail } from 'shared';

export function BookingCrewCard({ booking }: { booking: BookingDetail }) {
  if (!['paid', 'confirmed', 'completed'].includes(booking.status)) return null;
  const snapshot = booking.tour_schedules?.crew_snapshot;
  return <section className="rounded-2xl border border-[#dfeafb] bg-white p-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-base font-bold text-[#15264a]"><UsersRound size={19} className="text-blue-600" />Người phụ trách chuyến đi</h2>{snapshot && <span className="text-[11px] text-slate-400">Cập nhật {new Date(snapshot.published_at).toLocaleString('vi-VN', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>}</header>
    {!snapshot ? <p className="mt-3 text-sm leading-6 text-slate-500">Đội ngũ phụ trách đang được hoàn tất. Bạn sẽ nhận thông báo khi danh sách được xác nhận.</p> : <>
      {!booking.tour_schedules?.crew_locked_at && <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">Danh sách đang được cập nhật. Bên dưới là thông tin đã công bố gần nhất; thông báo mới sẽ được gửi sau khi xác nhận thay đổi.</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">{snapshot.members.map(member => <div key={member.user_id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">{member.full_name.split(' ').filter(Boolean).slice(-2).map(word => word[0]).join('')}</span><div className="min-w-0"><p className="font-semibold text-[#15264a]">{member.full_name}</p><p className="mt-1 text-xs text-slate-500">{member.roles.map(role => CREW_ROLES[role]).join(' kiêm ')}</p>{member.phone && <a href={`tel:${member.phone.replace(/[^\d+]/g, '')}`} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600"><Phone size={13} />{member.phone}</a>}</div></div>)}</div>
    </>}
  </section>;
}
