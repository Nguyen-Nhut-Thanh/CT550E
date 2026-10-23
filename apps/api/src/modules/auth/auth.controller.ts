import { BadRequestException, Body, Controller, Get, InternalServerErrorException, Logger, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { AuthRequest, ChangePasswordPayload, UpdateProfilePayload } from 'shared';
import { CloudinaryService } from '../../infrastructure/storage/cloudinary.service';
import { GoogleLoginDto, LoginDto, RegisterDto, VerifyEmailDto, } from './auth.dto';
import { JwtAuthGuard } from './jwt.guard';
import { AuthService } from './auth.service';
@Controller()
export class AuthController {
    private readonly logger = new Logger(AuthController.name);
    constructor(private readonly authService: AuthService, private readonly cloudinaryService: CloudinaryService) { }
    @UseGuards(JwtAuthGuard)
    @Post('auth/upload-avatar')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024, files: 1 },
        fileFilter: (_req, file, callback) => {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
                return callback(new BadRequestException('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP'), false);
            }
            callback(null, true);
        },
    }))
    async uploadAvatar(
    @UploadedFile()
    file: Express.Multer.File) {
        if (!file || !file.size) {
            throw new BadRequestException('Không tìm thấy file để upload');
        }
        try {
            const result = await this.cloudinaryService.uploadBuffer(file.buffer, {
                folder: 'JourniTrip/avatars',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                transformation: [{ width: 500, height: 500, crop: 'limit' }],
            });
            return { url: result.secure_url };
        }
        catch (error) {
            const uploadError = error as Error;
            this.logger.error('[Avatar Upload Error]', uploadError);
            throw new InternalServerErrorException(`Lỗi khi upload avatar lên Cloudinary: ${uploadError.message}`);
        }
    }
    @Post('auth/register')
    async register(
    @Body()
    dto: RegisterDto) {
        return this.authService.register(dto);
    }
    @Post('auth/verify-email')
    async verifyEmail(
    @Body()
    dto: VerifyEmailDto) {
        return this.authService.verifyEmail(dto);
    }
    @Post('auth/resend-verification')
    async resendVerification(
    @Body('email')
    email: string) {
        return this.authService.resendVerificationCode(email);
    }
    @UseGuards(JwtAuthGuard)
    @Post('auth/update-profile')
    async updateProfile(
    @Req()
    req: AuthRequest,
    @Body()
    data: UpdateProfilePayload) {
        return this.authService.updateProfile(req.user.sub, data);
    }
    @UseGuards(JwtAuthGuard)
    @Post('auth/change-password')
    async changePassword(
    @Req()
    req: AuthRequest,
    @Body()
    dto: ChangePasswordPayload) {
        return this.authService.changePassword(req.user.sub, dto);
    }
    @Post('auth/login')
    async login(
    @Body()
    dto: LoginDto) {
        return this.authService.login(dto);
    }
    @Post('auth/google')
    async googleLogin(
    @Body()
    dto: GoogleLoginDto) {
        return this.authService.googleLogin(dto);
    }
    @UseGuards(JwtAuthGuard)
    @Get('auth/me')
    async getMe(
    @Req()
    req: AuthRequest) {
        return this.authService.getMe(req.user.sub);
    }
}
