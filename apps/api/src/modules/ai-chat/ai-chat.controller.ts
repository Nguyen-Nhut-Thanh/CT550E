import { Body, Controller, HttpCode, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import type { AuthenticatedUser } from "../../common/auth";
import { OptionalJwtAuthGuard } from "../auth/optional-jwt.guard";
import { AiChatDto } from "./ai-chat.dto";
import { AiChatService } from "./ai-chat.service";

@Controller("ai/chat")
export class AiChatController {
  constructor(private readonly chat: AiChatService) {}

  @Post()
  @HttpCode(200)
  @UseGuards(OptionalJwtAuthGuard)
  ask(@Body() body: AiChatDto, @Req() request: Request & { user?: AuthenticatedUser }) {
    return this.chat.ask(body, request.user?.isStaff ? undefined : request.user?.accountId);
  }
}

