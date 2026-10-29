import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from "@nestjs/common";
import { randomBytes } from "node:crypto";
import {
  MEMBERSHIP_TIERS,
  type MembershipSummary,
  type MembershipTier,
  type MembershipAdminList,
} from "shared";
import { normalizeMembershipTiers } from "./membership.settings";
import { getAccountUserId } from "../../common/auth/account-user";
import { PrismaService } from "../../infrastructure/database/prisma.service";
import { calculateMembership, creditForBooking } from "./membership.rules";

@Injectable()
export class MembershipService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(MembershipService.name);
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  private stopped = false;
  constructor(private readonly prisma: PrismaService) {}

  onApplicationBootstrap() {
    this.timer = setInterval(() => void this.sweep(), 60 * 60 * 1000);
    this.timer.unref();
    void this.sweep();
  }
  onModuleDestroy() {
    this.stopped = true;
    if (this.timer) clearInterval(this.timer);
  }

  // Periodic reconciliation also handles expired cycles while customers are offline.
  async sweep() {
    if (this.running || this.stopped) return;
    this.running = true;
    try {
      let cursor = 0;
      while (!this.stopped) {
        const users = await this.prisma.users.findMany({
          where: {
            user_id: { gt: cursor },
            OR: [
              { membership: { isNot: null } },
              {
                bookings: {
                  some: {
                    status: { in: ["paid", "confirmed", "completed"] },
                    tour_schedules: { end_date: { lte: new Date() } },
                  },
                },
              },
            ],
          },
          select: { user_id: true },
          orderBy: { user_id: "asc" },
          take: 100,
        });
        if (!users.length) break;
        for (const user of users) {
          try {
            await this.syncUser(user.user_id);
          } catch (error) {
            this.logger.error(
              `Không thể xét hạng tài khoản ${user.user_id}`,
              error instanceof Error ? error.stack : undefined,
            );
          }
        }
        cursor = users[users.length - 1].user_id;
      }
    } catch (error) {
      this.logger.error(
        "Không thể chạy xét hạng thành viên",
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.running = false;
    }
  }

  async forAccount(accountId: number) {
    return this.syncUser(
      await getAccountUserId(
        this.prisma,
        accountId,
        "Không tìm thấy người dùng.",
      ),
    );
  }

  async syncUser(userId: number, now = new Date()): Promise<MembershipSummary> {
    return this.prisma.$transaction(
      async (tx) => {
        // Serialize reward issuance across HTTP requests and multiple API processes.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(73129, ${userId}::integer)`;
        const existing = await tx.memberships.findUnique({
          where: { user_id: userId },
        });
        const program = await tx.membership_program.findUnique({
          where: { id: 1 },
        });
        const tiers = program
          ? normalizeMembershipTiers(program.tiers)
          : MEMBERSHIP_TIERS;
        const bookings = await tx.bookings.findMany({
          where: {
            user_id: userId,
            tour_schedules: { end_date: { lte: now } },
          },
          include: {
            payments: true,
            tour_schedules: { include: { tours: { select: { name: true } } } },
          },
        });
        const credits = bookings.flatMap((booking) => {
          const credit = creditForBooking(booking, now);
          return credit ? [credit] : [];
        });
        const state = calculateMembership(
          existing?.started_at ?? null,
          credits,
          now,
          tiers,
        );
        await tx.memberships.upsert({
          where: { user_id: userId },
          create: {
            user_id: userId,
            started_at: state.anchor,
            tier: state.tier.id,
            cycle_start: state.start,
            cycle_end: state.end,
            spending: state.spending,
          },
          update: {
            started_at: state.anchor,
            tier: state.tier.id,
            cycle_start: state.start,
            cycle_end: state.end,
            spending: state.spending,
          },
        });
        const notify = async (key: string, title: string, message: string) =>
          tx.membership_notifications.upsert({
            where: { event_key: key },
            create: {
              user_id: userId,
              event_key: key,
              title,
              message,
              created_at: now,
            },
            update: {},
          });
        if (state.start && state.end) {
          const cycleKey = `${userId}:${state.start.toISOString()}`;
          if (state.tier.id !== "bronze") {
            const rewardKey = `rank:${cycleKey}:${state.tier.id}`;
            const expires = new Date(now.getTime() + 90 * 86400_000);
            await tx.vouchers.upsert({
              where: { reward_key: rewardKey },
              update: {},
              create: {
                owner_user_id: userId,
                reward_key: rewardKey,
                code: `JT-${randomBytes(10).toString("hex").toUpperCase()}`,
                discount_type: state.tier.discountType,
                discount_value: state.tier.discountValue,
                min_order_value: state.tier.minOrder,
                max_discount_amount: state.tier.maxDiscount,
                usage_limit: 1,
                start_date: now,
                expiry_date: expires,
              },
            });
            await notify(
              rewardKey,
              `Quyền lợi hạng ${state.tier.name}`,
              `Bạn đang ở hạng ${state.tier.name}. Một voucher dành riêng cho bạn đã có trong ví, hiệu lực đến ${expires.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}.`,
            );
          }
          if (existing?.cycle_start && existing.cycle_start < state.start) {
            await notify(
              `renew:${cycleKey}`,
              "Đã xét lại hạng thành viên",
              `Hạng của bạn trong chu kỳ mới là ${state.tier.name}. Chi tiêu xét hạng bắt đầu lại; voucher đã cấp vẫn giữ nguyên hạn dùng.`,
            );
          }
          const remaining = Math.max(0, state.tier.threshold - state.spending);
          const days = Math.ceil(
            (state.end.getTime() - now.getTime()) / 86400_000,
          );
          if (remaining > 0 && days <= 30) {
            const milestone = days <= 7 ? 7 : 30;
            await notify(
              `remind:${cycleKey}:${milestone}`,
              `Sắp đến ngày xét lại hạng ${state.tier.name}`,
              `Còn ${days} ngày đến ngày xét hạng. Bạn cần thêm ${remaining.toLocaleString("vi-VN")}đ chi tiêu từ tour hoàn thành để giữ hạng ${state.tier.name}.`,
            );
          }
        }
        const [vouchers, notifications] = await Promise.all([
          tx.vouchers.findMany({
            where: { owner_user_id: userId },
            orderBy: { created_at: "desc" },
          }),
          tx.membership_notifications.findMany({
            where: { user_id: userId },
            orderBy: [{ created_at: "desc" }, { notification_id: "desc" }],
            take: 100,
          }),
        ]);
        const nextTier =
          tiers[tiers.findIndex((tier) => tier.id === state.tier.id) + 1] ??
          null;
        const target = nextTier?.threshold ?? state.tier.threshold;
        return {
          tier: state.tier,
          tiers,
          cycleStart: state.start?.toISOString() ?? null,
          cycleEnd: state.end?.toISOString() ?? null,
          spending: state.spending,
          points: Math.floor(state.spending / 100_000),
          nextTier,
          toNextTier: nextTier
            ? Math.max(0, nextTier.threshold - state.spending)
            : 0,
          toRetainTier: Math.max(0, state.tier.threshold - state.spending),
          progress: target ? Math.min(100, (state.spending / target) * 100) : 0,
          vouchers: vouchers.map((voucher) => ({
            voucher_id: voucher.voucher_id,
            code: voucher.code,
            discount_type: voucher.discount_type,
            discount_value: Number(voucher.discount_value),
            min_order_value: Number(voucher.min_order_value),
            max_discount_amount:
              voucher.max_discount_amount === null
                ? null
                : Number(voucher.max_discount_amount),
            start_date: voucher.start_date.toISOString(),
            expiry_date: voucher.expiry_date.toISOString(),
            state:
              voucher.used_count >= voucher.usage_limit
                ? ("used" as const)
                : voucher.expiry_date <= now || voucher.status !== 1
                  ? ("expired" as const)
                  : ("available" as const),
          })),
          notifications: notifications.map((item) => ({
            notification_id: item.notification_id,
            title: item.title,
            message: item.message,
            created_at: item.created_at.toISOString(),
            read_at: item.read_at?.toISOString() ?? null,
          })),
          history: state.history.map((credit) => ({
            ...credit,
            completedAt: credit.completedAt.toISOString(),
            points: Math.floor(credit.amount / 100_000),
          })),
          cycles: state.cycles,
        };
      },
      { timeout: 20_000 },
    );
  }

  async readNotifications(accountId: number) {
    const userId = await getAccountUserId(
      this.prisma,
      accountId,
      "Không tìm thấy người dùng.",
    );
    await this.prisma.membership_notifications.updateMany({
      where: { user_id: userId, read_at: null },
      data: { read_at: new Date() },
    });
    return { success: true };
  }

  async updateSettings(value: unknown): Promise<MembershipTier[]> {
    const tiers = normalizeMembershipTiers(value);
    await this.prisma.membership_program.upsert({
      where: { id: 1 },
      create: { id: 1, tiers: JSON.parse(JSON.stringify(tiers)) },
      update: { tiers: JSON.parse(JSON.stringify(tiers)) },
    });
    return tiers;
  }

  async adminList(page: number): Promise<MembershipAdminList> {
    const [members, total, issued, used, discounts, program] =
      await Promise.all([
        this.prisma.memberships.findMany({
          orderBy: { user_id: "asc" },
          skip: (page - 1) * 20,
          take: 20,
          include: {
            user: {
              include: {
                accounts: { select: { email: true } },
                _count: { select: { member_vouchers: true } },
              },
            },
          },
        }),
        this.prisma.memberships.count(),
        this.prisma.vouchers.count({ where: { owner_user_id: { not: null } } }),
        this.prisma.vouchers.count({
          where: { owner_user_id: { not: null }, used_count: { gt: 0 } },
        }),
        this.prisma.bookings.aggregate({
          where: {
            vouchers: { owner_user_id: { not: null } },
            status: { in: ["paid", "confirmed", "completed"] },
          },
          _sum: { discount_amount: true },
        }),
        this.prisma.membership_program.findUnique({ where: { id: 1 } }),
      ]);
    return {
      items: members.map((member) => ({
        userId: member.user_id,
        name: member.user.full_name,
        email: member.user.accounts.email,
        tier: member.tier,
        spending: Number(member.spending),
        cycleEnd: member.cycle_end?.toISOString() ?? null,
        voucherCount: member.user._count.member_vouchers,
      })),
      total,
      page,
      tiers: program
        ? normalizeMembershipTiers(program.tiers)
        : MEMBERSHIP_TIERS,
      issued,
      used,
      discountTotal: Number(discounts._sum.discount_amount ?? 0),
    };
  }
}
