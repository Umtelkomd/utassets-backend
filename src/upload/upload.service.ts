import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Definir tipo para archivo
interface UploadFile {
    path: string;
    filename?: string;
    originalname?: string;
    mimetype?: string;
    size?: number;
}

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class UploadService {
    // Método para subir archivos a Cloudinary
    async uploadImage(file: UploadFile, folder?: string): Promise<any> {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: folder || 'uploads',
                resource_type: 'auto'
            });

            // Eliminar archivo temporal
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            return result;
        } catch (error) {
            // Eliminar archivo temporal en caso de error
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            throw error;
        }
    }

    // Método para eliminar archivos de Cloudinary
    async deleteImage(publicId: string): Promise<any> {
        try {
            const result = await cloudinary.uploader.destroy(publicId);
            return result;
        } catch (error) {
            throw error;
        }
    }

    // Método para actualizar imagen (eliminar anterior y subir nueva)
    async updateImage(file: UploadFile, oldPublicId?: string, folder?: string): Promise<any> {
        try {
            // Si hay una imagen anterior, eliminarla
            if (oldPublicId) {
                await this.deleteImage(oldPublicId);
            }

            // Subir nueva imagen
            const result = await this.uploadImage(file, folder);
            return result;
        } catch (error) {
            throw error;
        }
    }
}

// Exportar instancia singleton
export const uploadService = new UploadService(); 