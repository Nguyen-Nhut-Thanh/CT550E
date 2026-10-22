import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import type { JwtChatPayload, JoinPayload, ReadPayload, SendPayload, TypingPayload } from 'shared';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: { origin: process.env.CORS_ORIGINS?.split(',').map(value => value.trim()).filter(Boolean) ?? ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://nhutthanh.id.vn', 'https://www.nhutthanh.id.vn'], credentials: true },
  maxHttpBufferSize: 32 * 1024,
})
export class ChatGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server;
  constructor(private readonly chat: ChatService, private readonly jwt: JwtService) {}

  afterInit(server: Server) {
    server.use((socket, next) => {
      void (async () => {
        const token = socket.handshake.auth?.token ?? socket.handshake.headers.authorization?.split(' ')[1];
        if (typeof token !== 'string') throw new Error('Unauthorized');
        const payload = this.jwt.verify<JwtChatPayload>(token);
        const actor = await this.chat.actor(payload);
        socket.data.payload = payload;
        socket.data.actor = actor;
        next();
      })().catch(() => next(new Error('Phiên đăng nhập không hợp lệ')));
    });
  }

  private async actor(client: Socket) {
    const payload = client.data.payload as JwtChatPayload | undefined;
    if (!payload) throw new Error('Vui lòng đăng nhập');
    // Verify expiration and database permissions for every event.
    const token = client.handshake.auth?.token ?? client.handshake.headers.authorization?.split(' ')[1];
    this.jwt.verify(String(token));
    return this.chat.actor(payload);
  }

  async notify(id: number, event: string, payload: unknown, roomOnly = false, except?: string) {
    // Recheck recipients, including idle sockets whose account or role changed.
    const sockets = await this.server.fetchSockets();
    await Promise.all(sockets.map(async socket => {
      if (socket.id === except || (roomOnly && !socket.rooms.has(`conv_${id}`))) return;
      try {
        const token = socket.handshake.auth?.token ?? socket.handshake.headers.authorization?.split(' ')[1];
        const actor = await this.chat.actor(this.jwt.verify<JwtChatPayload>(String(token)));
        await this.chat.authorize(id, actor);
        socket.emit(event, payload);
      } catch { /* A revoked or unrelated connection must receive no conversation data. */ }
    }));
  }

  private async attempt(work: () => Promise<unknown>) {
    try { return await work(); }
    catch (error) { return { error: error instanceof Error ? error.message : 'Không thể xử lý tin nhắn' }; }
  }

  @SubscribeMessage('chat:join')
  join(@ConnectedSocket() client: Socket, @MessageBody() data: JoinPayload) {
    return this.attempt(async () => {
      const actor = await this.actor(client);
      const id = data?.conversation_id ?? (await this.chat.getOrCreateConversation(actor)).conversation_id;
      await this.chat.authorize(id, actor);
      for (const room of client.rooms) if (room.startsWith('conv_')) await client.leave(room);
      await client.join(`conv_${id}`);
      return { conversation_id: id };
    });
  }

  @SubscribeMessage('chat:leave')
  leave(@ConnectedSocket() client: Socket) {
    for (const room of client.rooms) if (room.startsWith('conv_')) void client.leave(room);
    return { success: true };
  }

  @SubscribeMessage('chat:send')
  send(@ConnectedSocket() client: Socket, @MessageBody() data: SendPayload) {
    return this.attempt(async () => {
      const message = await this.chat.send(await this.actor(client), data);
      await this.notify(message.conversation_id, 'chat:message', message, true);
      await this.notify(message.conversation_id, 'chat:conversation:updated', { conversation_id: message.conversation_id, sender_role: message.sender_role });
      return { message };
    });
  }

  @SubscribeMessage('chat:typing')
  typing(@ConnectedSocket() client: Socket, @MessageBody() data: TypingPayload) {
    return this.attempt(async () => {
      const actor = await this.actor(client);
      const conversation = await this.chat.authorize(data?.conversation_id, actor);
      if (actor.isStaff && (conversation.assigned_staff_id !== actor.userId || conversation.status !== 'IN_PROGRESS')) return { success: false };
      if (typeof data.is_typing !== 'boolean') return { success: false };
      const now = Date.now();
      if (data.is_typing && now - (client.data.lastTyping ?? 0) < 500) return { success: true };
      client.data.lastTyping = now;
      await this.notify(data.conversation_id, 'chat:typing', { ...data, user_id: actor.userId }, true, client.id);
      return { success: true };
    });
  }

  @SubscribeMessage('chat:read')
  read(@ConnectedSocket() client: Socket, @MessageBody() data: ReadPayload) {
    return this.attempt(async () => {
      const actor = await this.actor(client);
      const result = await this.chat.read(data?.conversation_id, actor, data?.through_message_id);
      if (result.count) await this.notify(data.conversation_id, 'chat:conversation:updated', { conversation_id: data.conversation_id, read: true, reader_role: actor.isStaff ? 'STAFF' : 'USER', through_message_id: data.through_message_id });
      return { success: true };
    });
  }
}
