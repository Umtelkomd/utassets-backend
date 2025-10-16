import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { Readable } from 'stream';

// Definir tipo para archivo
interface UploadFile {
    path?: string;
    buffer?: Buffer;
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
            let result;

            // Si el archivo está en memoria (buffer), usar upload_stream
            if (file.buffer) {
                result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: folder || 'uploads',
                            resource_type: 'auto'
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );

                    // Crear un stream desde el buffer y enviarlo a Cloudinary
                    if (file.buffer) {
                        const bufferStream = Readable.from(file.buffer);
                        bufferStream.pipe(uploadStream);
                    } else {
                        reject(new Error('Buffer no disponible'));
                    }
                });
            }
            // Si el archivo está en disco (path), usar upload tradicional
            else if (file.path) {
                result = await cloudinary.uploader.upload(file.path, {
                    folder: folder || 'uploads',
                    resource_type: 'auto'
                });

                // Eliminar archivo temporal
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            } else {
                throw new Error('El archivo no tiene ni buffer ni path');
            }

            return result;
        } catch (error) {
            // Eliminar archivo temporal en caso de error (solo si existe path)
            if (file.path && fs.existsSync(file.path)) {
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