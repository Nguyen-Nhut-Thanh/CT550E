"use client";

import { ArrowRight, BarChart3, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight, CircleAlert, Clock3, Headset, Landmark, MapPin, Mountain, Palmtree, Sparkles, UserRound, UserRoundCog, UsersRound } from 'lucide-react';
import { CREW_ROLES, WORKFORCE_REGIONS, type CrewRole, type Employee, type RegionCode, type StaffShift, type WorkforceActor, type WorkforceSchedule } from 'shared';
import { ImageWithFallback } from '@/components/common/media/ImageWithFallback';
import styles from './WorkforceOverviewPanel.module.css';

export type WorkforceSection = 'overview' | 'employees' | 'trips' | 'shifts' | 'mine';
export type WorkforceNavigation = { region?: string; scheduleId?: number };

const vietnamDate = (value: string | number) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
const vietnamTime = (value: string) => new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value));
const regionStyle = {
  north: { icon: Mountain, background: 'linear-gradient(110deg, #eef6ff, #f7fbff)', iconBackground: '#dfeeff', color: '#1481ff' },
  central: { icon: Landmark, background: 'linear-gradient(110deg, #edf9f4, #f7fcfa)', iconBackground: '#dbf6eb', color: '#0ab47b' },
  south: { icon: Palmtree, background: 'linear-gradient(110deg, #fff6ea, #fffcf8)', iconBackground: '#fff0da', color: '#ef8a00' },
};

function EmptyShiftIllustration() {
  return <div aria-hidden="true" className="relative h-14 w-28">
    <div className="absolute inset-x-1 bottom-1 h-4 rounded-full bg-blue-50" />
    <CalendarDays size={48} strokeWidth={1.2} className="absolute bottom-1 left-8 rotate-6 text-blue-200" />
    <Headset size={21} strokeWidth={1.7} className="absolute bottom-3 left-12 text-blue-400" />
    <Sparkles size={11} className="absolute right-1 top-4 text-amber-300" />
  </div>;
}

