import { Injectable, Logger, type OnApplicationBootstrap, type OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { finalizeCrewIfReady } from './crew-finalization';

@Injectable()
export class CrewFinalizationService implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly logger = new Logger(CrewFinalizationService.name);
    private timer?: ReturnType<typeof setInterval>;
    private running = false;
    private stopped = false;
    constructor(private readonly prisma: PrismaService) {}
    onApplicationBootstrap() { this.timer = setInterval(() => void this.sweep(), 60_000); this.timer.unref(); void this.sweep(); }
    onModuleDestroy() { this.stopped = true; if (this.timer) clearInterval(this.timer); }
    async sweep() {
        if (this.running || this.stopped) return;
        this.running = true;
        try {
            let cursor = 0;
            while (!this.stopped) {
                const schedules = await this.prisma.tour_schedules.findMany({ where: { tour_schedule_id: { gt: cursor }, status: 1, end_date: { gt: new Date() } }, select: { tour_schedule_id: true }, orderBy: { tour_schedule_id: 'asc' }, take: 100 });
                if (!schedules.length) break;
                for (const schedule of schedules) {
                    try { await this.prisma.$transaction(tx => finalizeCrewIfReady(tx, schedule.tour_schedule_id), { timeout: 20_000 }); }
                    catch (error) { this.logger.error(`Không thể chốt/đồng bộ nhân sự chuyến ${schedule.tour_schedule_id}`, error instanceof Error ? error.message : undefined); }
                }
                cursor = schedules[schedules.length - 1].tour_schedule_id;
            }
        } catch (error) { this.logger.error('Không thể quét chốt nhân sự', error instanceof Error ? error.message : undefined); }
        finally { this.running = false; }
    }
}
