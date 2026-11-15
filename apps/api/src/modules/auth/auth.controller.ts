import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
} from "@nestjs/common";
import type {
  AuthRequest,
  ChangePasswordPayload,
  UpdateProfilePayload,
} from "shared";
import { UseImageUpload } from "../../common/decorators/use-image-upload.decorator";
import {
  GoogleLoginDto,
  LoginDto,
  RegisterDto,
  VerifyEmailDto,
} from "./auth.dto";
import { JwtAuthGuard } from "./jwt.guard";
import { AuthService } from "./auth.service";
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @UseGuards(JwtAuthGuard)
  @Post("auth/upload-avatar")
  @UseImageUpload()
  async uploadAvatar(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    return this.authService.uploadAvatar(file);
  }
  @Post("auth/register")
  async register(
    @Body()
    dto: RegisterDto,
  ) {
    return this.authService.register(dto);
  }
  @Post("auth/verify-email")
  async verifyEmail(
    @Body()
    dto: VerifyEmailDto,
  ) {
    return this.authService.verifyEmail(dto);
  }
  @Post("auth/resend-verification")
  async resendVerification(
    @Body("email")
    email: string,
  ) {
    return this.authService.resendVerificationCode(email);
  }
  @UseGuards(JwtAuthGuard)
  @Post("auth/update-profile")
  async updateProfile(
    @Req()
    req: AuthRequest,
    @Body()
    data: UpdateProfilePayload,
  ) {
    return this.authService.updateProfile(req.user.sub, data);
  }
  @UseGuards(JwtAuthGuard)
  @Post("auth/change-password")
  async changePassword(
    @Req()
    req: AuthRequest,
    @Body()
    dto: ChangePasswordPayload,
  ) {
    return this.authService.changePassword(req.user.sub, dto);
  }
  @Post("auth/login")
  async login(
    @Body()
    dto: LoginDto,
  ) {
    return this.authService.login(dto);
  }
  @Post("auth/google")
  async googleLogin(
    @Body()
    dto: GoogleLoginDto,
  ) {
    return this.authService.googleLogin(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Get("auth/me")
  async getMe(
    @Req()
    req: AuthRequest,
  ) {
    return this.authService.getMe(req.user.sub);
  }
}
