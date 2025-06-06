import { Request, Response } from 'express';
import { Vacation, VacationType } from '../entity/Vacation';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';
import { Between, In } from 'typeorm';

export class VacationController {
    private vacationRepository = AppDataSource.getRepository(Vacation);
    private userRepository = AppDataSource.getRepository(User);

    // Obtener todas las vacaciones del año actual
    async getAllVacations(req: Request, res: Response): Promise<Response> {
        try {
            const { year } = req.query;
            const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);

            const vacations = await this.vacationRepository.find({
                where: {
                    date: Between(startDate, endDate)
                },
                relations: ['user', 'approvedBy'],
                order: {
                    date: 'ASC'
                }
            });

            return res.json(vacations);
        } catch (error) {
            console.error('Error al obtener vacaciones:', error);
            return res.status(500).json({ message: 'Error al obtener vacaciones' });
        }
    }

    // Obtener vacaciones de un usuario específico
    async getUserVacations(req: Request, res: Response): Promise<Response> {
        try {
            const { userId } = req.params;
            const { year } = req.query;
            const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);

            const vacations = await this.vacationRepository.find({
                where: {
                    userId: parseInt(userId),
                    date: Between(startDate, endDate)
                },
                relations: ['user', 'approvedBy'],
                order: {
                    date: 'ASC'
                }
            });

            return res.json(vacations);
        } catch (error) {
            console.error('Error al obtener vacaciones del usuario:', error);
            return res.status(500).json({ message: 'Error al obtener vacaciones del usuario' });
        }
    }

    // Calcular días disponibles de un usuario
    async getUserAvailableDays(req: Request, res: Response): Promise<Response> {
        try {
            const { userId } = req.params;
            const { year } = req.query;
            const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);

            const vacations = await this.vacationRepository.find({
                where: {
                    userId: parseInt(userId),
                    date: Between(startDate, endDate),
                    isApproved: true
                }
            });

            const restDays = vacations.filter(v => v.type === VacationType.REST_DAY).length;
            const extraWorkDays = vacations.filter(v => v.type === VacationType.EXTRA_WORK_DAY).length;

            const availableDays = 25 + extraWorkDays - restDays;

            return res.json({
                totalDays: 25,
                extraWorkDays,
                usedRestDays: restDays,
                availableDays,
                year: currentYear
            });
        } catch (error) {
            console.error('Error al calcular días disponibles:', error);
            return res.status(500).json({ message: 'Error al calcular días disponibles' });
        }
    }

    // Obtener resumen de días disponibles de todos los usuarios
    async getAllUsersAvailableDays(req: Request, res: Response): Promise<Response> {
        try {
            const { year } = req.query;
            const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

            const users = await this.userRepository.find({
                where: { isActive: true },
                select: ['id', 'fullName', 'photoUrl', 'email']
            });

            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);

            const usersWithDays = await Promise.all(
                users.map(async (user) => {
                    const vacations = await this.vacationRepository.find({
                        where: {
                            userId: user.id,
                            date: Between(startDate, endDate),
                            isApproved: true
                        }
                    });

                    const restDays = vacations.filter(v => v.type === VacationType.REST_DAY).length;
                    const extraWorkDays = vacations.filter(v => v.type === VacationType.EXTRA_WORK_DAY).length;
                    const availableDays = 25 + extraWorkDays - restDays;

                    return {
                        ...user,
                        totalDays: 25,
                        extraWorkDays,
                        usedRestDays: restDays,
                        availableDays,
                        year: currentYear
                    };
                })
            );

            return res.json(usersWithDays);
        } catch (error) {
            console.error('Error al obtener días disponibles de todos los usuarios:', error);
            return res.status(500).json({ message: 'Error al obtener días disponibles' });
        }
    }

    // Crear una nueva solicitud de vacación (una o múltiples fechas)
    async createVacation(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, date, endDate, type, description } = req.body;
            const currentUserId = req.user?.id;

            // Validar campos requeridos
            if (!userId || !date || !type) {
                return res.status(400).json({
                    message: 'Faltan campos requeridos: userId, date o type'
                });
            }

            // Validar tipo
            if (!Object.values(VacationType).includes(type)) {
                return res.status(400).json({
                    message: 'Tipo de vacación inválido'
                });
            }

            // Verificar si el usuario existe
            const user = await this.userRepository.findOne({ where: { id: parseInt(userId) } });
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            // Determinar el rango de fechas
            const startDate = new Date(date);
            const finalEndDate = endDate ? new Date(endDate) : startDate;

            // Validar que la fecha de fin no sea anterior a la de inicio
            if (finalEndDate < startDate) {
                return res.status(400).json({
                    message: 'La fecha de fin no puede ser anterior a la fecha de inicio'
                });
            }

            // Generar array de fechas en el rango
            const dates = [];
            const currentDate = new Date(startDate);
            while (currentDate <= finalEndDate) {
                dates.push(new Date(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Verificar si ya existen vacaciones para alguna de las fechas
            const existingVacations = await this.vacationRepository.find({
                where: {
                    userId: parseInt(userId),
                    date: In(dates)
                }
            });

            if (existingVacations.length > 0) {
                const existingDates = existingVacations.map(v =>
                    new Date(v.date).toLocaleDateString('es-ES')
                );
                return res.status(400).json({
                    message: `Ya existen solicitudes de vacación para las siguientes fechas: ${existingDates.join(', ')}`
                });
            }

            // Crear las vacaciones para todas las fechas del rango
            const vacationsToCreate = dates.map(dateItem =>
                this.vacationRepository.create({
                    userId: parseInt(userId),
                    date: dateItem,
                    type,
                    description,
                    isApproved: true,
                    approvedDate: new Date(),
                    approvedBy: { id: currentUserId }
                })
            );

            await this.vacationRepository.save(vacationsToCreate);

            // Obtener las vacaciones creadas con las relaciones
            const savedVacations = await this.vacationRepository.find({
                where: {
                    userId: parseInt(userId),
                    date: In(dates)
                },
                relations: ['user', 'approvedBy'],
                order: { date: 'ASC' }
            });

            return res.status(201).json({
                message: `Se crearon ${dates.length} día(s) de vacación correctamente`,
                vacations: savedVacations,
                count: dates.length
            });
        } catch (error) {
            console.error('Error al crear vacación:', error);
            return res.status(500).json({ message: 'Error al crear vacación' });
        }
    }

    // Eliminar una vacación
    async deleteVacation(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            const vacation = await this.vacationRepository.findOne({
                where: { id: parseInt(id) }
            });

            if (!vacation) {
                return res.status(404).json({ message: 'Vacación no encontrada' });
            }

            await this.vacationRepository.remove(vacation);

            return res.json({ message: 'Vacación eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar vacación:', error);
            return res.status(500).json({ message: 'Error al eliminar vacación' });
        }
    }

    // Obtener conflictos para una fecha específica
    async getDateConflicts(req: Request, res: Response): Promise<Response> {
        try {
            const { date } = req.params;

            const vacations = await this.vacationRepository.find({
                where: {
                    date: new Date(date),
                    type: VacationType.REST_DAY,
                    isApproved: true
                },
                relations: ['user'],
                select: {
                    id: true,
                    date: true,
                    user: {
                        id: true,
                        fullName: true,
                        photoUrl: true
                    }
                }
            });

            return res.json(vacations);
        } catch (error) {
            console.error('Error al obtener conflictos de fecha:', error);
            return res.status(500).json({ message: 'Error al obtener conflictos de fecha' });
        }
    }

    // Obtener vacaciones por rango de fechas
    async getVacationsByDateRange(req: Request, res: Response): Promise<Response> {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    message: 'Se requieren las fechas de inicio y fin'
                });
            }

            const vacations = await this.vacationRepository.find({
                where: {
                    date: Between(new Date(startDate as string), new Date(endDate as string)),
                    isApproved: true
                },
                relations: ['user'],
                order: {
                    date: 'ASC'
                }
            });

            return res.json(vacations);
        } catch (error) {
            console.error('Error al obtener vacaciones por rango de fechas:', error);
            return res.status(500).json({ message: 'Error al obtener vacaciones por rango de fechas' });
        }
    }
}

export const vacationController = new VacationController(); 