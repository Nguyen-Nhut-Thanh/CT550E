import { Body, Controller, Header, HttpCode, HttpException, HttpStatus, Post, ServiceUnavailableException } from '@nestjs/common';
import type { AiChatResponse } from 'shared';

@Controller('ai/chatbot')
export class ChatbotController {
  private active = 0;
  private requestCount = 0;
  private resetAt = 0;

  @Post('messages')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async message(@Body() request: unknown): Promise<AiChatResponse> {
    if (Date.now() >= this.resetAt) {
      this.resetAt = Date.now() + 60_000;
      this.requestCount = 0;
    }
    if (this.active >= 12 || this.requestCount >= 90) {
      throw new HttpException('Trợ lý AI đang bận. Vui lòng thử lại sau.', HttpStatus.TOO_MANY_REQUESTS);
    }
    this.active++;
    this.requestCount++;
    try {
      return await this.forward(request);
    } finally {
      this.active--;
    }
  }

  private async forward(request: unknown): Promise<AiChatResponse> {
    const origin = (process.env.AI_INTERNAL_URL || `http://127.0.0.1:${process.env.AI_PORT || 8000}`).replace(/\/+$/, '');
    let response: Response;
    try {
      response = await fetch(`${origin}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(60_000),
        redirect: 'error',
      });
    } catch {
      throw new ServiceUnavailableException('Chưa kết nối được dịch vụ chatbot. Bạn có thể chuyển sang Nhân viên tư vấn.');
    }
    const body = await response.json().catch(() => null);
    if (!response.ok || !body || typeof body.reply !== 'string') {
      if (response.status === 422) throw new HttpException('Yêu cầu chat không hợp lệ.', HttpStatus.BAD_REQUEST);
      throw new ServiceUnavailableException(response.status === 503 && typeof body?.detail === 'string'
        ? body.detail : 'Dịch vụ chatbot hiện chưa trả lời được. Bạn thử lại nhé.');
    }
    return body as AiChatResponse;
  }
}
