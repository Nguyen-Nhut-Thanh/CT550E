import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { OAuth2Client } from 'google-auth-library';
import {
  RegisterDto,
  LoginDto,
  VerifyEmailDto,
  GoogleLoginDto,
} from './dto/auth.dto';
import { MailService } from '../mail/mail.service';
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
  AuthAccountWithUser,
} from 'shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private createVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private createVerificationExpiry() {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    return expiresAt;
  }

  private async findAccountByEmail(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    return this.prisma.accounts.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
    });
  }

  private async getLoginAccount(rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    return (await this.prisma.accounts.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: { users: true },
    })) as AuthAccountWithUser | null;
  }

  async register(dto: RegisterDto) {
    const existing = await this.findAccountByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email đã tồn tại trên hệ thống');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const verificationCode = this.createVerificationCode();
    const expiresAt = this.createVerificationExpiry();

    await this.prisma.$transaction(async (tx: any) => {
      const account = await tx.accounts.create({
        data: {
          email: dto.email,
          password_hash: hashedPassword,
          provider: 'local',
          verification_code: verificationCode,
          verification_expires_at: expiresAt,
          status: 1,
        },
      });

      await tx.users.create({
        data: {
          account_id: account.account_id,
          full_name: dto.full_name,
          profile_completed: false,
        },
      });
    });

    await this.mailService.sendVerificationEmail(dto.email, verificationCode);

    return {
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để nhận mã xác thực.',
    };
  }

  async resendVerificationCode(email: string) {
    const account = await this.findAccountByEmail(email);
    if (!account) {
      throw new BadRequestException('Không tìm thấy tài khoản');
    }
    if (account.email_verified) {
      throw new BadRequestException('Email đã được xác thực trước đó');
    }

    const verificationCode = this.createVerificationCode();
    const expiresAt = this.createVerificationExpiry();

    await this.prisma.accounts.update({
      where: { account_id: account.account_id },
      data: {
        verification_code: verificationCode,
        verification_expires_at: expiresAt,
      },
    });

    await this.mailService.sendVerificationEmail(email, verificationCode);

    return { message: 'Mã xác thực mới đã được gửi đến email của bạn.' };
  }

  async updateProfile(userId: number, data: UpdateProfilePayload) {
    let birthday: Date | null | undefined;
    if (data.birthday !== undefined) {
      birthday = null;
      if (data.birthday !== null && data.birthday !== '') {
        if (typeof data.birthday !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.birthday)) {
          throw new BadRequestException('Ngày sinh không hợp lệ');
        }
        birthday = new Date(`${data.birthday}T00:00:00Z`);
        const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
        if (Number.isNaN(birthday.getTime()) || birthday.toISOString().slice(0, 10) !== data.birthday || data.birthday < '1900-01-01' || data.birthday > today) {
          throw new BadRequestException('Ngày sinh không hợp lệ hoặc sau hôm nay');
        }
      }
    }
    if (data.full_name !== undefined && (typeof data.full_name !== 'string' || !data.full_name.trim() || data.full_name.trim().length > 150)) {
      throw new BadRequestException('Họ và tên phải có từ 1 đến 150 ký tự');
    }
    if (data.gender !== undefined && !['', 'male', 'female', 'other'].includes(data.gender)) {
      throw new BadRequestException('Giới tính không hợp lệ');
    }
    if (data.avatar_url !== undefined) {
      if (typeof data.avatar_url !== 'string') throw new BadRequestException('Link ảnh không hợp lệ');
      data.avatar_url = data.avatar_url.trim();
      if (data.avatar_url) {
        try {
          const url = new URL(data.avatar_url);
          if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error();
        } catch { throw new BadRequestException('Link ảnh phải là URL http:// hoặc https:// hợp lệ'); }
      }
    }
    try {
      return await this.prisma.users.update({
        where: { user_id: userId },
        data: {
          full_name: data.full_name?.trim() || undefined,
          birthday,
          phone: data.phone === '' ? null : data.phone || undefined,
          address: data.address === '' ? null : data.address || undefined,
          avatar_url: data.avatar_url === '' ? null : data.avatar_url,
          gender: data.gender === '' ? null : data.gender,
          number_id: data.number_id === '' ? null : data.number_id || undefined,
          profile_completed: true,
        },
      });
    } catch (error) {
      const prismaError = error as {
        code?: string;
        meta?: { target?: string[] };
      };

      if (prismaError.code === 'P2002') {
        const target = prismaError.meta?.target || [];
        if (target.includes('phone')) {
          throw new BadRequestException(
            'Số điện thoại này đã được sử dụng bởi người dùng khác',
          );
        }
        if (target.includes('number_id')) {
          throw new BadRequestException(
            'Số CCCD/Hộ chiếu này đã được sử dụng bởi người dùng khác',
          );
        }
        throw new BadRequestException(
          'Thông tin bị trùng lặp với người dùng khác',
        );
      }

      throw error;
    }
  }

  async getMeByEmail(email: string) {
    return this.prisma.accounts.findUnique({
      where: { email },
      include: { users: true },
    });
  }

  async changePassword(userId: number, dto: ChangePasswordPayload) {
    if (typeof dto.newPassword !== 'string' || dto.newPassword.length < 8 || dto.newPassword.length > 128) {
      throw new BadRequestException('Mật khẩu mới phải có từ 8 đến 128 ký tự');
    }
    if (dto.oldPassword !== undefined && typeof dto.oldPassword !== 'string') {
      throw new BadRequestException('Mật khẩu hiện tại không hợp lệ');
    }
    const account = await this.prisma.accounts.findFirst({
      where: { users: { user_id: userId } },
    });

    if (!account) {
      throw new BadRequestException('Không tìm thấy tài khoản');
    }

    if (account.password_hash) {
      if (!dto.oldPassword) {
        throw new BadRequestException('Vui lòng nhập mật khẩu cũ');
      }
      const isMatch = await bcrypt.compare(
        dto.oldPassword,
        account.password_hash,
      );
      if (!isMatch) {
        throw new BadRequestException('Mật khẩu cũ không chính xác');
      }
      if (await bcrypt.compare(dto.newPassword, account.password_hash)) {
        throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại');
      }
    }

    const newHashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.accounts.update({
      where: { account_id: account.account_id },
      data: { password_hash: newHashedPassword },
    });

    return {
      message: account.password_hash
        ? 'Đổi mật khẩu thành công'
        : 'Thiết lập mật khẩu thành công',
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const account = await this.findAccountByEmail(dto.email);
    if (!account) {
      throw new BadRequestException('Không tìm thấy tài khoản');
    }
    if (account.email_verified) {
      throw new BadRequestException('Email đã được xác thực trước đó');
    }
    if (account.verification_code !== dto.code) {
      throw new BadRequestException('Mã xác thực không chính xác');
    }
    if (
      !account.verification_expires_at ||
      new Date() > account.verification_expires_at
    ) {
      throw new BadRequestException(
        'Mã xác thực đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu mã mới.',
      );
    }

    await this.prisma.accounts.update({
      where: { account_id: account.account_id },
      data: {
        email_verified: true,
        email_verified_at: new Date(),
        verification_code: null,
        verification_expires_at: null,
      },
    });

    return {
      message: 'Xác thực email thành công. Bây giờ bạn có thể đăng nhập.',
    };
  }

  async login(dto: LoginDto) {
    const account = await this.getLoginAccount(dto.email);

    if (!account || !account.password_hash) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }
    if (account.status !== 1) {
      throw new UnauthorizedException('Tài khoản đã bị khóa');
    }
    if (!account.email_verified) {
      throw new UnauthorizedException(
        'Email chưa được xác thực. Vui lòng xác thực trước khi đăng nhập.',
      );
    }

    const isMatch = await bcrypt.compare(dto.password, account.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    await this.prisma.accounts.update({
      where: { account_id: account.account_id },
      data: { last_login_at: new Date() },
    });

    return this.generateTokens(account);
  }

  async googleLogin(dto: GoogleLoginDto) {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new BadRequestException('Google token không hợp lệ');
      }

      const { email, sub, name, picture } = payload;

      let account = await this.getLoginAccount(email!);

      if (!account) {
        account = await this.prisma.$transaction(async (tx: any) => {
          const newAcc = await tx.accounts.create({
            data: {
              email: email!,
              provider: 'google',
              provider_account_id: sub,
              email_verified: true,
              email_verified_at: new Date(),
              status: 1,
            },
          });

          const newUser = await tx.users.create({
            data: {
              account_id: newAcc.account_id,
              full_name: name || 'Người dùng Google',
              avatar_url: picture,
              profile_completed: false,
            },
          });

          return { ...newAcc, users: newUser } as AuthAccountWithUser;
        });
      } else if (!account.provider_account_id) {
        await this.prisma.accounts.update({
          where: { account_id: account.account_id },
          data: {
            provider_account_id: sub,
            email_verified: true,
            email_verified_at: account.email_verified_at || new Date(),
          },
        });
      }

      if (!account) {
        throw new BadRequestException('Không thể khởi tạo tài khoản');
      }

      if (account.status !== 1) {
        throw new UnauthorizedException('Tài khoản đã bị khóa');
      }

      return this.generateTokens(account);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      const code = (error as { code?: unknown } | null)?.code;
      if (typeof code === 'string' && /^P\d{4}$/.test(code)) {
        this.logger.error(`Đăng nhập Google gặp lỗi cơ sở dữ liệu (${code})`);
        throw new InternalServerErrorException('Không thể truy cập dữ liệu tài khoản. Vui lòng thử lại sau.');
      }
      throw new UnauthorizedException('Xác thực Google thất bại');
    }
  }

  async adminLogin(email: string, password: string) {
    const account = await this.getLoginAccount(email);

    if (!account || !account.password_hash) {
      throw new UnauthorizedException('Thông tin không chính xác');
    }

    const isMatch = await bcrypt.compare(password, account.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Thông tin không chính xác');
    }

    if (!account.users?.is_staff) {
      throw new UnauthorizedException(
        'Bạn không có quyền truy cập trang quản trị',
      );
    }

    return this.generateTokens(account);
  }

  private async generateTokens(account: AuthAccountWithUser) {
    const payload = {
      sub: account.users.user_id,
      email: account.email,
      accountId: account.account_id,
      isStaff: account.users.is_staff,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        user_id: account.users.user_id,
        full_name: account.users.full_name,
        email: account.email,
        avatar_url: account.users.avatar_url,
        profile_completed: account.users.profile_completed,
        isStaff: account.users.is_staff,
      },
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      include: {
        accounts: {
          select: {
            email: true,
            provider: true,
            email_verified: true,
            last_login_at: true,
            password_hash: true,
          },
        },
      },
    });

    if (!user) return null;

    const { password_hash, ...accountInfo } = user.accounts;
    return {
      ...user,
      accounts: {
        ...accountInfo,
        hasPassword: !!password_hash,
      },
    };
  }
}
