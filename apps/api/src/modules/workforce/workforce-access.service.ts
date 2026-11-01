import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { WORKFORCE_REGIONS, WORKFORCE_ROLES, type RegionCode, type WorkforceActor, type WorkforceRole } from 'shared';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Injectable()
export class WorkforceAccessService {
    constructor(private readonly prisma: PrismaService) {}
    async actor(userId: number, accountId?: number, db: Prisma.TransactionClient = this.prisma): Promise<WorkforceActor> {
        if (!Number.isSafeInteger(userId) || userId < 1) throw new UnauthorizedException('Phiên đăng nhập không hợp lệ.');
        const user = await db.users.findUnique({ where: { user_id: userId }, include: {
            accounts: { select: { status: true } }, employee_profile: true, role_users: { include: { roles: true } },
        } });
        if (!user || user.accounts.status !== 1 || (accountId !== undefined && accountId !== user.account_id)) throw new UnauthorizedException('Tài khoản không còn hoạt động.');
        if (!user.is_staff || user.employee_profile?.status !== 'active') throw new ForbiddenException('Tài khoản nhân viên không còn hoạt động.');
        const roles = user.role_users.map(item => item.roles.name).filter((role): role is WorkforceRole => Object.hasOwn(WORKFORCE_ROLES, role));
        if (!roles.length) throw new ForbiddenException('Nhân viên chưa được phân quyền.');
        const regions = user.employee_profile.regions.filter((region): region is RegionCode => Object.hasOwn(WORKFORCE_REGIONS, region));
        const isAdmin = roles.includes('admin');
        const isManager = isAdmin || roles.includes('region_manager');
        return { userId, fullName: user.full_name, roles, regions, isAdmin, isManager, canChat: isManager || roles.includes('page_staff') };
    }
    manager(actor: WorkforceActor) {
        if (!actor.isManager) throw new ForbiddenException('Chỉ quản lý miền hoặc quản trị viên được thực hiện.');
    }
    region(actor: WorkforceActor, region: string | null) {
        if (!actor.isAdmin && (!region || !actor.regions.includes(region as RegionCode))) throw new ForbiddenException('Ngoài miền được phân công quản lý.');
    }
    async customer(actor: WorkforceActor, customerId: number) {
        if (actor.isAdmin) return;
        if (!actor.canChat) throw new ForbiddenException('Không có quyền hỗ trợ khách hàng này.');
        const conversation = await this.prisma.conversations.findFirst({ where: { user_id: customerId }, select: { conversation_id: true } });
        if (!conversation) throw new ForbiddenException('Khách hàng chưa có hội thoại hỗ trợ.');
    }
}
