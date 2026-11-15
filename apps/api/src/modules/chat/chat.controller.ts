import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UploadedFile, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest, ChatManageInput } from 'shared';
import { UseImageUpload, uploadToFolder } from '../../common/decorators';
import { CloudinaryService } from '../../infrastructure/storage/cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chat: ChatService, private readonly cloudinary: CloudinaryService, private readonly gateway: ChatGateway) { }
    @Get('me')
    me(
    @Req()
    req: AuthenticatedRequest) { return this.chat.actor(req.user); }
    @Get('conversations')
    async conversations(
    @Req()
    req: AuthenticatedRequest) { return this.chat.list(await this.chat.actor(req.user)); }
    @Post('conversations')
    async create(
    @Req()
    req: AuthenticatedRequest) { return this.chat.getOrCreateConversation(await this.chat.actor(req.user)); }
    @Post('conversations/user/:userId')
    async openWithUser(
    @Param('userId', ParseIntPipe)
    userId: number,
    @Req()
    req: AuthenticatedRequest) {
        return this.chat.getOrCreateConversationForUser(await this.chat.actor(req.user), userId);
    }
    @Get('conversations/:id/contexts')
    async contexts(@Param('id', ParseIntPipe) id: number, @Req() req: AuthenticatedRequest) {
        return this.chat.contexts(id, await this.chat.actor(req.user));
    }
    @Get('conversations/:id/messages')
    async messages(
    @Param('id', ParseIntPipe)
    id: number,
    @Req()
    req: AuthenticatedRequest,
    @Query('before')
    before?: string,
    @Query('after')
    after?: string) {
        return this.chat.messages(id, await this.chat.actor(req.user), before === undefined ? undefined : Number(before), after === undefined ? undefined : Number(after));
    }
    // Preserve the original array response for existing consumers.
    @Get('messages/:id')
    async legacyMessages(
    @Param('id', ParseIntPipe)
    id: number,
    @Req()
    req: AuthenticatedRequest) {
        return (await this.chat.messages(id, await this.chat.actor(req.user))).items;
    }
    @Post('conversations/:id/manage')
    async manage(
    @Param('id', ParseIntPipe)
    id: number,
    @Req()
    req: AuthenticatedRequest,
    @Body()
    body: ChatManageInput) {
        const result = await this.chat.manage(id, await this.chat.actor(req.user), body?.action);
        await this.gateway.notify(id, 'chat:conversation:updated', { conversation_id: id });
        return result;
    }
    // Legacy delete now resolves the conversation and preserves the customer's history.
    @Delete('conversations/:id')
    async close(
    @Param('id', ParseIntPipe)
    id: number,
    @Req()
    req: AuthenticatedRequest) {
        return this.manage(id, req, { action: 'close' });
    }
    @Post('upload-image')
    @UseImageUpload()
    async upload(
        @Req() req: AuthenticatedRequest,
        @UploadedFile() file: Express.Multer.File,
    ) {
        await this.chat.actor(req.user);
        return uploadToFolder(this.cloudinary, file, 'JourniTrip/chat_images');
    }
}
