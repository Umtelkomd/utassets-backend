import { Request, Response } from 'express';
import { HolidayRepository } from '../repositories/HolidayRepository';
import { userRepository } from '../repositories/UserRepository';

export class HolidayController {
    // Obtener todos los festivos de un usuario
    async getHolidaysByUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                return res.status(400).json({ message: 'ID de usuario inválido' });
            }

            const user = await userRepository.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const holidays = await HolidayRepository.findByUserId(userId);
            return res.json(holidays);
        } catch (error) {
            console.error('Error al obtener festivos:', error);
            return res.status(500).json({ message: 'Error al obtener festivos' });
        }
    }

    // Obtener festivos de un usuario en un rango de fechas
    async getHolidaysByUserAndDateRange(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);
            const { startDate, endDate } = req.query;

            if (isNaN(userId)) {
                return res.status(400).json({ message: 'ID de usuario inválido' });
            }

            if (!startDate || !endDate) {
                return res.status(400).json({ message: 'Se requieren startDate y endDate' });
            }

            const holidays = await HolidayRepository.findByUserIdAndDateRange(
                userId,
                new Date(startDate as string),
                new Date(endDate as string)
            );

            return res.json(holidays);
        } catch (error) {
            console.error('Error al obtener festivos por rango:', error);
            return res.status(500).json({ message: 'Error al obtener festivos' });
        }
    }

    // Crear un nuevo festivo
    async createHoliday(req: Request, res: Response) {
        try {
            const { date, name, description, userId } = req.body;

            if (!date || !name || !userId) {
                return res.status(400).json({ message: 'Faltan campos requeridos: date, name, userId' });
            }

            // Verificar que el usuario existe
            const user = await userRepository.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Verificar si ya existe un festivo en esa fecha para ese usuario
            const existingHoliday = await HolidayRepository.findByDate(userId, new Date(date));
            if (existingHoliday) {
                return res.status(409).json({ message: 'Ya existe un festivo en esta fecha para este usuario' });
            }

            const holiday = await HolidayRepository.createHoliday({
                date: new Date(date),
                name,
                description,
                userId
            });

            return res.status(201).json(holiday);
        } catch (error) {
            console.error('Error al crear festivo:', error);
            return res.status(500).json({ message: 'Error al crear festivo' });
        }
    }

    // Crear múltiples festivos (bulk)
    async createMultipleHolidays(req: Request, res: Response) {
        try {
            const { holidays } = req.body;

            if (!Array.isArray(holidays) || holidays.length === 0) {
                return res.status(400).json({ message: 'Se requiere un array de festivos' });
            }

            const createdHolidays = [];
            const errors = [];

            for (const holiday of holidays) {
                try {
                    const { date, name, description, userId } = holiday;

                    if (!date || !name || !userId) {
                        errors.push({ holiday, error: 'Faltan campos requeridos' });
                        continue;
                    }

                    // Verificar que el usuario existe
                    const user = await userRepository.getUserById(userId);
                    if (!user) {
                        errors.push({ holiday, error: 'Usuario no encontrado' });
                        continue;
                    }

                    // Verificar si ya existe
                    const existingHoliday = await HolidayRepository.findByDate(userId, new Date(date));
                    if (existingHoliday) {
                        errors.push({ holiday, error: 'Ya existe un festivo en esta fecha' });
                        continue;
                    }

                    const created = await HolidayRepository.createHoliday({
                        date: new Date(date),
                        name,
                        description,
                        userId
                    });

                    createdHolidays.push(created);
                } catch (error) {
                    errors.push({ holiday, error: error instanceof Error ? error.message : 'Error desconocido' });
                }
            }

            return res.status(201).json({
                created: createdHolidays,
                errors: errors.length > 0 ? errors : undefined
            });
        } catch (error) {
            console.error('Error al crear festivos múltiples:', error);
            return res.status(500).json({ message: 'Error al crear festivos' });
        }
    }

    // Actualizar un festivo
    async updateHoliday(req: Request, res: Response) {
        try {
            const holidayId = parseInt(req.params.id);
            const { name, description } = req.body;

            if (isNaN(holidayId)) {
                return res.status(400).json({ message: 'ID de festivo inválido' });
            }

            const holiday = await HolidayRepository.findOneBy({ id: holidayId });
            if (!holiday) {
                return res.status(404).json({ message: 'Festivo no encontrado' });
            }

            if (name) holiday.name = name;
            if (description !== undefined) holiday.description = description;

            const updated = await HolidayRepository.save(holiday);
            return res.json(updated);
        } catch (error) {
            console.error('Error al actualizar festivo:', error);
            return res.status(500).json({ message: 'Error al actualizar festivo' });
        }
    }

    // Eliminar un festivo
    async deleteHoliday(req: Request, res: Response) {
        try {
            const holidayId = parseInt(req.params.id);

            if (isNaN(holidayId)) {
                return res.status(400).json({ message: 'ID de festivo inválido' });
            }

            const holiday = await HolidayRepository.findOneBy({ id: holidayId });
            if (!holiday) {
                return res.status(404).json({ message: 'Festivo no encontrado' });
            }

            await HolidayRepository.delete(holidayId);
            return res.json({ message: 'Festivo eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar festivo:', error);
            return res.status(500).json({ message: 'Error al eliminar festivo' });
        }
    }

    // Eliminar todos los festivos de un usuario
    async deleteAllHolidaysByUser(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);

            if (isNaN(userId)) {
                return res.status(400).json({ message: 'ID de usuario inválido' });
            }

            await HolidayRepository.delete({ userId });
            return res.json({ message: 'Festivos eliminados correctamente' });
        } catch (error) {
            console.error('Error al eliminar festivos:', error);
            return res.status(500).json({ message: 'Error al eliminar festivos' });
        }
    }
}
