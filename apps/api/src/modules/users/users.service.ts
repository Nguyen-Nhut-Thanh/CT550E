import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }
    private async findUserAccountOrThrow(userId: number) {
        const user = await this.prisma.users.findUnique({
            where: { user_id: userId },
            select: { account_id: true, is_staff: true },
        });
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }
        return user;
    }
    async findAll() {
        return this.prisma.users.findMany({
            include: {
                accounts: {
                    select: {
                        email: true,
                        status: true,
                        last_login_at: true,
                        provider: true,
                    },
                },
                staff_profiles: true,
                role_users: {
                    include: {
                        roles: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }
    async findOne(userId: number) {
        const user = await this.prisma.users.findUnique({
            where: { user_id: userId },
            include: {
                accounts: {
                    select: {
                        email: true,
                        status: true,
                        last_login_at: true,
                        provider: true,
                    },
                },
                staff_profiles: true,
                role_users: {
                    include: {
                        roles: true,
                    },
                },
            },
        });
        if (!user) {
            throw new NotFoundException('Không tìm thấy người dùng');
        }
        return user;
    }
    async updateStatus(userId: number, status: number) {
        const user = await this.findUserAccountOrThrow(userId);
        return this.prisma.accounts.update({
            where: { account_id: user.account_id },
            data: { status },
        });
    }
    async toggleStaffStatus(userId: number) {
        const user = await this.findUserAccountOrThrow(userId);
        return this.prisma.users.update({
            where: { user_id: userId },
            data: { is_staff: !user.is_staff },
        });
    }
    async deleteUser(userId: number) {
        if (await this.prisma.employee_profiles.findUnique({ where: { user_id: userId } })) throw new BadRequestException('Nhân viên có hồ sơ nhân sự. Hãy ngưng hoạt động để giữ lịch sử phân công thay vì xóa tài khoản.');
        const user = await this.findUserAccountOrThrow(userId);
        return this.prisma.$transaction(async (tx) => {
            await tx.staff_profiles.deleteMany({ where: { user_id: userId } });
            await tx.role_users.deleteMany({ where: { user_id: userId } });
            await tx.favorites.deleteMany({ where: { user_id: userId } });
            await tx.reviews.deleteMany({ where: { user_id: userId } });
            const bookingsCount = await tx.bookings.count({
                where: { user_id: userId },
            });
            if (bookingsCount > 0) {
                throw new BadRequestException('Không thể xóa người dùng đã có lịch sử đặt tour. Hãy khóa tài khoản thay thế.');
            }
            await tx.users.delete({ where: { user_id: userId } });
            await tx.accounts.delete({ where: { account_id: user.account_id } });
            return { message: 'Xóa người dùng thành công' };
        });
    }
}
