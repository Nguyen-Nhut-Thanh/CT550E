import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import type { BannerPayload, SeasonalThemeConfig, SeasonMode, SeasonType } from 'shared';
import { PrismaService } from '../../infrastructure/database/prisma.service';
@Injectable()
export class BannersService {
    constructor(private readonly prisma: PrismaService) { }
    private resolveActiveSeason(mode: SeasonMode): SeasonType {
        if (mode === 'spring' || mode === 'summer' || mode === 'autumn' || mode === 'winter') {
            return mode;
        }
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'spring';
        if (month >= 6 && month <= 8) return 'summer';
        if (month >= 9 && month <= 11) return 'autumn';
        return 'winter';
    }

    private getConfigFile(): string {
        const cwd = process.cwd();
        const baseDir = cwd.endsWith(path.join('apps', 'api')) || cwd.endsWith('apps/api')
            ? path.join(cwd, 'data')
            : path.join(cwd, 'apps', 'api', 'data');
        if (!fs.existsSync(baseDir)) {
            try { fs.mkdirSync(baseDir, { recursive: true }); } catch { /* ignore */ }
        }
        return path.join(baseDir, 'seasonal-theme.json');
    }

    async getSeasonalTheme(): Promise<SeasonalThemeConfig> {
        let saved: Partial<SeasonalThemeConfig> = {};
        try {
            const filePath = this.getConfigFile();
            if (fs.existsSync(filePath)) {
                saved = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            }
        } catch {
            // fallback
        }

        const mode: SeasonMode = saved.mode || 'auto';
        const activeSeason = this.resolveActiveSeason(mode);
        const enableParticles = saved.enableParticles !== undefined ? Boolean(saved.enableParticles) : true;
        const enableColors = saved.enableColors !== undefined ? Boolean(saved.enableColors) : true;
        const particleDensity = saved.particleDensity || 'normal';

        return {
            mode,
            activeSeason,
            enableParticles: mode === 'disabled' ? false : enableParticles,
            enableColors: mode === 'disabled' ? false : enableColors,
            particleDensity,
        };
    }

    async updateSeasonalTheme(payload: Partial<SeasonalThemeConfig>): Promise<SeasonalThemeConfig> {
        const current = await this.getSeasonalTheme();
        const mode = payload.mode !== undefined ? payload.mode : current.mode;
        const updated: SeasonalThemeConfig = {
            mode,
            activeSeason: this.resolveActiveSeason(mode),
            enableParticles: payload.enableParticles !== undefined ? Boolean(payload.enableParticles) : current.enableParticles,
            enableColors: payload.enableColors !== undefined ? Boolean(payload.enableColors) : current.enableColors,
            particleDensity: payload.particleDensity || current.particleDensity,
        };

        try {
            const filePath = this.getConfigFile();
            fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
        } catch {
            // fallback
        }

        return updated;
    }
    private async ensureExists(id: number) {
        const banner = await this.prisma.banners.findUnique({
            where: { banner_id: id },
        });
        if (!banner) {
            throw new NotFoundException('Không tìm thấy banner');
        }
        return banner;
    }
    private normalizePayload(data: BannerPayload) {
        return {
            location_name: data.location_name ?? undefined,
            header: data.header ?? undefined,
            description: data.description ?? undefined,
            image_url: data.image_url ?? undefined,
            link_to: data.link_to ?? undefined,
            status: data.status !== undefined ? Number(data.status) : undefined,
        };
    }
    async getPublicBanners() {
        return this.prisma.banners.findMany({
            where: { status: 1 },
            orderBy: { banner_id: 'asc' },
        });
    }
    async findAll() {
        return this.prisma.banners.findMany({
            orderBy: { banner_id: 'asc' },
        });
    }
    async findOne(id: number) {
        return this.ensureExists(id);
    }
    async create(data: BannerPayload) {
        const payload = this.normalizePayload(data);
        return this.prisma.banners.create({
            data: {
                location_name: payload.location_name ?? '',
                header: payload.header ?? '',
                description: payload.description ?? '',
                image_url: payload.image_url ?? '',
                link_to: payload.link_to ?? null,
                status: payload.status ?? 1,
            },
        });
    }
    async update(id: number, data: BannerPayload) {
        await this.ensureExists(id);
        return this.prisma.banners.update({
            where: { banner_id: id },
            data: this.normalizePayload(data),
        });
    }
    async remove(id: number) {
        await this.ensureExists(id);
        return this.prisma.banners.delete({
            where: { banner_id: id },
        });
    }
}
