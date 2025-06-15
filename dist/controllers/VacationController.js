"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacationController = exports.VacationController = void 0;
const Vacation_1 = require("../entity/Vacation");
const User_1 = require("../entity/User");
const data_source_1 = require("../config/data-source");
const typeorm_1 = require("typeorm");
class VacationController {
    constructor() {
        this.vacationRepository = data_source_1.AppDataSource.getRepository(Vacation_1.Vacation);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    // Obtener todas las vacaciones del año actual
    async getAllVacations(req, res) {
        try {
            const { year } = req.query;
            const currentYear = year ? parseInt(year) : new Date().getFullYear();
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);
            const vacations = await this.vacationRepository.find({
                where: {
                    date: (0, typeorm_1.Between)(startDate, endDate)
                },
                relations: ['user', 'approvedBy'],
                order: {
                    date: 'ASC'
                }
            });
            return res.json(vacations);
        }
        catch (error) {
            console.error('Error al obtener vacaciones:', error);
            return res.status(500).json({ message: 'Error al obtener vacaciones' });
        }
    }
    // Obtener vacaciones de un usuario específico
    async getUserVacations(req, res) {
        try {
            const { userId } = req.params;
            const { year } = req.query;
            const currentYear = year ? parseInt(year) : new Date().getFullYear();
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);
            const vacations = await this.vacationRepository.find({
                where: {
                    userId: parseInt(userId),
                    date: (0, typeorm_1.Between)(startDate, endDate)
                },
                relations: ['user', 'approvedBy'],
                order: {
                    date: 'ASC'
                }
            });
            return res.json(vacations);
        }
        catch (error) {
            console.error('Error al obtener vacaciones del usuario:', error);
            return res.status(500).json({ message: 'Error al obtener vacaciones del usuario' });
        }
    }
    // Calcular días disponibles de un usuario
    async getUserAvailableDays(req, res) {
        try {
            const { userId } = req.params;
            const { year } = req.query;
            const currentYear = year ? parseInt(year) : new Date().getFullYear();
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);
            const vacations = await this.vacationRepository.find({
                where: {
                    userId: parseInt(userId),
                    date: (0, typeorm_1.Between)(startDate, endDate),
                    isApproved: true
                }
            });
            const restDays = vacations.filter(v => v.type === Vacation_1.VacationType.REST_DAY).length;
            const extraWorkDays = vacations.filter(v => v.type === Vacation_1.VacationType.EXTRA_WORK_DAY).length;
            const availableDays = 25 + extraWorkDays - restDays;
            return res.json({
                totalDays: 25,
                extraWorkDays,
                usedRestDays: restDays,
                availableDays,
                year: currentYear
            });
        }
        catch (error) {
            console.error('Error al calcular días disponibles:', error);
            return res.status(500).json({ message: 'Error al calcular días disponibles' });
        }
    }
    // Obtener resumen de días disponibles de todos los usuarios
    async getAllUsersAvailableDays(req, res) {
        try {
            const { year } = req.query;
            const currentYear = year ? parseInt(year) : new Date().getFullYear();
            const users = await this.userRepository.find({
                where: { isActive: true },
                select: ['id', 'fullName', 'photoUrl', 'email']
            });
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);
            const usersWithDays = await Promise.all(users.map(async (user) => {
                const vacations = await this.vacationRepository.find({
                    where: {
                        userId: user.id,
                        date: (0, typeorm_1.Between)(startDate, endDate),
                        isApproved: true
                    }
                });
                const restDays = vacations.filter(v => v.type === Vacation_1.VacationType.REST_DAY).length;
                const extraWorkDays = vacations.filter(v => v.type === Vacation_1.VacationType.EXTRA_WORK_DAY).length;
                const availableDays = 25 + extraWorkDays - restDays;
                return {
                    ...user,
                    totalDays: 25,
                    extraWorkDays,
                    usedRestDays: restDays,
                    availableDays,
                    year: currentYear
                };
            }));
            return res.json(usersWithDays);
        }
        catch (error) {
            console.error('Error al obtener días disponibles de todos los usuarios:', error);
            return res.status(500).json({ message: 'Error al obtener días disponibles' });
        }
    }
    // Crear una nueva solicitud de vacación (una o múltiples fechas)
    async createVacation(req, res) {
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
            if (!Object.values(Vacation_1.VacationType).includes(type)) {
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
                    date: (0, typeorm_1.In)(dates)
                }
            });
            if (existingVacations.length > 0) {
                const existingDates = existingVacations.map(v => new Date(v.date).toLocaleDateString('es-ES'));
                return res.status(400).json({
                    message: `Ya existen solicitudes de vacación para las siguientes fechas: ${existingDates.join(', ')}`
                });
            }
            // Determinar si la solicitud debe ser automáticamente aprobada o quedar pendiente
            const isAutoApproved = currentUserRole === 'administrador';
            // Crear las vacaciones para todas las fechas del rango
            const vacationsToCreate = [];
            for (const dateItem of dates) {
                const vacationData = {
                    userId: parseInt(userId),
                    date: dateItem,
                    type,
                    description,
                    isApproved: isAutoApproved,
                    approvedDate: isAutoApproved ? new Date() : undefined
                };
                if (isAutoApproved && currentUserId) {
                    vacationData.approvedBy = { id: currentUserId };
                }
                vacationsToCreate.push(vacationData);
            }
            await this.vacationRepository.save(vacationsToCreate);
            // Obtener las vacaciones creadas con las relaciones
            const savedVacations = await this.vacationRepository.find({
                where: {
                    userId: parseInt(userId),
                    date: (0, typeorm_1.In)(dates)
                },
                relations: ['user', 'approvedBy'],
                order: { date: 'ASC' }
            });
            const statusMessage = isAutoApproved
                ? `Se crearon ${dates.length} día(s) de vacación correctamente`
                : `Se enviaron ${dates.length} solicitud(es) de vacación. Esperando aprobación del administrador.`;
            return res.status(201).json({
                message: statusMessage,
                vacations: savedVacations,
                count: dates.length,
                status: isAutoApproved ? 'approved' : 'pending'
            });
        }
        catch (error) {
            console.error('Error al crear vacación:', error);
            return res.status(500).json({ message: 'Error al crear vacación' });
        }
    }
    // Eliminar una vacación
    async deleteVacation(req, res) {
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
        }
        catch (error) {
            console.error('Error al eliminar vacación:', error);
            return res.status(500).json({ message: 'Error al eliminar vacación' });
        }
    }
    // Eliminar múltiples vacaciones
    async deleteBulkVacations(req, res) {
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
                    id: (0, typeorm_1.In)(vacationIds.map(id => parseInt(id)))
                }
            });
            if (vacations.length !== vacationIds.length) {
                return res.status(404).json({
                    message: 'Algunas vacaciones no fueron encontradas'
                });
            }
            // Eliminar todas las vacaciones
            await this.vacationRepository.remove(vacations);
            return res.json({
                message: `Se eliminaron ${vacations.length} día(s) de vacación correctamente`,
                deletedCount: vacations.length
            });
        }
        catch (error) {
            console.error('Error al eliminar vacaciones múltiples:', error);
            return res.status(500).json({ message: 'Error al eliminar vacaciones múltiples' });
        }
    }
    // Obtener conflictos para una fecha específica
    async getDateConflicts(req, res) {
        try {
            const { date } = req.params;
            const vacations = await this.vacationRepository.find({
                where: {
                    date: new Date(date),
                    type: Vacation_1.VacationType.REST_DAY,
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
        }
        catch (error) {
            console.error('Error al obtener conflictos de fecha:', error);
            return res.status(500).json({ message: 'Error al obtener conflictos de fecha' });
        }
    }
    // Obtener vacaciones por rango de fechas
    async getVacationsByDateRange(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({
                    message: 'Se requieren las fechas de inicio y fin'
                });
            }
            const vacations = await this.vacationRepository.find({
                where: {
                    date: (0, typeorm_1.Between)(new Date(startDate), new Date(endDate)),
                    isApproved: true
                },
                relations: ['user'],
                order: {
                    date: 'ASC'
                }
            });
            return res.json(vacations);
        }
        catch (error) {
            console.error('Error al obtener vacaciones por rango de fechas:', error);
            return res.status(500).json({ message: 'Error al obtener vacaciones por rango de fechas' });
        }
    }
    // Obtener solicitudes de vacaciones pendientes (solo para administradores)
    async getPendingVacations(req, res) {
        try {
            const { year } = req.query;
            const currentYear = year ? parseInt(year) : new Date().getFullYear();
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);
            const pendingVacations = await this.vacationRepository.find({
                where: {
                    date: (0, typeorm_1.Between)(startDate, endDate),
                    isApproved: false
                },
                relations: ['user'],
                order: {
                    createdAt: 'DESC'
                }
            });
            return res.json(pendingVacations);
        }
        catch (error) {
            console.error('Error al obtener solicitudes pendientes:', error);
            return res.status(500).json({ message: 'Error al obtener solicitudes pendientes' });
        }
    }
    // Aprobar una solicitud de vacación
    async approveVacation(req, res) {
        try {
            const { id } = req.params;
            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }
            const currentUserId = req.userId;
            const currentUserRole = req.userRole;
            const vacation = await this.vacationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['user']
            });
            if (!vacation) {
                return res.status(404).json({ message: 'Solicitud de vacación no encontrada' });
            }
            if (vacation.isApproved) {
                return res.status(400).json({ message: 'La solicitud ya fue aprobada' });
            }
            vacation.isApproved = true;
            vacation.approvedDate = new Date();
            if (currentUserId) {
                const approver = await this.userRepository.findOne({ where: { id: currentUserId } });
                vacation.approvedBy = approver || undefined;
            }
            await this.vacationRepository.save(vacation);
            const updatedVacation = await this.vacationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['user', 'approvedBy']
            });
            return res.json({
                message: 'Solicitud de vacación aprobada correctamente',
                vacation: updatedVacation
            });
        }
        catch (error) {
            console.error('Error al aprobar vacación:', error);
            return res.status(500).json({ message: 'Error al aprobar vacación' });
        }
    }
    // Rechazar una solicitud de vacación
    async rejectVacation(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const vacation = await this.vacationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['user']
            });
            if (!vacation) {
                return res.status(404).json({ message: 'Solicitud de vacación no encontrada' });
            }
            if (vacation.isApproved) {
                return res.status(400).json({ message: 'No se puede rechazar una solicitud ya aprobada' });
            }
            // Eliminar la solicitud rechazada
            await this.vacationRepository.remove(vacation);
            return res.json({
                message: 'Solicitud de vacación rechazada y eliminada',
                reason: reason
            });
        }
        catch (error) {
            console.error('Error al rechazar vacación:', error);
            return res.status(500).json({ message: 'Error al rechazar vacación' });
        }
    }
    // Aprobar múltiples solicitudes de vacación
    async approveBulkVacations(req, res) {
        try {
            const { vacationIds } = req.body;
            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }
            const currentUserId = req.userId;
            if (!vacationIds || !Array.isArray(vacationIds) || vacationIds.length === 0) {
                return res.status(400).json({
                    message: 'Se requiere un array de IDs de vacaciones válido'
                });
            }
            // Buscar todas las vacaciones pendientes
            const vacations = await this.vacationRepository.find({
                where: {
                    id: (0, typeorm_1.In)(vacationIds.map(id => parseInt(id))),
                    isApproved: false
                },
                relations: ['user']
            });
            if (vacations.length === 0) {
                return res.status(404).json({
                    message: 'No se encontraron solicitudes pendientes para aprobar'
                });
            }
            // Aprobar todas las vacaciones
            for (const vacation of vacations) {
                vacation.isApproved = true;
                vacation.approvedDate = new Date();
                vacation.approvedBy = { id: currentUserId };
            }
            await this.vacationRepository.save(vacations);
            return res.json({
                message: `Se aprobaron ${vacations.length} solicitud(es) de vacación correctamente`,
                approvedCount: vacations.length
            });
        }
        catch (error) {
            console.error('Error al aprobar vacaciones múltiples:', error);
            return res.status(500).json({ message: 'Error al aprobar vacaciones múltiples' });
        }
    }
}
exports.VacationController = VacationController;
exports.vacationController = new VacationController();
