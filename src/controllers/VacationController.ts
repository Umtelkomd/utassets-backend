import { Request, Response } from 'express';
import { Vacation, VacationType, VacationStatus } from '../entity/Vacation';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';
import { Between, In } from 'typeorm';
import { slackNotificationService } from '../services/SlackNotificationService';
import { calculateWorkingDays, calculateWorkingDaysExcluding, calculateSaturdays, isSaturday } from '../utils/dateUtils';
import { HolidayRepository } from '../repositories/HolidayRepository';

export class VacationController {
    private vacationRepository = AppDataSource.getRepository(Vacation);
    private userRepository = AppDataSource.getRepository(User);

    // Obtener todas las vacaciones del año actual
    async getAllVacations(req: Request, res: Response): Promise<Response> {
        try {
            const { year, onlyApproved } = req.query;
            const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);

            // Configurar filtros base
            const whereConditions: any = [
                {
                    startDate: Between(startDate, endDate)
                },
                {
                    endDate: Between(startDate, endDate)
                },
                // También incluir rangos que abarcen el año completo
                {
                    startDate: Between(new Date(currentYear - 1, 11, 1), startDate),
                    endDate: Between(endDate, new Date(currentYear + 1, 0, 31))
                }
            ];

            // Si se solicita solo las aprobadas, agregar filtro de estado
            if (onlyApproved === 'true') {
                whereConditions.forEach((condition: any) => {
                    condition.status = VacationStatus.FULLY_APPROVED;
                });
            }

            const vacations = await this.vacationRepository.find({
                where: whereConditions,
                relations: ['user', 'approvedBy', 'firstApprovedBy', 'secondApprovedBy', 'rejectedBy'],
                order: {
                    startDate: 'ASC'
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
            const { year, onlyApproved } = req.query;
            const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);

            // Configurar filtros base
            const whereConditions: any = [
                {
                    userId: parseInt(userId),
                    startDate: Between(startDate, endDate)
                },
                {
                    userId: parseInt(userId),
                    endDate: Between(startDate, endDate)
                },
                // También incluir rangos que abarcen el año completo
                {
                    userId: parseInt(userId),
                    startDate: Between(new Date(currentYear - 1, 11, 1), startDate),
                    endDate: Between(endDate, new Date(currentYear + 1, 0, 31))
                }
            ];

            // Si se solicita solo las aprobadas, agregar filtro de estado
            if (onlyApproved === 'true') {
                whereConditions.forEach((condition: any) => {
                    condition.status = VacationStatus.FULLY_APPROVED;
                });
            }

            const vacations = await this.vacationRepository.find({
                where: whereConditions,
                relations: ['user', 'approvedBy', 'firstApprovedBy', 'secondApprovedBy', 'rejectedBy'],
                order: {
                    startDate: 'ASC'
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

            // Obtener los días de vacaciones personalizados del usuario
            const user = await this.userRepository.findOne({
                where: { id: parseInt(userId) },
                select: ['vacationDays']
            });

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const userVacationDays = user.vacationDays || 25; // Fallback a 25 días

            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);

            // Solo contar vacaciones completamente aprobadas
            const whereConditions = [
                {
                    userId: parseInt(userId),
                    status: VacationStatus.FULLY_APPROVED,
                    startDate: Between(startDate, endDate)
                },
                {
                    userId: parseInt(userId),
                    status: VacationStatus.FULLY_APPROVED,
                    endDate: Between(startDate, endDate)
                },
                // También incluir rangos que abarcen el año completo
                {
                    userId: parseInt(userId),
                    status: VacationStatus.FULLY_APPROVED,
                    startDate: Between(new Date(currentYear - 1, 11, 1), startDate),
                    endDate: Between(endDate, new Date(currentYear + 1, 0, 31))
                }
            ];

            const vacations = await this.vacationRepository.find({
                where: whereConditions
            });

            // Calcular días totales considerando los rangos
            let restDays = 0;
            let extraWorkDays = 0;

            vacations.forEach(vacation => {
                const dayCount = vacation.workingDays || vacation.dayCount; // Usar workingDays si está disponible, fallback a dayCount
                if (vacation.type === VacationType.REST_DAY) {
                    restDays += dayCount;
                } else {
                    extraWorkDays += dayCount;
                }
            });

            const availableDays = userVacationDays + extraWorkDays - restDays;

            return res.json({
                totalDays: userVacationDays,
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
                select: ['id', 'fullName', 'photoUrl', 'email', 'vacationDays']
            });

            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);

            const usersWithDays = await Promise.all(
                users.map(async (user) => {
                    // Solo contar vacaciones completamente aprobadas
                    const whereConditions = [
                        {
                            userId: user.id,
                            status: VacationStatus.FULLY_APPROVED,
                            startDate: Between(startDate, endDate)
                        },
                        {
                            userId: user.id,
                            status: VacationStatus.FULLY_APPROVED,
                            endDate: Between(startDate, endDate)
                        },
                        // También incluir rangos que abarcen el año completo
                        {
                            userId: user.id,
                            status: VacationStatus.FULLY_APPROVED,
                            startDate: Between(new Date(currentYear - 1, 11, 1), startDate),
                            endDate: Between(endDate, new Date(currentYear + 1, 0, 31))
                        }
                    ];

                    const vacations = await this.vacationRepository.find({
                        where: whereConditions
                    });

                    // Calcular días totales considerando los rangos
                    let restDays = 0;
                    let extraWorkDays = 0;

                    vacations.forEach(vacation => {
                        const dayCount = vacation.workingDays || vacation.dayCount; // Usar workingDays si está disponible, fallback a dayCount
                        if (vacation.type === VacationType.REST_DAY) {
                            restDays += dayCount;
                        } else {
                            extraWorkDays += dayCount;
                        }
                    });

                    const userVacationDays = user.vacationDays || 25; // Fallback a 25 días
                    const availableDays = userVacationDays + extraWorkDays - restDays;

                    return {
                        ...user,
                        totalDays: userVacationDays,
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

    // Crear una nueva solicitud de vacación por rango
    async createVacation(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, date, endDate, type, description } = req.body;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const currentUserId = req.userId;
            const currentUserRole = req.userRole;

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

            // Verificar si el usuario existe y obtener sus días de vacaciones
            const user = await this.userRepository.findOne({
                where: { id: parseInt(userId) },
                select: ['id', 'fullName', 'email', 'vacationDays']
            });
            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const userVacationDays = user.vacationDays || 25; // Fallback a 25 días

            // Determinar fechas del rango
            const startDate = new Date(date);
            const finalEndDate = endDate ? new Date(endDate) : startDate;

            // Validar que la fecha de fin no sea anterior a la de inicio
            if (finalEndDate < startDate) {
                return res.status(400).json({
                    message: 'La fecha de fin no puede ser anterior a la fecha de inicio'
                });
            }

            // Verificar si ya existen vacaciones que se solapen con este rango
            const overlappingVacations = await this.vacationRepository
                .createQueryBuilder('vacation')
                .where('vacation.userId = :userId', { userId: parseInt(userId) })
                .andWhere(
                    '(vacation.startDate <= :endDate AND vacation.endDate >= :startDate)',
                    { startDate, endDate: finalEndDate }
                )
                .getMany();

            if (overlappingVacations.length > 0) {
                return res.status(400).json({
                    message: `Ya existe una solicitud de vacación que se solapa con este rango de fechas`
                });
            }

            // Validar días disponibles solo para días de descanso
            if (type === VacationType.REST_DAY) {
                // Obtener festivos del usuario en el rango de fechas
                const holidays = await HolidayRepository.findByUserIdAndDateRange(
                    parseInt(userId),
                    startDate,
                    finalEndDate
                );
                const holidayDates = holidays.map((h: { date: Date }) => h.date);

                const requestedDays = calculateWorkingDaysExcluding(startDate, finalEndDate, holidayDates);

                // Validar que el número de días solicitados sea razonable
                if (requestedDays === 0) {
                    return res.status(400).json({
                        message: `El rango de fechas seleccionado no incluye días laborales. Por favor, selecciona un período que contenga al menos un día hábil (lunes a viernes) que no sea festivo.`
                    });
                }
                
                if (requestedDays < 1 || requestedDays > 365) {
                    return res.status(400).json({
                        message: `El número de días solicitados (${requestedDays}) no es válido. Debe estar entre 1 y 365 días.`
                    });
                }

                // Validar que las fechas sean válidas
                if (isNaN(startDate.getTime()) || isNaN(finalEndDate.getTime())) {
                    return res.status(400).json({
                        message: 'Las fechas proporcionadas no son válidas.'
                    });
                }

                // Calcular días disponibles actuales
                const currentYear = startDate.getFullYear();
                const yearStartDate = new Date(currentYear, 0, 1);
                const yearEndDate = new Date(currentYear, 11, 31);

                const whereConditions = [
                    {
                        userId: parseInt(userId),
                        status: VacationStatus.FULLY_APPROVED,
                        startDate: Between(yearStartDate, yearEndDate)
                    },
                    {
                        userId: parseInt(userId),
                        status: VacationStatus.FULLY_APPROVED,
                        endDate: Between(yearStartDate, yearEndDate)
                    },
                    // También incluir rangos que abarcen el año completo
                    {
                        userId: parseInt(userId),
                        status: VacationStatus.FULLY_APPROVED,
                        startDate: Between(new Date(currentYear - 1, 11, 1), yearStartDate),
                        endDate: Between(yearEndDate, new Date(currentYear + 1, 0, 31))
                    }
                ];

                const existingVacations = await this.vacationRepository.find({
                    where: whereConditions
                });

                // Calcular días totales considerando los rangos
                let restDays = 0;
                let extraWorkDays = 0;

                existingVacations.forEach(vacation => {
                    const dayCount = vacation.workingDays || vacation.dayCount; // Usar workingDays si está disponible, fallback a dayCount
                    if (vacation.type === VacationType.REST_DAY) {
                        restDays += dayCount;
                    } else {
                        extraWorkDays += dayCount;
                    }
                });


                const availableDays = userVacationDays + extraWorkDays - restDays;

                // Log para debugging
                console.log('Vacation Request Validation:', {
                    userId: userId,
                    userName: user.fullName,
                    userVacationDays: userVacationDays,
                    requestedDays: requestedDays,
                    restDays: restDays,
                    extraWorkDays: extraWorkDays,
                    availableDays: availableDays,
                    startDate: startDate.toISOString(),
                    endDate: finalEndDate.toISOString(),
                    type: type
                });

                if (requestedDays > availableDays) {
                    return res.status(400).json({
                        message: `No tienes suficientes días disponibles. Solicitas ${requestedDays} días, pero solo tienes ${availableDays} días disponibles.`,
                        availableDays,
                        requestedDays,
                        usedRestDays: restDays,
                        extraWorkDays,
                        totalDays: userVacationDays
                    });
                }
            }

            // Determinar el estado inicial según el rol del usuario
            let initialStatus = VacationStatus.PENDING;
            let isAutoApproved = false;

            // Si es administrador creando para sí mismo, auto-aprobar completamente
            if (currentUserRole === 'administrador' && currentUserId === parseInt(userId)) {
                initialStatus = VacationStatus.FULLY_APPROVED;
                isAutoApproved = true;
            }

            // Validar que para días extra solo se seleccionen sábados
            if (type === VacationType.EXTRA_WORK_DAY) {
                console.log('🚨 DEBUG: Validando días extra - tipo:', type);
                console.log('🚨 DEBUG: Fecha inicio:', startDate, 'Día de la semana:', startDate.getDay());
                console.log('🚨 DEBUG: Fecha fin:', finalEndDate, 'Día de la semana:', finalEndDate.getDay());
                
                const validateOnlySaturdays = (start: Date, end: Date): boolean => {
                    const current = new Date(start);
                    while (current <= end) {
                        const dayOfWeek = current.getDay();
                        console.log('🚨 DEBUG: Validando fecha:', current, 'Día:', dayOfWeek, 'Es sábado:', dayOfWeek === 6);
                        if (!isSaturday(current)) {
                            console.log('🚨 DEBUG: RECHAZADO - No es sábado:', current);
                            return false; // No es sábado
                        }
                        current.setDate(current.getDate() + 1);
                    }
                    return true;
                };

                if (!validateOnlySaturdays(startDate, finalEndDate)) {
                    console.log('🚨 DEBUG: VALIDACIÓN FALLIDA - Rechazando solicitud');
                    return res.status(400).json({
                        message: 'Para días de trabajo extra solo se pueden seleccionar sábados. Por favor, selecciona únicamente fechas que sean sábados.'
                    });
                }
                
                console.log('🚨 DEBUG: VALIDACIÓN EXITOSA - Todos los días son sábados');

                // Validar que no sea el sábado actual
                const today = new Date();
                const isToday = startDate.toDateString() === today.toDateString();
                
                if (isToday && isSaturday(today)) {
                    return res.status(400).json({
                        message: 'No puedes seleccionar el sábado actual. Por favor, selecciona un sábado futuro.'
                    });
                }
            }

            // Calcular los días según el tipo de vacación
            let workingDays: number;
            if (type === VacationType.EXTRA_WORK_DAY) {
                // Para días extra, contar solo los sábados
                workingDays = calculateSaturdays(startDate, finalEndDate);
            } else {
                // Para días de descanso, excluir festivos del cálculo
                const holidays = await HolidayRepository.findByUserIdAndDateRange(
                    parseInt(userId),
                    startDate,
                    finalEndDate
                );
                const holidayDates = holidays.map((h: { date: Date }) => h.date);
                workingDays = calculateWorkingDaysExcluding(startDate, finalEndDate, holidayDates);
            }

            // Crear la vacación
            const vacationData: Partial<Vacation> = {
                userId: parseInt(userId),
                startDate,
                endDate: finalEndDate,
                type,
                description,
                status: initialStatus,
                isApproved: isAutoApproved,
                workingDays
            };

            // Si es auto-aprobada, establecer las aprobaciones
            if (isAutoApproved && currentUserId) {
                const approver = { id: currentUserId } as User;
                vacationData.firstApprovedBy = approver;
                vacationData.firstApprovedDate = new Date();
                vacationData.secondApprovedBy = approver;
                vacationData.secondApprovedDate = new Date();
                vacationData.approvedBy = approver;
                vacationData.approvedDate = new Date();
            }

            const savedVacation = await this.vacationRepository.save(vacationData);

            // Obtener la vacación creada con las relaciones
            const vacationWithRelations = await this.vacationRepository.findOne({
                where: { id: savedVacation.id },
                relations: ['user', 'approvedBy', 'firstApprovedBy', 'secondApprovedBy']
            });

            const dayCount = vacationWithRelations?.dayCount || 1;
            const statusMessage = isAutoApproved
                ? `Se creó la vacación de ${dayCount} día(s) correctamente`
                : `Se envió la solicitud de vacación de ${dayCount} día(s). Requiere aprobación de dos administradores.`;

            // Enviar notificación de Slack solo para solicitudes nuevas (no auto-aprobadas)
            if (!isAutoApproved && vacationWithRelations) {
                try {
                    const allDates = vacationWithRelations.getAllDatesInRange();
                    await slackNotificationService.sendVacationRequestNotification({
                        user,
                        dates: allDates,
                        type,
                        description
                    });
                } catch (error) {
                    console.error('Error al enviar notificación de Slack:', error);
                }
            }

            return res.status(201).json({
                message: statusMessage,
                vacation: vacationWithRelations,
                dayCount,
                status: initialStatus
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

    // Eliminar múltiples vacaciones
    async deleteBulkVacations(req: Request, res: Response): Promise<Response> {
        try {
            const { vacationIds } = req.body;

            if (!vacationIds || !Array.isArray(vacationIds) || vacationIds.length === 0) {
                return res.status(400).json({
                    message: 'Se requiere un array de IDs de vacaciones válido'
                });
            }

            // Verificar que todas las vacaciones existen
            const vacations = await this.vacationRepository.find({
                where: {
                    id: In(vacationIds.map(id => parseInt(id)))
                }
            });

            if (vacations.length !== vacationIds.length) {
                return res.status(404).json({
                    message: 'Algunas vacaciones no fueron encontradas'
                });
            }

            // Calcular total de días eliminados
            const totalDays = vacations.reduce((sum, vacation) => sum + (vacation.workingDays || vacation.dayCount), 0);

            // Eliminar todas las vacaciones
            await this.vacationRepository.remove(vacations);

            return res.json({
                message: `Se eliminaron ${vacations.length} solicitud(es) de vacación correspondientes a ${totalDays} día(s)`,
                deletedCount: vacations.length,
                deletedDays: totalDays
            });
        } catch (error) {
            console.error('Error al eliminar vacaciones múltiples:', error);
            return res.status(500).json({ message: 'Error al eliminar vacaciones múltiples' });
        }
    }

    // Obtener conflictos para una fecha específica
    async getDateConflicts(req: Request, res: Response): Promise<Response> {
        try {
            const { date } = req.params;
            const checkDate = new Date(date);

            const vacations = await this.vacationRepository
                .createQueryBuilder('vacation')
                .leftJoinAndSelect('vacation.user', 'user')
                .where('vacation.type = :type', { type: VacationType.REST_DAY })
                .andWhere('vacation.status = :status', { status: VacationStatus.FULLY_APPROVED })
                .andWhere('vacation.startDate <= :date AND vacation.endDate >= :date', { date: checkDate })
                .select([
                    'vacation.id',
                    'vacation.startDate',
                    'vacation.endDate',
                    'user.id',
                    'user.fullName',
                    'user.photoUrl'
                ])
                .getMany();

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

            const rangeStart = new Date(startDate as string);
            const rangeEnd = new Date(endDate as string);

            const vacations = await this.vacationRepository
                .createQueryBuilder('vacation')
                .leftJoinAndSelect('vacation.user', 'user')
                .where('vacation.status = :status', { status: VacationStatus.FULLY_APPROVED })
                .andWhere(
                    '(vacation.startDate <= :rangeEnd AND vacation.endDate >= :rangeStart)',
                    { rangeStart, rangeEnd }
                )
                .orderBy('vacation.startDate', 'ASC')
                .getMany();

            return res.json(vacations);
        } catch (error) {
            console.error('Error al obtener vacaciones por rango de fechas:', error);
            return res.status(500).json({ message: 'Error al obtener vacaciones por rango de fechas' });
        }
    }

    // Obtener solicitudes de vacaciones pendientes
    async getPendingVacations(req: Request, res: Response): Promise<Response> {
        try {
            const { year } = req.query;
            const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);

            // Obtener solicitudes pendientes
            const pendingVacations = await this.vacationRepository.find({
                where: [
                    {
                        startDate: Between(startDate, endDate),
                        status: VacationStatus.PENDING
                    },
                    {
                        startDate: Between(startDate, endDate),
                        status: VacationStatus.FIRST_APPROVED
                    },
                    {
                        endDate: Between(startDate, endDate),
                        status: VacationStatus.PENDING
                    },
                    {
                        endDate: Between(startDate, endDate),
                        status: VacationStatus.FIRST_APPROVED
                    }
                ],
                relations: ['user', 'firstApprovedBy', 'secondApprovedBy'],
                order: {
                    createdAt: 'DESC'
                }
            });

            // Obtener todas las vacaciones aprobadas y pendientes para calcular conflictos
            const allVacations = await this.vacationRepository.find({
                where: [
                    {
                        startDate: Between(startDate, endDate),
                        status: In([VacationStatus.PENDING, VacationStatus.FIRST_APPROVED, VacationStatus.FULLY_APPROVED])
                    },
                    {
                        endDate: Between(startDate, endDate),
                        status: In([VacationStatus.PENDING, VacationStatus.FIRST_APPROVED, VacationStatus.FULLY_APPROVED])
                    }
                ],
                relations: ['user'],
                select: ['id', 'startDate', 'endDate', 'type', 'status', 'userId', 'user']
            });

            return res.json({
                pendingVacations,
                allVacations
            });
        } catch (error) {
            console.error('Error al obtener solicitudes pendientes:', error);
            return res.status(500).json({ message: 'Error al obtener solicitudes pendientes' });
        }
    }

    // Obtener solicitudes de vacaciones pendientes agrupadas
    async getPendingVacationsGrouped(req: Request, res: Response): Promise<Response> {
        try {
            const { year } = req.query;
            const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);

            const pendingVacations = await this.vacationRepository.find({
                where: [
                    {
                        startDate: Between(startDate, endDate),
                        status: VacationStatus.PENDING
                    },
                    {
                        startDate: Between(startDate, endDate),
                        status: VacationStatus.FIRST_APPROVED
                    },
                    {
                        endDate: Between(startDate, endDate),
                        status: VacationStatus.PENDING
                    },
                    {
                        endDate: Between(startDate, endDate),
                        status: VacationStatus.FIRST_APPROVED
                    }
                ],
                relations: ['user', 'firstApprovedBy', 'secondApprovedBy'],
                order: {
                    userId: 'ASC',
                    startDate: 'ASC'
                }
            });

            const allVacations = await this.vacationRepository.find({
                where: [
                    {
                        startDate: Between(startDate, endDate),
                        status: In([VacationStatus.PENDING, VacationStatus.FIRST_APPROVED, VacationStatus.FULLY_APPROVED])
                    },
                    {
                        endDate: Between(startDate, endDate),
                        status: In([VacationStatus.PENDING, VacationStatus.FIRST_APPROVED, VacationStatus.FULLY_APPROVED])
                    }
                ],
                relations: ['user'],
                select: ['id', 'startDate', 'endDate', 'type', 'status', 'userId', 'user']
            });

            // Para rangos, cada vacación ya es un "período", así que no necesitamos agrupar
            const groupedRequests = pendingVacations.map(vacation => ({
                id: `vacation-${vacation.id}`,
                vacationIds: [vacation.id],
                user: vacation.user,
                userId: vacation.userId,
                startDate: vacation.startDate,
                endDate: vacation.endDate,
                type: vacation.type,
                status: vacation.status,
                description: vacation.description,
                dayCount: vacation.workingDays || vacation.dayCount,
                firstApprovedBy: vacation.firstApprovedBy,
                firstApprovedDate: vacation.firstApprovedDate,
                secondApprovedBy: vacation.secondApprovedBy,
                secondApprovedDate: vacation.secondApprovedDate,
                createdAt: vacation.createdAt,
                updatedAt: vacation.updatedAt,
                vacations: [vacation]
            }));

            return res.json({
                pendingRequests: groupedRequests,
                allVacations
            });
        } catch (error) {
            console.error('Error al obtener solicitudes pendientes agrupadas:', error);
            return res.status(500).json({ message: 'Error al obtener solicitudes pendientes' });
        }
    }

    // Aprobar un período completo de vacaciones
    async approvePeriodVacations(req: Request, res: Response): Promise<Response> {
        try {
            const { vacationIds } = req.body;

            if (!vacationIds || !Array.isArray(vacationIds) || vacationIds.length === 0) {
                return res.status(400).json({
                    message: 'Se requiere un array de IDs de vacaciones válido'
                });
            }

            // Usar la función existente de aprobación masiva
            return await this.approveBulkVacations(req, res);
        } catch (error) {
            console.error('Error al aprobar período de vacaciones:', error);
            return res.status(500).json({ message: 'Error al aprobar período de vacaciones' });
        }
    }

    // Rechazar un período completo de vacaciones
    async rejectPeriodVacations(req: Request, res: Response): Promise<Response> {
        try {
            const { vacationIds, reason } = req.body;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const currentUserId = req.userId;
            const currentUserRole = req.userRole;

            // Solo administradores pueden rechazar
            if (currentUserRole !== 'administrador') {
                return res.status(403).json({ message: 'Solo los administradores pueden rechazar vacaciones' });
            }

            if (!vacationIds || !Array.isArray(vacationIds) || vacationIds.length === 0) {
                return res.status(400).json({
                    message: 'Se requiere un array de IDs de vacaciones válido'
                });
            }

            // Buscar todas las vacaciones del período
            const vacations = await this.vacationRepository.find({
                where: {
                    id: In(vacationIds.map(id => parseInt(id)))
                },
                relations: ['user']
            });

            if (vacations.length !== vacationIds.length) {
                return res.status(404).json({
                    message: 'Algunas vacaciones del período no fueron encontradas'
                });
            }

            const rejector = await this.userRepository.findOne({ where: { id: currentUserId } });

            // Calcular total de días rechazados
            const totalDays = vacations.reduce((sum, vacation) => sum + (vacation.workingDays || vacation.dayCount), 0);

            // Marcar todas como rechazadas
            for (const vacation of vacations) {
                vacation.status = VacationStatus.REJECTED;
                vacation.rejectionReason = reason;
                vacation.rejectedBy = rejector || undefined;
                vacation.rejectedDate = new Date();
            }

            await this.vacationRepository.save(vacations);

            // Enviar notificaciones por cada vacación (pueden ser de usuarios diferentes)
            const userVacations = new Map<number, Vacation[]>();
            for (const vacation of vacations) {
                if (!userVacations.has(vacation.userId)) {
                    userVacations.set(vacation.userId, []);
                }
                userVacations.get(vacation.userId)!.push(vacation);
            }

            for (const [userId, userVacationList] of userVacations) {
                try {
                    const user = userVacationList[0].user;
                    const allDates = userVacationList.flatMap(v => v.getAllDatesInRange());
                    const type = userVacationList[0].type;

                    await slackNotificationService.sendVacationRejectedNotification(
                        user,
                        allDates,
                        type,
                        rejector?.fullName || 'Administrador',
                        reason
                    );
                } catch (error) {
                    console.error('Error al enviar notificación de rechazo de Slack:', error);
                }
            }

            return res.json({
                message: `Se rechazaron ${vacations.length} solicitud(es) de vacación correspondientes a ${totalDays} día(s)`,
                rejectedCount: vacations.length,
                rejectedDays: totalDays,
                reason: reason,
                rejectedBy: rejector?.fullName,
                rejectedDate: new Date()
            });
        } catch (error) {
            console.error('Error al rechazar período de vacaciones:', error);
            return res.status(500).json({ message: 'Error al rechazar período de vacaciones' });
        }
    }

    // Aprobar una solicitud de vacación
    async approveVacation(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const currentUserId = req.userId;
            const currentUserRole = req.userRole;

            // Solo administradores pueden aprobar
            if (currentUserRole !== 'administrador') {
                return res.status(403).json({ message: 'Solo los administradores pueden aprobar vacaciones' });
            }

            const vacation = await this.vacationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['user', 'firstApprovedBy', 'secondApprovedBy']
            });

            if (!vacation) {
                return res.status(404).json({ message: 'Solicitud de vacación no encontrada' });
            }

            if (vacation.status === VacationStatus.FULLY_APPROVED) {
                return res.status(400).json({ message: 'La solicitud ya fue completamente aprobada' });
            }

            if (vacation.status === VacationStatus.REJECTED) {
                return res.status(400).json({ message: 'No se puede aprobar una solicitud rechazada' });
            }

            const approver = await this.userRepository.findOne({ where: { id: currentUserId } });
            if (!approver) {
                return res.status(404).json({ message: 'Usuario aprobador no encontrado' });
            }

            let message = '';

            if (vacation.status === VacationStatus.PENDING) {
                // Primera aprobación
                // Verificar que el usuario no se esté aprobando su propia solicitud
                if (vacation.userId === currentUserId) {
                    return res.status(400).json({
                        message: 'No puedes aprobar tu propia solicitud de vacación'
                    });
                }

                vacation.status = VacationStatus.FIRST_APPROVED;
                vacation.firstApprovedBy = approver;
                vacation.firstApprovedDate = new Date();
                message = 'Primera aprobación registrada. Se requiere una segunda aprobación de otro administrador.';

            } else if (vacation.status === VacationStatus.FIRST_APPROVED) {
                // Segunda aprobación
                // Verificar que no sea el mismo administrador que dio la primera aprobación
                if (vacation.firstApprovedBy && vacation.firstApprovedBy.id === currentUserId) {
                    return res.status(400).json({
                        message: 'No puedes dar la segunda aprobación. Debe ser aprobada por un administrador diferente.'
                    });
                }

                // Verificar que el usuario no se esté aprobando su propia solicitud
                if (vacation.userId === currentUserId) {
                    return res.status(400).json({
                        message: 'No puedes aprobar tu propia solicitud de vacación'
                    });
                }

                vacation.status = VacationStatus.FULLY_APPROVED;
                vacation.secondApprovedBy = approver;
                vacation.secondApprovedDate = new Date();
                vacation.isApproved = true;
                vacation.approvedBy = approver;
                vacation.approvedDate = new Date();
                message = `Solicitud de vacación completamente aprobada. ${vacation.workingDays || vacation.dayCount} día(s) de vacaciones confirmados.`;
            }

            await this.vacationRepository.save(vacation);

            const updatedVacation = await this.vacationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['user', 'firstApprovedBy', 'secondApprovedBy', 'approvedBy']
            });

            // Enviar notificación de Slack sobre la aprobación
            if (updatedVacation) {
                try {
                    const isFullyApproved = vacation.status === VacationStatus.FULLY_APPROVED;
                    const allDates = updatedVacation.getAllDatesInRange();

                    await slackNotificationService.sendVacationApprovedNotification(
                        updatedVacation.user,
                        allDates,
                        updatedVacation.type,
                        approver.fullName,
                        isFullyApproved
                    );
                } catch (error) {
                    console.error('Error al enviar notificación de aprobación de Slack:', error);
                }
            }

            return res.json({
                message,
                vacation: updatedVacation,
                status: vacation.status,
                dayCount: vacation.workingDays || vacation.dayCount,
                requiresSecondApproval: vacation.status === VacationStatus.FIRST_APPROVED
            });
        } catch (error) {
            console.error('Error al aprobar vacación:', error);
            return res.status(500).json({ message: 'Error al aprobar vacación' });
        }
    }

    // Rechazar una solicitud de vacación
    async rejectVacation(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { reason } = req.body;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const currentUserId = req.userId;
            const currentUserRole = req.userRole;

            // Solo administradores pueden rechazar
            if (currentUserRole !== 'administrador') {
                return res.status(403).json({ message: 'Solo los administradores pueden rechazar vacaciones' });
            }

            const vacation = await this.vacationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['user']
            });

            if (!vacation) {
                return res.status(404).json({ message: 'Solicitud de vacación no encontrada' });
            }

            if (vacation.status === VacationStatus.FULLY_APPROVED) {
                return res.status(400).json({ message: 'No se puede rechazar una solicitud completamente aprobada' });
            }

            if (vacation.status === VacationStatus.REJECTED) {
                return res.status(400).json({ message: 'La solicitud ya fue rechazada' });
            }

            const rejector = await this.userRepository.findOne({ where: { id: currentUserId } });

            // Marcar como rechazada
            vacation.status = VacationStatus.REJECTED;
            vacation.rejectionReason = reason;
            vacation.rejectedBy = rejector || undefined;
            vacation.rejectedDate = new Date();

            await this.vacationRepository.save(vacation);

            // Enviar notificación de Slack sobre el rechazo
            try {
                const allDates = vacation.getAllDatesInRange();
                await slackNotificationService.sendVacationRejectedNotification(
                    vacation.user,
                    allDates,
                    vacation.type,
                    rejector?.fullName || 'Administrador',
                    reason
                );
            } catch (error) {
                console.error('Error al enviar notificación de rechazo de Slack:', error);
            }

            return res.json({
                message: `Solicitud de vacación de ${vacation.workingDays || vacation.dayCount} día(s) rechazada correctamente`,
                dayCount: vacation.workingDays || vacation.dayCount,
                reason: reason,
                rejectedBy: rejector?.fullName,
                rejectedDate: vacation.rejectedDate
            });
        } catch (error) {
            console.error('Error al rechazar vacación:', error);
            return res.status(500).json({ message: 'Error al rechazar vacación' });
        }
    }

