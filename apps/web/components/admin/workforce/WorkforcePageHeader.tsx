"use client";

import Link from 'next/link';
import { Headset, Plane, RefreshCw, UserRoundPlus } from 'lucide-react';
import type { WorkforceActor } from 'shared';
import type { WorkforceNavigation, WorkforceSection } from './WorkforceOverviewPanel';
import styles from './WorkforcePageHeader.module.css';

export function WorkforcePageHeader({ actor, loading, onNavigate, onRefresh }: {
  actor: WorkforceActor; loading: boolean; onNavigate: (section: WorkforceSection, options?: WorkforceNavigation) => void; onRefresh: () => void;
}) {
  return <header className={styles.header}>
    <img src="/images/about/our-story-ha-long-bay.png" alt="" aria-hidden="true" className={styles.landscape} />
    <div className={styles.wash} />
    <div className={styles.flight} aria-hidden="true"><svg viewBox="0 0 460 95" className="h-full w-full" fill="none"><path d="M2 62C56 4 150 118 223 55C267 17 200 0 207 39C217 100 345 81 425 24" stroke="#70b7ff" strokeWidth="1.6" strokeDasharray="4 6" /></svg><Plane size={29} className="absolute right-1 top-0 rotate-12 text-blue-400" fill="#8bc5ff" strokeWidth={1.4} /></div>
    <div className={styles.row}><div><p className={styles.kicker}>Điều hành tour</p><h1 className={styles.title}>Nhân sự & điều hành</h1><p className={styles.subtitle}>{actor.isManager ? 'Quản lý đội ngũ, ca trực page và điều hành các chuyến đi.' : `Xin chào ${actor.fullName}. Theo dõi ca làm và các chuyến được giao.`}</p></div>
      <div className={styles.actions}>{actor.isManager && <button type="button" onClick={() => onNavigate('trips')} className={styles.primary}><UserRoundPlus size={17} />Phân công nhân sự</button>}{actor.canChat && <Link href="/admin/chats" className={styles.secondary}><Headset size={17} />Vào trực page</Link>}<button type="button" disabled={loading} onClick={onRefresh} aria-label="Làm mới nhân sự" className={styles.refresh}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button></div>
    </div>
  </header>;
}
