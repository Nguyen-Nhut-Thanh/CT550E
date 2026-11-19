import { Mail, Phone, UsersRound } from "lucide-react";
import { CREW_ROLES, type BookingDetail } from "shared";

export function BookingCrewCard({ booking }: { booking: BookingDetail }) {
  if (!["paid", "completed"].includes(booking.status)) return null;
  const snapshot = booking.tour_schedules?.crew_snapshot;
  return (
    <section className="rounded-2xl border border-[#dfeafb] bg-white p-5 shadow-[0_3px_18px_#c9e9fa08]">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-[#15264a]">
          <UsersRound size={19} className="text-blue-600" />
          Người phụ trách chuyến đi
        </h2>
        {snapshot && (
          <span className="text-[11px] text-slate-400">
            Cập nhật{" "}
            {new Date(snapshot.published_at).toLocaleString("vi-VN", {
              timeZone: "Asia/Bangkok",
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </header>
      {!snapshot ? (
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Đội ngũ phụ trách đang được hoàn tất. Bạn sẽ nhận thông báo khi danh
          sách được xác nhận.
        </p>
      ) : (
        <>
          {!booking.tour_schedules?.crew_locked_at && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-700">
              Danh sách đang được cập nhật. Bên dưới là thông tin đã công bố gần
              nhất; thông báo mới sẽ được gửi sau khi xác nhận thay đổi.
            </p>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {snapshot.members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-slate-50 hover:border-blue-100"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-50 text-xs font-bold text-blue-600 shadow-2xs">
                  {member.full_name
                    .split(" ")
                    .filter(Boolean)
                    .slice(-2)
                    .map((word) => word[0])
                    .join("")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#15264a] text-sm">
                    {member.full_name}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {member.roles
                      .map((role) => CREW_ROLES[role])
                      .join(" kiêm ")}
                  </p>
                  <div className="mt-2.5 flex flex-col gap-1.5 text-xs">
                    {member.phone ? (
                      <a
                        href={`tel:${member.phone.replace(/[^\d+]/g, "")}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                        title="Gọi điện"
                      >
                        <Phone size={13} className="shrink-0 text-blue-500" />
                        <span>{member.phone}</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Phone size={13} className="shrink-0 text-slate-300" />
                        <span>Chưa cập nhật SĐT</span>
                      </span>
                    )}

                    {member.email ? (
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 hover:underline truncate"
                        title="Gửi email"
                      >
                        <Mail size={13} className="shrink-0 text-blue-500" />
                        <span className="truncate">{member.email}</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Mail size={13} className="shrink-0 text-slate-300" />
                        <span>Chưa cập nhật email</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