    // Aprobar múltiples solicitudes de vacación
    async approveBulkVacations(req: Request, res: Response): Promise<Response> {
        try {
            const { vacationIds } = req.body;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const currentUserId = req.userId;
            const currentUserRole = req.userRole;

            // Solo administradores pueden aprobar
            if (currentUserRole !== 'administrador') {
                return res.status(403).json({ message: 'Solo los administradores pueden aprobar vacaciones' });
            }

            if (!vacationIds || !Array.isArray(vacationIds) || vacationIds.length === 0) {
                return res.status(400).json({
                    message: 'Se requiere un array de IDs de vacaciones válido'
                });
            }

            // Buscar todas las vacaciones que pueden ser aprobadas
            const vacations = await this.vacationRepository.find({
                where: [
                    {
                        id: In(vacationIds.map(id => parseInt(id))),
                        status: VacationStatus.PENDING
                    },
                    {
                        id: In(vacationIds.map(id => parseInt(id))),
                        status: VacationStatus.FIRST_APPROVED
                    }
                ],
                relations: ['user', 'firstApprovedBy']
            });

            if (vacations.length === 0) {
                return res.status(404).json({
                    message: 'No se encontraron solicitudes válidas para aprobar'
                });
            }

            const approver = await this.userRepository.findOne({ where: { id: currentUserId } });
            if (!approver) {
                return res.status(404).json({ message: 'Usuario aprobador no encontrado' });
            }

            let firstApprovals = 0;
            let secondApprovals = 0;
            let skipped = 0;
            let totalDaysApproved = 0;

            // Procesar cada vacación individualmente
            for (const vacation of vacations) {
                // Verificar que el usuario no se esté aprobando su propia solicitud
                if (vacation.userId === currentUserId) {
                    skipped++;
                    continue;
                }

                if (vacation.status === VacationStatus.PENDING) {
                    // Primera aprobación
                    vacation.status = VacationStatus.FIRST_APPROVED;
                    vacation.firstApprovedBy = approver;
                    vacation.firstApprovedDate = new Date();
                    firstApprovals++;

                } else if (vacation.status === VacationStatus.FIRST_APPROVED) {
                    // Segunda aprobación - verificar que no sea el mismo aprobador
                    if (vacation.firstApprovedBy && vacation.firstApprovedBy.id === currentUserId) {
                        skipped++;
                        continue;
                    }

                    vacation.status = VacationStatus.FULLY_APPROVED;
                    vacation.secondApprovedBy = approver;
                    vacation.secondApprovedDate = new Date();
                    vacation.isApproved = true;
                    vacation.approvedBy = approver;
                    vacation.approvedDate = new Date();
                    secondApprovals++;
                    totalDaysApproved += vacation.workingDays || vacation.dayCount;
                }
            }

            await this.vacationRepository.save(vacations);

            // Agrupar vacaciones por usuario y estado para enviar notificaciones consolidadas
            const groupedVacations = new Map<string, {
                user: User;
                vacations: Vacation[];
                type: VacationType;
                isFullyApproved: boolean;
            }>();

            for (const vacation of vacations) {
                if (vacation.userId === currentUserId) continue; // Saltar las omitidas

                const key = `${vacation.userId}-${vacation.type}-${vacation.status}`;
                const isFullyApproved = vacation.status === VacationStatus.FULLY_APPROVED;

                if (groupedVacations.has(key)) {
                    groupedVacations.get(key)!.vacations.push(vacation);
                } else {
                    groupedVacations.set(key, {
                        user: vacation.user,
                        vacations: [vacation],
                        type: vacation.type,
                        isFullyApproved
                    });
                }
            }

            // Enviar una notificación por cada grupo
            for (const group of groupedVacations.values()) {
                try {
                    const allDates = group.vacations.flatMap(v => v.getAllDatesInRange());
                    // Ordenar las fechas
                    allDates.sort((a, b) => a.getTime() - b.getTime());

                    await slackNotificationService.sendVacationApprovedNotification(
                        group.user,
                        allDates,
                        group.type,
                        approver.fullName,
                        group.isFullyApproved
                    );
                } catch (error) {
                    console.error('Error al enviar notificación de aprobación masiva de Slack:', error);
                }
            }

            let message = `Proceso completado: `;
            if (firstApprovals > 0) {
                message += `${firstApprovals} primera(s) aprobación(es), `;
            }
            if (secondApprovals > 0) {
                message += `${secondApprovals} segunda(s) aprobación(es) (${totalDaysApproved} días completados), `;
            }
            if (skipped > 0) {
                message += `${skipped} omitida(s) por restricciones, `;
            }
            message = message.slice(0, -2); // Remover la última coma

            return res.json({
                message,
                firstApprovals,
                secondApprovals,
                totalDaysApproved,
                skipped,
                totalProcessed: firstApprovals + secondApprovals + skipped
            });
        } catch (error) {
            console.error('Error al aprobar vacaciones múltiples:', error);
            return res.status(500).json({ message: 'Error al aprobar vacaciones múltiples' });
        }
    }

