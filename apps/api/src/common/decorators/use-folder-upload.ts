import { BadRequestException, InternalServerErrorException, Logger } from '@nestjs/common';
import type { UploadApiOptions } from 'cloudinary';
import { CloudinaryService } from '../../infrastructure/storage/cloudinary.service';

export interface FolderUploadOptions {
  folder: string;
  allowedFormats?: string[];
  transformation?: UploadApiOptions['transformation'];
  errorMessage?: string;
  resourceType?: 'image' | 'raw' | 'video' | 'auto';
}

/** Cấu hình chuẩn định sẵn cho từng thư mục ảnh trong JourniTrip */
export const FOLDER_PRESETS: Record<string, Partial<FolderUploadOptions>> = {
  'JourniTrip/avatars': {
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    errorMessage: 'Lỗi khi upload avatar lên Cloudinary',
  },
  'JourniTrip/banners': {
    errorMessage: 'Lỗi khi upload banner lên Cloudinary',
  },
  'JourniTrip/posts': {
    transformation: [{ width: 1920, height: 1920, crop: 'limit' }],
    errorMessage: 'Không thể tải ảnh bài viết. Vui lòng thử lại.',
  },
  'JourniTrip/reviews': {
    errorMessage: 'Lỗi upload ảnh đánh giá',
  },
  'JourniTrip/locations': {
    errorMessage: 'Lỗi upload ảnh địa điểm',
  },
  'JourniTrip/schedules': {
    errorMessage: 'Lỗi upload ảnh lịch trình',
  },
  'JourniTrip/chat_images': {
    errorMessage: 'Lỗi upload ảnh chat',
  },
};

/**
 * Hàm chuẩn hóa việc upload file ảnh Multer lên Cloudinary theo folder:
 * - Kiểm tra file tồn tại và size > 0
 * - Tự động áp dụng preset chuẩn của folder (transformation, errorMessage, ...)
 * - Mặc định resource_type = 'image', allowed_formats = ['jpg', 'jpeg', 'png', 'webp']
 * - Upload buffer lên Cloudinary và trả về { url: secure_url }
 * - Xử lý lỗi và ném InternalServerErrorException chuẩn NestJS
 */
export async function uploadToFolder(
  cloudinaryService: CloudinaryService,
  file: Express.Multer.File,
  folderOrOptions: string | FolderUploadOptions,
  logger?: Logger,
): Promise<{ url: string }> {
  if (!file || !file.size) {
    throw new BadRequestException('Không tìm thấy file để upload');
  }

  const folderName =
    typeof folderOrOptions === 'string'
      ? folderOrOptions
      : folderOrOptions.folder;

  const preset = FOLDER_PRESETS[folderName] || {};

  const options: FolderUploadOptions =
    typeof folderOrOptions === 'string'
      ? { folder: folderName, ...preset }
      : { ...preset, ...folderOrOptions };

  try {
    const result = await cloudinaryService.uploadBuffer(file.buffer, {
      folder: options.folder,
      resource_type: options.resourceType || 'image',
      allowed_formats: options.allowedFormats || ['jpg', 'jpeg', 'png', 'webp'],
      transformation: options.transformation,
    });
    return { url: result.secure_url };
  } catch (error) {
    const uploadError = error as Error;
    if (logger) {
      logger.error(`[Upload Error] ${options.folder}`, uploadError);
    }
    const message = uploadError.message || 'Lỗi không xác định';
    throw new InternalServerErrorException(
      options.errorMessage
        ? `${options.errorMessage}: ${message}`
        : `Lỗi khi upload lên Cloudinary: ${message}`,
    );
  }
}

export const uploadImageToFolder = uploadToFolder;
export const useFolderUpload = uploadToFolder;
