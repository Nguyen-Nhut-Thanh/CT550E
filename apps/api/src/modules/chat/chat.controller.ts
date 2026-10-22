import { BadRequestException, Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedRequest, ChatManageInput } from 'shared';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService, private readonly cloudinary: CloudinaryService, private readonly gateway: ChatGateway) {}

  @Get('me')
  me(@Req() req: AuthenticatedRequest) { return this.chat.actor(req.user); }

  @Get('conversations')
  async conversations(@Req() req: AuthenticatedRequest) { return this.chat.list(await this.chat.actor(req.user)); }

  @Post('conversations')
  async create(@Req() req: AuthenticatedRequest) { return this.chat.getOrCreateConversation(await this.chat.actor(req.user)); }

  @Get('staff')
  async staff(@Req() req: AuthenticatedRequest) { return this.chat.staff(await this.chat.actor(req.user)); }

  @Get('conversations/:id/messages')
  async messages(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest, @Query('before') before?: string, @Query('after') after?: string) {
    return this.chat.messages(id, await this.chat.actor(req.user), before === undefined ? undefined : Number(before), after === undefined ? undefined : Number(after));
  }

  // Preserve the original array response for existing consumers.
  @Get('messages/:id')
  async legacyMessages(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return (await this.chat.messages(id, await this.chat.actor(req.user))).items;
  }

  @Post('conversations/:id/manage')
  async manage(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest, @Body() body: ChatManageInput) {
    const result = await this.chat.manage(id, await this.chat.actor(req.user), body?.action, body?.staff_id);
    await this.gateway.notify(id, 'chat:conversation:updated', { conversation_id: id });
    return result;
  }

  // Legacy delete now resolves the conversation and preserves the customer's history.
  @Delete('conversations/:id')
  async close(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
    return this.manage(id, req, { action: 'close' });
  }

  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024, files: 1 } }))
  async upload(@Req() req: AuthenticatedRequest, @UploadedFile() file: Express.Multer.File) {
    await this.chat.actor(req.user);
    if (!file) throw new BadRequestException('Hãy chọn ảnh');
    const b = file.buffer;
    const valid = (file.mimetype === 'image/jpeg' && b[0] === 255 && b[1] === 216 && b[2] === 255)
      || (file.mimetype === 'image/png' && b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
      || (file.mimetype === 'image/gif' && ['GIF87a','GIF89a'].includes(b.subarray(0,6).toString()))
      || (file.mimetype === 'image/webp' && b.subarray(0,4).toString() === 'RIFF' && b.subarray(8,12).toString() === 'WEBP');
    if (!valid) throw new BadRequestException('Chỉ hỗ trợ ảnh JPG, PNG, GIF, WebP tối đa 5 MB');
    try {
      const image = await this.cloudinary.uploadBuffer(b, { folder: 'travel_v2/chat_images', resource_type: 'image' });
      return { url: image.secure_url };
    } catch { throw new BadRequestException('Tải ảnh thất bại, vui lòng thử lại'); }
  }
}
