import { NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../../infrastructure/database/prisma.service';
export async function getAccountUserId(prisma: Pick<PrismaService, 'users'>, accountId: number, message: string): Promise<number> {
    const user = await prisma.users.findUnique({
        where: { account_id: accountId },
        select: { user_id: true },
    });
    if (!user)
        throw new NotFoundException(message);
    return user.user_id;
}