export function WorkforceOverviewPanel({ actor, employees, shifts, schedules, loading, onNavigate }: {
  actor: WorkforceActor; employees: Employee[]; shifts: StaffShift[]; schedules: WorkforceSchedule[];
  loading: boolean;
  onNavigate: (section: WorkforceSection, options?: WorkforceNavigation) => void;
}) {
  if (loading) return <div aria-label="Đang tải tổng quan nhân sự" aria-busy="true" className="animate-pulse space-y-3"><div className="h-[82px] rounded-[14px] bg-white" /><div className="h-80 rounded-[14px] bg-white" /><div className="h-36 rounded-[14px] bg-white" /></div>;

  const now = Date.now();
  const activeEmployees = employees.filter(employee => employee.status === 'active' && employee.account_status === 1);
  const upcoming = schedules.filter(schedule => Date.parse(schedule.start_date) > now).sort((a, b) => Date.parse(a.start_date) - Date.parse(b.start_date));
  const attention = upcoming.filter(schedule => !schedule.crew_ready);
  const readyCount = upcoming.filter(schedule => schedule.crew_ready).length;
  const progress = upcoming.length ? Math.round(readyCount / upcoming.length * 100) : 0;
  const pendingMine = upcoming.filter(schedule => schedule.crew.some(member => member.user_id === actor.userId && member.status === 'pending'));
  const today = vietnamDate(now);
  const roster = shifts.filter(shift => shift.status === 'scheduled' && Date.parse(shift.ends_at) > now
    && (actor.isManager ? shift.duty_type === 'page' : true) && (Date.parse(shift.starts_at) <= now || vietnamDate(shift.starts_at) === today))
    .sort((a, b) => Number(Date.parse(b.starts_at) <= now) - Number(Date.parse(a.starts_at) <= now) || Date.parse(a.starts_at) - Date.parse(b.starts_at));
  const preparation = actor.isManager ? attention : upcoming;
  const metrics = actor.isManager ? [
    { label: 'Nhân viên hoạt động', value: activeEmployees.length, icon: UsersRound, color: '#0cb47a', background: '#e5f9f0', target: 'employees' as const },
    { label: 'Chuyến sắp khởi hành', value: upcoming.length, icon: CalendarDays, color: '#9950ff', background: '#f3ecff', target: 'trips' as const },
    { label: 'Cần hoàn thiện nhân sự', value: attention.length, icon: UserRoundCog, color: '#eb8500', background: '#fff3df', target: 'trips' as const },
  ] : [
    { label: 'Chuyến sắp tới của tôi', value: upcoming.length, icon: BriefcaseBusiness, color: '#0cb47a', background: '#e5f9f0', target: 'mine' as const },
    { label: 'Chờ tôi nhận chuyến', value: pendingMine.length, icon: UserRoundCog, color: '#9950ff', background: '#f3ecff', target: 'mine' as const },
    { label: 'Lịch làm việc hôm nay', value: roster.length, icon: CalendarDays, color: '#eb8500', background: '#fff3df', target: 'shifts' as const },
  ];
  const regions = Object.entries(WORKFORCE_REGIONS).filter(([code]) => actor.isAdmin || actor.regions.includes(code as RegionCode));

  return <div className={styles.overview}>
    <div className={styles.stats}>{metrics.map((metric, index) => <button key={metric.label} type="button" onClick={() => onNavigate(metric.target)} className={styles.stat}>
      <span className={styles.statIcon} style={{ color: metric.color, background: metric.background }}><metric.icon size={26} strokeWidth={2.2} /></span>
      <div className={styles.statText}><p className={styles.statValue}>{String(metric.value).padStart(2, '0')}</p><p className={styles.statLabel} style={index === 2 ? { color: metric.color } : undefined}>{metric.label}</p></div>
      {index === 2 && <span className={styles.statArrow}><ChevronRight size={17} /></span>}
    </button>)}</div>

    <div className={styles.middle}>
      <section className={styles.panel}>
        <div className={styles.panelHeader}><div className={styles.heading}><BriefcaseBusiness size={25} className={styles.headingIcon} /><div><h2>{actor.isManager ? 'Chuyến cần phân công' : 'Chuyến sắp tới của tôi'}</h2><p>{actor.isManager ? 'Các chuyến sắp khởi hành chưa đủ nhân sự điều hành.' : 'Theo dõi lịch khởi hành và các phân công của bạn.'}</p></div></div><button type="button" onClick={() => onNavigate(actor.isManager ? 'trips' : 'mine')} className={styles.outlineButton}>Xem tất cả <ArrowRight size={14} /></button></div>
        {preparation.length ? <div className={styles.tripList}>{preparation.slice(0, 3).map(schedule => {
          const roles = (Object.keys(CREW_ROLES) as CrewRole[]).filter(role => role !== 'deputy_leader' || schedule.crew.some(member => member.roles.includes(role)));
          const assigned = schedule.crew.length;
          const status = schedule.crew_ready ? 'Đủ nhân sự' : !assigned || assigned < schedule.crew_required_count ? 'Thiếu nhân sự' : 'Chờ hoàn thiện';
          return <article key={schedule.tour_schedule_id} className={styles.trip}>
            <ImageWithFallback src={schedule.cover_image_url ?? undefined} alt={schedule.tours.name} className={styles.tripImage} loading="lazy" />
            <div className={styles.tripDetails}><h3 className={styles.tripName} title={schedule.tours.name}>{schedule.tours.name}</h3><div className={styles.tripMeta}><span><CalendarDays size={13} />{vietnamDate(schedule.start_date)}</span><span><MapPin size={13} />{schedule.departure_location.name}</span><span className={styles.status} style={schedule.crew_ready ? { color: '#0b9b69', background: '#e9f9f1' } : undefined} title={schedule.crew_issues.join(' ')}>{schedule.crew_ready ? <CheckCircle2 size={12} /> : <CircleAlert size={12} />}{status}</span></div></div>
            <div className={styles.roleList}>{roles.map(role => {
              const members = schedule.crew.filter(member => member.roles.includes(role) && member.status !== 'declined');
              const Icon = role === 'guide' ? UserRound : UsersRound;
              return <div key={role} className={styles.role} title={`${CREW_ROLES[role]}: ${members.length} người được phân công. Chuyến cần tối thiểu ${schedule.crew_required_count} người, có thể kiêm nhiệm.`}><Icon size={20} /><div><p className={styles.roleLabel}>{role === 'guide' ? 'HDV' : CREW_ROLES[role]}</p><p className={styles.roleValue}>{members.length} người</p></div></div>;
            })}</div>
            <button type="button" aria-label={`Xem ${actor.isManager ? 'điều hành' : 'phân công'} chuyến ${schedule.code || schedule.tour_schedule_id}`} onClick={() => onNavigate(actor.isManager ? 'trips' : 'mine', { scheduleId: schedule.tour_schedule_id })} className={styles.assignButton}>{actor.isManager ? 'Phân công' : 'Chi tiết'}<ArrowRight size={14} /></button>
          </article>;
        })}</div> : <div className={styles.emptyTrips}><CheckCircle2 size={35} className="text-emerald-400" /><p>{actor.isManager ? (upcoming.length ? 'Các chuyến sắp khởi hành đã đủ nhân sự xác nhận.' : 'Chưa có chuyến sắp khởi hành trong phạm vi này.') : 'Bạn chưa có chuyến sắp khởi hành.'}</p><button type="button" onClick={() => onNavigate(actor.isManager ? 'trips' : 'mine')} className={styles.outlineButton}>Xem danh sách chuyến <ArrowRight size={14} /></button></div>}
      </section>

      <div className={styles.side}>
        <section className={styles.panel}>
          <div className={styles.panelHeader}><div className={styles.heading}><Headset size={25} className="mt-0.5 shrink-0 text-emerald-500" /><div><h2>{actor.isManager ? 'Ca trực hôm nay' : 'Lịch làm việc hôm nay'}</h2><p>{actor.isManager ? 'Lịch trực page và hỗ trợ khách hàng hôm nay.' : 'Ca làm và lịch nghỉ của bạn trong hôm nay.'}</p></div></div>{roster.length > 0 && <button type="button" onClick={() => onNavigate('shifts')} aria-label="Xem ca trực và lịch nghỉ" className="text-blue-600"><ArrowRight size={17} /></button>}</div>
          {roster.length ? <div className={styles.shiftList}>{roster.slice(0, 2).map(shift => {
            const current = Date.parse(shift.starts_at) <= now;
            return <button key={shift.shift_id} type="button" onClick={() => onNavigate('shifts')} className={styles.shift}><div className={styles.shiftTop}><p className={styles.shiftName}>{shift.user.full_name}</p><span className={`${styles.shiftBadge} ${current ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-500'}`}>{current ? (shift.duty_type === 'leave' ? 'Đang nghỉ' : 'Đang trực') : 'Sắp tới'}</span></div><p className={styles.shiftTime}><Clock3 size={12} className="mr-1 inline" />{vietnamTime(shift.starts_at)} – {vietnamTime(shift.ends_at)} · {shift.region_code ? WORKFORCE_REGIONS[shift.region_code] : 'Toàn quốc'}</p></button>;
          })}<button type="button" onClick={() => onNavigate('shifts')} className="mb-2 mt-2 inline-flex items-center gap-2 text-xs font-[650] text-blue-600">{actor.isManager ? 'Quản lý ca trực' : 'Xem lịch làm việc'}<ArrowRight size={13} /></button></div> : <div className={styles.emptyShift}><EmptyShiftIllustration /><p>{actor.isManager ? 'Chưa có ca trực đang diễn ra hoặc sắp tới trong hôm nay.' : 'Bạn chưa có ca làm hoặc lịch nghỉ trong hôm nay.'}</p><button type="button" onClick={() => onNavigate('shifts')} className={styles.primaryButton}>{actor.isManager ? 'Thiết lập ca trực' : 'Xem lịch làm việc'}</button></div>}
        </section>
        <section className={`${styles.panel} ${styles.progressPanel}`}><div className={styles.progressHeading}><h2><BarChart3 size={23} />{actor.isManager ? 'Tiến độ phân công' : 'Nhân sự chuyến sắp tới'}</h2><span>{readyCount} / {upcoming.length} chuyến</span></div><div className={styles.progressLine}><div className={styles.progressTrack} role="progressbar" aria-label="Chuyến đã đủ nhân sự xác nhận" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><div className={styles.progressFill} style={{ width: `${progress}%` }} /></div><span className={styles.progressPercent}>{progress}%</span></div><p className={styles.progressNote}>{upcoming.length ? `${readyCount}/${upcoming.length} chuyến sắp khởi hành đã đủ nhân sự xác nhận.` : 'Chưa có chuyến sắp khởi hành trong phạm vi này.'}</p></section>
      </div>
    </div>

    {actor.isManager && <section className={`${styles.panel} ${styles.regionsPanel}`}><div className={styles.heading}><UsersRound size={25} className={styles.headingIcon} /><div><h2>Nhân sự theo miền</h2><p>Tổng quan nhân sự đang hoạt động theo khu vực.</p></div></div><div className={styles.regionGrid}>{regions.map(([code, label]) => {
      const regionCode = code as RegionCode;
      const people = activeEmployees.filter(employee => employee.regions.includes(regionCode));
      const guides = people.filter(employee => employee.roles.includes('guide')).length;
      const operators = people.filter(employee => employee.roles.some(role => ['region_manager', 'tour_leader', 'deputy_leader'].includes(role))).length;
      const appearance = regionStyle[regionCode];
      return <button key={code} type="button" aria-label={`Xem điều hành ${label}`} onClick={() => onNavigate('trips', { region: code })} className={styles.region} style={{ background: appearance.background }}><span className={styles.regionIcon} style={{ background: appearance.iconBackground, color: appearance.color }}><appearance.icon size={27} strokeWidth={2.1} /></span><div><h3 className={styles.regionName}>{label}</h3><p className={styles.regionNumber}>{people.length}<span className={styles.regionPeople}>nhân viên</span></p></div><div className={styles.regionRoles}><span>{guides} HDV</span><span>{operators} Điều hành</span></div><span className={styles.regionArrow}><ChevronRight size={15} /></span></button>;
    })}</div></section>}
  </div>;
}