    // Actualizar días de vacaciones de un usuario
    async updateUserVacationDays(req: Request, res: Response): Promise<Response> {
        try {
            const { userId } = req.params;
            const { vacationDays } = req.body;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const currentUserRole = req.userRole;

            // Solo administradores pueden ajustar días de vacaciones
            if (currentUserRole !== 'administrador') {
                return res.status(403).json({ message: 'Solo los administradores pueden ajustar días de vacaciones' });
            }

            // Validar campos requeridos
            if (!userId || vacationDays === undefined) {
                return res.status(400).json({
                    message: 'Faltan campos requeridos: userId y vacationDays'
                });
            }

            // Validar que vacationDays sea un número positivo
            const newVacationDays = parseInt(vacationDays);
            if (isNaN(newVacationDays) || newVacationDays < 0) {
                return res.status(400).json({
                    message: 'Los días de vacaciones deben ser un número positivo'
                });
            }

            // Verificar si el usuario existe
            const user = await this.userRepository.findOne({
                where: { id: parseInt(userId) },
                select: ['id', 'fullName', 'vacationDays']
            });

            if (!user) {
                return res.status(404).json({ message: 'Usuario no encontrado' });
            }

            const previousDays = user.vacationDays || 25;

            // Actualizar los días de vacaciones
            user.vacationDays = newVacationDays;
            await this.userRepository.save(user);

            return res.json({
                message: `Días de vacaciones actualizados correctamente para ${user.fullName}`,
                userId: user.id,
                userName: user.fullName,
                previousDays,
                newDays: newVacationDays,
                difference: newVacationDays - previousDays
            });
        } catch (error) {
            console.error('Error al actualizar días de vacaciones:', error);
            return res.status(500).json({ message: 'Error al actualizar días de vacaciones' });
        }
    }

