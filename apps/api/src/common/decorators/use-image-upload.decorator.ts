import {
  applyDecorators,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

/**
 * Decorator chuẩn hóa cấu hình Multer FileInterceptor cho việc upload ảnh:
 * - Lưu trữ trong memoryStorage
 * - Giới hạn tối đa 5MB, 1 file
 * - Chỉ chấp nhận mime type: image/jpeg, image/png, image/webp
 */
export function UseImageUpload(fieldName = 'file') {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, {
        storage: memoryStorage(),
        limits: { fileSize: 5 * 1024 * 1024, files: 1 },
        fileFilter: (_req, file, callback) => {
          if (!['image/jpeg', 'image/png', 'image/webp'].includes(file?.mimetype)) {
            return callback(
              new BadRequestException('Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP.'),
              false,
            );
          }
          callback(null, true);
        },
      }),
    ),
  );
}

