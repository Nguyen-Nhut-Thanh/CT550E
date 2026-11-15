import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import type { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const firstIssue = result.error.issues?.[0];
      const message = firstIssue?.message || 'Dữ liệu gửi lên không hợp lệ.';
      throw new BadRequestException(message);
    }
    return result.data;
  }
}

