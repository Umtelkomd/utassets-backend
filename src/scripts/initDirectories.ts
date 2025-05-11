import * as fs from 'fs';
import * as path from 'path';

const createDirectoryIfNotExists = (dirPath: string) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Directorio creado: ${dirPath}`);
    }
};

const initDirectories = () => {
    const baseDir = path.join(__dirname, '..', '..');

    // Crear directorio de uploads
    const uploadsDir = path.join(baseDir, 'uploads');
    createDirectoryIfNotExists(uploadsDir);

    // Crear subdirectorios
    const subDirs = ['users', 'vehicles', 'inventory'];
    subDirs.forEach(dir => {
        createDirectoryIfNotExists(path.join(uploadsDir, dir));
    });
};

// Ejecutar la función
initDirectories(); 