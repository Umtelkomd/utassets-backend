import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
    constructor(private configService: ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: this.configService.get('CLOUDINARY_API_KEY'),
            api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
        });
    }

    async uploadImage(file: Express.Multer.File, entityType: string) {
        try {
            // Convertir el buffer a base64 para Cloudinary
            const b64 = Buffer.from(file.buffer).toString('base64');
            const dataURI = `data:${file.mimetype};base64,${b64}`;

            const result = await cloudinary.uploader.upload(dataURI, {
                folder: `utassets/${entityType}`,
                transformation: [
                    { width: 800, height: 600, crop: 'fill' },
                    { quality: 'auto' },
                    { format: 'webp' }
                ],
                public_id: `${entityType}_${Date.now()}`,
            });

            return {
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
            };
        } catch (error: any) {
            throw new Error(`Error al subir a Cloudinary: ${error.message}`);
        }
    }

    async deleteImage(publicId: string) {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error: any) {
            throw new Error(`Error al eliminar de Cloudinary: ${error.message}`);
        }
    }
} 