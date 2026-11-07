import type { RegionCode, WorkforceActor } from './models';

export const ADMIN_CONTENT_DENIED = 'Bạn không có quyền quản lý nội dung này.';

/** Managers share the admin pages, while content changes remain admin-only. */
export function canAccessAdminContent(actor: Pick<WorkforceActor, 'isAdmin' | 'isManager'> | null | undefined, method: string) {
  return Boolean(actor?.isAdmin || (actor?.isManager && ['GET', 'HEAD'].includes(method.toUpperCase())));
}

export function canManageWorkforceRegion(actor: Pick<WorkforceActor, 'isAdmin' | 'isManager' | 'regions'>, region: string | null) {
  return actor.isAdmin || Boolean(actor.isManager && region && actor.regions.includes(region as RegionCode));
}