    // Método auxiliar para actualizar vacaciones existentes con días hábiles calculados
    async updateExistingVacationsWorkingDays(req: Request, res: Response): Promise<Response> {
        try {
            // Verificar autenticación y permisos de administrador
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const currentUserRole = req.userRole;
            if (currentUserRole !== 'administrador') {
                return res.status(403).json({ message: 'Solo los administradores pueden ejecutar esta operación' });
            }

            // Obtener todas las vacaciones que no tienen workingDays calculado (0 o undefined)
            const vacations = await this.vacationRepository.find({
                where: { workingDays: 0 }
            });

            if (vacations.length === 0) {
                return res.json({
                    message: 'Todas las vacaciones ya tienen los días hábiles calculados',
                    updatedCount: 0
                });
            }

            let updatedCount = 0;

            for (const vacation of vacations) {
                try {
                    // Calcular días hábiles para cada vacación
                    const workingDays = calculateWorkingDays(vacation.startDate, vacation.endDate);
                    vacation.workingDays = workingDays;
                    updatedCount++;
                } catch (error) {
                    console.error(`Error calculando días hábiles para vacación ${vacation.id}:`, error instanceof Error ? error.message : error);
                    // Continuar con la siguiente vacación en caso de error
                }
            }

            // Guardar todas las vacaciones actualizadas
            await this.vacationRepository.save(vacations);

            return res.json({
                message: `Se actualizaron ${updatedCount} vacaciones con sus días hábiles calculados`,
                totalVacations: vacations.length,
                updatedCount
            });
        } catch (error) {
            console.error('Error al actualizar vacaciones existentes:', error);
            return res.status(500).json({ 
                message: 'Error al actualizar vacaciones existentes',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}

export const vacationController = new VacationController(); 