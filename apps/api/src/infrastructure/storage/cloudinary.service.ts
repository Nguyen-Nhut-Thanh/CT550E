import { Injectable } from '@nestjs/common';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_KEY,
            api_secret: process.env.CLOUDINARY_SECRET,
        });
    }
    uploadBuffer(buffer: Buffer, options: UploadApiOptions): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
                if (error || !result) {
                    return reject(error ?? new Error('Upload image failed'));
                }
                resolve(result);
            });
            stream.end(buffer);
        });
    }
}
