import 'reflect-metadata';
import assert from 'node:assert/strict';
import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ADMIN_CONTENT_DENIED, canManageWorkforceRegion, type WorkforceActor } from 'shared';
import { JwtAuthGuard } from '../apps/api/src/modules/auth/jwt.guard';
import { AdminAuthGuard } from '../apps/api/src/modules/auth/admin.guard';
import type { WorkforceAccessService } from '../apps/api/src/modules/workforce/workforce-access.service';

// Exercise the actual guard after JWT verification. No DB or external messages.
const original = JwtAuthGuard.prototype.canActivate;
let authenticated = true;
let locked = false;
let lookups = 0;
let actor: WorkforceActor;
JwtAuthGuard.prototype.canActivate = async () => authenticated;
const access = { async actor(userId: number, accountId: number) {
  lookups++;
  assert.equal(userId, 7); assert.equal(accountId, 9);
  if (locked) throw new UnauthorizedException();
  return actor;
} } as unknown as WorkforceAccessService;
const guard = new AdminAuthGuard(access);
let checks = 0;
const context = (method: string) => {
  const request = { method, user: { sub: 7, accountId: 9 } };
  return { switchToHttp: () => ({ getRequest: () => request }) } as ExecutionContext;
};
const northManager: WorkforceActor = { userId: 7, fullName: 'Quản lý Bắc', roles: ['region_manager'], regions: ['north'], isAdmin: false, isManager: true, canChat: true };

async function main() {
  try {
    for (const role of ['admin', 'manager', 'guide', 'page_staff'] as const) {
      actor = { ...northManager, isAdmin: role === 'admin', isManager: ['admin', 'manager'].includes(role), roles: role === 'manager' ? ['region_manager'] : [role] };
      for (const method of ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS', '']) {
        if (actor.isAdmin || (role === 'manager' && ['GET', 'HEAD'].includes(method))) {
          assert.equal(await guard.canActivate(context(method)), true);
        } else {
          await assert.rejects(() => guard.canActivate(context(method)), error => error instanceof ForbiddenException && error.message === ADMIN_CONTENT_DENIED);
        }
        checks++;
      }
    }
    actor = northManager;
    assert.equal(canManageWorkforceRegion(actor, 'north'), true); checks++;
    assert.equal(canManageWorkforceRegion(actor, 'south'), false); checks++;
    assert.equal(canManageWorkforceRegion(actor, null), false); checks++;
    assert.equal(canManageWorkforceRegion({ ...actor, regions: ['north', 'south'] }, 'south'), true); checks++;
    assert.equal(canManageWorkforceRegion({ ...actor, isAdmin: true }, 'south'), true); checks++;
    assert.equal(canManageWorkforceRegion({ ...actor, isManager: false }, 'north'), false); checks++;
    // Removing a role/account takes effect on the next request, without relying
    // on the old role stored in a JWT or on the visibility of a menu button.
    assert.equal(await guard.canActivate(context('GET')), true); checks++;
    actor = { ...actor, isManager: false, roles: ['guide'] };
    await assert.rejects(() => guard.canActivate(context('GET')), ForbiddenException); checks++;
    locked = true;
    await assert.rejects(() => guard.canActivate(context('GET')), UnauthorizedException); checks++;
    authenticated = false;
    const before = lookups;
    assert.equal(await guard.canActivate(context('GET')), false);
    assert.equal(lookups, before); checks++;
    console.log(`Passed ${checks} shared admin page and permission checks. No data changed.`);
  } finally { JwtAuthGuard.prototype.canActivate = original; }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
