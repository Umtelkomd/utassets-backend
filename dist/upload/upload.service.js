"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = exports.UploadService = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const stream_1 = require("stream");
// Configurar Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class UploadService {
    // Método para subir archivos a Cloudinary
    async uploadImage(file, folder) {
        try {
            let result;
            // Si el archivo está en memoria (buffer), usar upload_stream
            if (file.buffer) {
                result = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                        folder: folder || 'uploads',
                        resource_type: 'auto'
                    }, (error, result) => {
                        if (error)
                            reject(error);
                        else
                            resolve(result);
                    });
                    // Crear un stream desde el buffer y enviarlo a Cloudinary
                    if (file.buffer) {
                        const bufferStream = stream_1.Readable.from(file.buffer);
                        bufferStream.pipe(uploadStream);
                    }
                    else {
                        reject(new Error('Buffer no disponible'));
                    }
                });
            }
            // Si el archivo está en disco (path), usar upload tradicional
            else if (file.path) {
                result = await cloudinary_1.v2.uploader.upload(file.path, {
                    folder: folder || 'uploads',
                    resource_type: 'auto'
                });
                // Eliminar archivo temporal
                if (fs_1.default.existsSync(file.path)) {
                    fs_1.default.unlinkSync(file.path);
                }
            }
            else {
                throw new Error('El archivo no tiene ni buffer ni path');
            }
            return result;
        }
        catch (error) {
            // Eliminar archivo temporal en caso de error (solo si existe path)
            if (file.path && fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            throw error;
        }
    }
    // Método para eliminar archivos de Cloudinary
    async deleteImage(publicId) {
        try {
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    // Método para actualizar imagen (eliminar anterior y subir nueva)
    async updateImage(file, oldPublicId, folder) {
        try {
            // Si hay una imagen anterior, eliminarla
            if (oldPublicId) {
                await this.deleteImage(oldPublicId);
            }
            // Subir nueva imagen
            const result = await this.uploadImage(file, folder);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.UploadService = UploadService;
// Exportar instancia singleton
exports.uploadService = new UploadService();
