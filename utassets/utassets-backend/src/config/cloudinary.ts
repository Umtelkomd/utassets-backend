import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Función para subir una imagen a Cloudinary
export const uploadToCloudinary = async (file: Express.Multer.File, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const b64 = Buffer.from(file.buffer).toString('base64');
        const dataURI = `data:${file.mimetype};base64,${b64}`;

        cloudinary.uploader.upload(dataURI, {
            folder: folder,
            resource_type: 'auto'
        }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(result?.secure_url || '');
        });
    });
};

// Función para eliminar una imagen de Cloudinary
export const deleteFromCloudinary = async (publicUrl: string): Promise<void> => {
    const publicId = publicUrl.split('/').slice(-1)[0].split('.')[0];
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
};

export default cloudinary; 