import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
    BadRequestException,
    UseGuards
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { uploadSingle } from '../middlewares/uploadMiddleware';

@Controller('api/upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
    constructor(private readonly uploadService: UploadService) { }

    @Post()
    @UseInterceptors(uploadSingle('image'))
    async uploadImage(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: { entityType: string }
    ) {
        if (!file) {
            throw new BadRequestException('No se proporcionó ningún archivo');
        }

        if (!body.entityType) {
            throw new BadRequestException('El tipo de entidad es requerido');
        }

        try {
            const result = await this.uploadService.uploadImage(file, body.entityType);

            return {
                message: 'Imagen subida exitosamente',
                ...result
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new BadRequestException(error.message);
            }
            throw new BadRequestException('Error al procesar la imagen');
        }
    }
} 