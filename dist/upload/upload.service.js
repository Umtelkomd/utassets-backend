"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = exports.UploadService = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
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
            const result = await cloudinary_1.v2.uploader.upload(file.path, {
                folder: folder || 'uploads',
                resource_type: 'auto'
            });
            // Eliminar archivo temporal
            if (fs_1.default.existsSync(file.path)) {
                fs_1.default.unlinkSync(file.path);
            }
            return result;
        }
        catch (error) {
            // Eliminar archivo temporal en caso de error
            if (fs_1.default.existsSync(file.path)) {
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
