"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Configurar Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// Función para subir una imagen a Cloudinary
const uploadToCloudinary = async (file, folder) => {
    return new Promise((resolve, reject) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        cloudinary_1.v2.uploader.upload(dataURI, {
            folder: folder,
            resource_type: 'auto'
        }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve((result === null || result === void 0 ? void 0 : result.secure_url) || '');
        });
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
// Función para eliminar una imagen de Cloudinary
const deleteFromCloudinary = async (publicUrl) => {
    const publicId = publicUrl.split('/').slice(-1)[0].split('.')[0];
    return new Promise((resolve, reject) => {
        cloudinary_1.v2.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = cloudinary_1.v2;
