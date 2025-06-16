"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacationController = exports.VacationController = void 0;
const Vacation_1 = require("../entity/Vacation");
const User_1 = require("../entity/User");
const data_source_1 = require("../config/data-source");
const typeorm_1 = require("typeorm");
const SlackNotificationService_1 = require("../services/SlackNotificationService");
class VacationController {
    constructor() {
        this.vacationRepository = data_source_1.AppDataSource.getRepository(Vacation_1.Vacation);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    // Obtener todas las vacaciones del año actual
    async getAllVacations(req, res) {
        try {
            const { year, onlyApproved } = req.query;
            const currentYear = year ? parseInt(year) : new Date().getFullYear();
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);
            // Configurar filtros base
            const whereConditions = {
                date: (0, typeorm_1.Between)(startDate, endDate)
            };
            // Si se solicita solo las aprobadas, filtrar por FULLY_APPROVED
            if (onlyApproved === 'true') {
                whereConditions.status = Vacation_1.VacationStatus.FULLY_APPROVED;
            }
            const vacations = await this.vacationRepository.find({
                where: whereConditions,
                relations: ['user', 'approvedBy', 'firstApprovedBy', 'secondApprovedBy', 'rejectedBy'],
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
            const { year, onlyApproved } = req.query;
            const currentYear = year ? parseInt(year) : new Date().getFullYear();
            const startDate = new Date(currentYear, 0, 1);
            const endDate = new Date(currentYear, 11, 31);
            // Configurar filtros base
            const whereConditions = {
                userId: parseInt(userId),
                date: (0, typeorm_1.Between)(startDate, endDate)
            };
            // Si se solicita solo las aprobadas, filtrar por FULLY_APPROVED
            if (onlyApproved === 'true') {
                whereConditions.status = Vacation_1.VacationStatus.FULLY_APPROVED;
            }
            const vacations = await this.vacationRepository.find({
                where: whereConditions,
                relations: ['user', 'approvedBy', 'firstApprovedBy', 'secondApprovedBy', 'rejectedBy'],
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
            // Solo contar vacaciones completamente aprobadas
            const vacations = await this.vacationRepository.find({
                where: {
                    userId: parseInt(userId),
                    date: (0, typeorm_1.Between)(startDate, endDate),
                    status: Vacation_1.VacationStatus.FULLY_APPROVED
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
                // Solo contar vacaciones completamente aprobadas
                const vacations = await this.vacationRepository.find({
                    where: {
                        userId: user.id,
                        date: (0, typeorm_1.Between)(startDate, endDate),
                        status: Vacation_1.VacationStatus.FULLY_APPROVED
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
            // Determinar el estado inicial según el rol del usuario
            let initialStatus = Vacation_1.VacationStatus.PENDING;
            let isAutoApproved = false;
            // Si es administrador creando para sí mismo, necesita doble aprobación también
            // Solo las vacaciones de administradores se auto-aprueban completamente
            if (currentUserRole === 'administrador' && currentUserId === parseInt(userId)) {
                initialStatus = Vacation_1.VacationStatus.FULLY_APPROVED;
                isAutoApproved = true;
            }
            // Generar un batchId único para agrupar solicitudes de múltiples días
            const batchId = dates.length > 1 ? `${parseInt(userId)}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` : undefined;
            // Crear las vacaciones para todas las fechas del rango
            const vacationsToCreate = [];
            for (const dateItem of dates) {
                const vacationData = {
                    userId: parseInt(userId),
                    date: dateItem,
                    type,
                    description,
                    status: initialStatus,
                    isApproved: isAutoApproved,
                    batchId
                };
                // Si es auto-aprobada, establecer las aprobaciones
                if (isAutoApproved && currentUserId) {
                    const approver = { id: currentUserId };
                    vacationData.firstApprovedBy = approver;
                    vacationData.firstApprovedDate = new Date();
                    vacationData.secondApprovedBy = approver;
                    vacationData.secondApprovedDate = new Date();
                    vacationData.approvedBy = approver;
                    vacationData.approvedDate = new Date();
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
                relations: ['user', 'approvedBy', 'firstApprovedBy', 'secondApprovedBy'],
                order: { date: 'ASC' }
            });
            const statusMessage = isAutoApproved
                ? `Se crearon ${dates.length} día(s) de vacación correctamente`
                : `Se enviaron ${dates.length} solicitud(es) de vacación. Requiere aprobación de dos administradores.`;
            // Enviar notificación de Slack solo para solicitudes nuevas (no auto-aprobadas)
            if (!isAutoApproved) {
                try {
                    await SlackNotificationService_1.slackNotificationService.sendVacationRequestNotification({
                        user,
                        dates,
                        type,
                        description
                    });
                }
                catch (error) {
                    console.error('Error al enviar notificación de Slack:', error);
                    // No afectar la respuesta aunque falle la notificación
                }
            }
            return res.status(201).json({
                message: statusMessage,
                vacations: savedVacations,
                count: dates.length,
                status: initialStatus
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
                    status: Vacation_1.VacationStatus.FULLY_APPROVED
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
                    status: Vacation_1.VacationStatus.FULLY_APPROVED
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
            // Obtener solicitudes pendientes
            const pendingVacations = await this.vacationRepository.find({
                where: [
                    {
                        date: (0, typeorm_1.Between)(startDate, endDate),
                        status: Vacation_1.VacationStatus.PENDING
                    },
                    {
                        date: (0, typeorm_1.Between)(startDate, endDate),
                        status: Vacation_1.VacationStatus.FIRST_APPROVED
                    }
                ],
                relations: ['user', 'firstApprovedBy', 'secondApprovedBy'],
                order: {
                    createdAt: 'DESC',
                    date: 'ASC'
                }
            });
            // Agrupar solicitudes por batchId (para solicitudes múltiples) o individualmente (para solicitudes individuales)
            const groupedRequests = new Map();
            pendingVacations.forEach(vacation => {
                // Usar batchId si existe, sino crear un ID único para cada solicitud individual
                const groupKey = vacation.batchId || `single-${vacation.id}`;
                if (groupedRequests.has(groupKey)) {
                    // Agregar fecha a solicitud existente
                    const group = groupedRequests.get(groupKey);
                    group.dates.push(vacation.date);
                    group.vacations.push(vacation);
                    // Ordenar fechas
                    group.dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                }
                else {
                    // Crear nueva solicitud agrupada
                    groupedRequests.set(groupKey, {
                        batchId: vacation.batchId || null,
                        user: vacation.user,
                        type: vacation.type,
                        description: vacation.description || undefined,
                        status: vacation.status,
                        dates: [vacation.date],
                        vacations: [vacation],
                        createdAt: vacation.createdAt,
                        firstApprovedBy: vacation.firstApprovedBy,
                        secondApprovedBy: vacation.secondApprovedBy,
                        firstApprovedDate: vacation.firstApprovedDate,
                        secondApprovedDate: vacation.secondApprovedDate,
                    });
                }
            });
            // Convertir el Map a array y ordenar por fecha de creación
            const groupedRequestsArray = Array.from(groupedRequests.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            // Obtener todas las vacaciones aprobadas y pendientes para calcular conflictos
            const allVacations = await this.vacationRepository.find({
                where: {
                    date: (0, typeorm_1.Between)(startDate, endDate),
                    status: (0, typeorm_1.In)([Vacation_1.VacationStatus.PENDING, Vacation_1.VacationStatus.FIRST_APPROVED, Vacation_1.VacationStatus.FULLY_APPROVED])
                },
                relations: ['user'],
                select: ['id', 'date', 'type', 'status', 'userId', 'user']
            });
            return res.json({
                pendingRequests: groupedRequestsArray,
                pendingVacations, // Mantenemos esto para compatibilidad
                allVacations
            });
        }
        catch (error) {
            console.error('Error al obtener solicitudes pendientes:', error);
            return res.status(500).json({ message: 'Error al obtener solicitudes pendientes' });
        }
    }
    // Aprobar una solicitud de vacación (sistema de doble aprobación)
    async approveVacation(req, res) {
        var _a, _b;
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
            if (vacation.status === Vacation_1.VacationStatus.FULLY_APPROVED) {
                return res.status(400).json({ message: 'La solicitud ya fue completamente aprobada' });
            }
            if (vacation.status === Vacation_1.VacationStatus.REJECTED) {
                return res.status(400).json({ message: 'No se puede aprobar una solicitud rechazada' });
            }
            const approver = await this.userRepository.findOne({ where: { id: currentUserId } });
            if (!approver) {
                return res.status(404).json({ message: 'Usuario aprobador no encontrado' });
            }
            let message = '';
            if (vacation.status === Vacation_1.VacationStatus.PENDING) {
                // Primera aprobación
                // Verificar que el usuario no se esté aprobando su propia solicitud
                if (vacation.userId === currentUserId) {
                    return res.status(400).json({
                        message: 'No puedes aprobar tu propia solicitud de vacación'
                    });
                }
                vacation.status = Vacation_1.VacationStatus.FIRST_APPROVED;
                vacation.firstApprovedBy = approver;
                vacation.firstApprovedDate = new Date();
                message = 'Primera aprobación registrada. Se requiere una segunda aprobación de otro administrador.';
            }
            else if (vacation.status === Vacation_1.VacationStatus.FIRST_APPROVED) {
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
                vacation.status = Vacation_1.VacationStatus.FULLY_APPROVED;
                vacation.secondApprovedBy = approver;
                vacation.secondApprovedDate = new Date();
                vacation.isApproved = true; // Para compatibilidad con el campo legacy
                vacation.approvedBy = approver; // Último aprobador para compatibilidad
                vacation.approvedDate = new Date();
                message = 'Solicitud de vacación completamente aprobada. Las vacaciones han sido confirmadas.';
            }
            await this.vacationRepository.save(vacation);
            const updatedVacation = await this.vacationRepository.findOne({
                where: { id: parseInt(id) },
                relations: ['user', 'firstApprovedBy', 'secondApprovedBy', 'approvedBy']
            });
            // Enviar notificación de Slack sobre la aprobación
            if (updatedVacation) {
                console.log('🔍 [DEBUG] Preparando notificación de Slack para aprobación');
                console.log('🔍 [DEBUG] updatedVacation:', {
                    id: updatedVacation.id,
                    userId: updatedVacation.userId,
                    userFullName: (_a = updatedVacation.user) === null || _a === void 0 ? void 0 : _a.fullName,
                    userEmail: (_b = updatedVacation.user) === null || _b === void 0 ? void 0 : _b.email,
                    date: updatedVacation.date,
                    type: updatedVacation.type,
                    status: updatedVacation.status
                });
                console.log('🔍 [DEBUG] approver:', {
                    id: approver.id,
                    fullName: approver.fullName,
                    email: approver.email
                });
                try {
                    const isFullyApproved = vacation.status === Vacation_1.VacationStatus.FULLY_APPROVED;
                    console.log('🔍 [DEBUG] Llamando sendVacationApprovedNotification con isFullyApproved:', isFullyApproved);
                    await SlackNotificationService_1.slackNotificationService.sendVacationApprovedNotification(updatedVacation.user, [updatedVacation.date], updatedVacation.type, approver.fullName, isFullyApproved);
                    console.log('✅ [DEBUG] Notificación de Slack enviada exitosamente');
                }
                catch (error) {
                    console.error('❌ [DEBUG] Error al enviar notificación de aprobación de Slack:', error);
                }
            }
            else {
                console.error('❌ [DEBUG] updatedVacation es null/undefined, no se puede enviar notificación');
            }
            return res.json({
                message,
                vacation: updatedVacation,
                status: vacation.status,
                requiresSecondApproval: vacation.status === Vacation_1.VacationStatus.FIRST_APPROVED
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
            if (vacation.status === Vacation_1.VacationStatus.FULLY_APPROVED) {
                return res.status(400).json({ message: 'No se puede rechazar una solicitud completamente aprobada' });
            }
            if (vacation.status === Vacation_1.VacationStatus.REJECTED) {
                return res.status(400).json({ message: 'La solicitud ya fue rechazada' });
            }
            const rejector = await this.userRepository.findOne({ where: { id: currentUserId } });
            // Marcar como rechazada en lugar de eliminar
            vacation.status = Vacation_1.VacationStatus.REJECTED;
            vacation.rejectionReason = reason;
            vacation.rejectedBy = rejector || undefined;
            vacation.rejectedDate = new Date();
            await this.vacationRepository.save(vacation);
            // Enviar notificación de Slack sobre el rechazo
            try {
                await SlackNotificationService_1.slackNotificationService.sendVacationRejectedNotification(vacation.user, [vacation.date], vacation.type, (rejector === null || rejector === void 0 ? void 0 : rejector.fullName) || 'Administrador', reason);
            }
            catch (error) {
                console.error('Error al enviar notificación de rechazo de Slack:', error);
            }
            return res.json({
                message: 'Solicitud de vacación rechazada correctamente',
                reason: reason,
                rejectedBy: rejector === null || rejector === void 0 ? void 0 : rejector.fullName,
                rejectedDate: vacation.rejectedDate
            });
        }
        catch (error) {
            console.error('Error al rechazar vacación:', error);
            return res.status(500).json({ message: 'Error al rechazar vacación' });
        }
    }
    // Aprobar múltiples solicitudes de vacación (NOTA: Con doble aprobación, esto no es recomendable)
    async approveBulkVacations(req, res) {
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
                        id: (0, typeorm_1.In)(vacationIds.map(id => parseInt(id))),
                        status: Vacation_1.VacationStatus.PENDING
                    },
                    {
                        id: (0, typeorm_1.In)(vacationIds.map(id => parseInt(id))),
                        status: Vacation_1.VacationStatus.FIRST_APPROVED
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
            // Procesar cada vacación individualmente
            for (const vacation of vacations) {
                // Verificar que el usuario no se esté aprobando su propia solicitud
                if (vacation.userId === currentUserId) {
                    skipped++;
                    continue;
                }
                if (vacation.status === Vacation_1.VacationStatus.PENDING) {
                    // Primera aprobación
                    vacation.status = Vacation_1.VacationStatus.FIRST_APPROVED;
                    vacation.firstApprovedBy = approver;
                    vacation.firstApprovedDate = new Date();
                    firstApprovals++;
                }
                else if (vacation.status === Vacation_1.VacationStatus.FIRST_APPROVED) {
                    // Segunda aprobación - verificar que no sea el mismo aprobador
                    if (vacation.firstApprovedBy && vacation.firstApprovedBy.id === currentUserId) {
                        skipped++;
                        continue;
                    }
                    vacation.status = Vacation_1.VacationStatus.FULLY_APPROVED;
                    vacation.secondApprovedBy = approver;
                    vacation.secondApprovedDate = new Date();
                    vacation.isApproved = true; // Para compatibilidad
                    vacation.approvedBy = approver;
                    vacation.approvedDate = new Date();
                    secondApprovals++;
                }
            }
            await this.vacationRepository.save(vacations);
            // Agrupar vacaciones por usuario, tipo y estado para enviar notificaciones consolidadas
            const groupedVacations = new Map();
            for (const vacation of vacations) {
                if (vacation.userId === currentUserId)
                    continue; // Saltar las que fueron omitidas
                const key = `${vacation.userId}-${vacation.type}-${vacation.status}`;
                const isFullyApproved = vacation.status === Vacation_1.VacationStatus.FULLY_APPROVED;
                if (groupedVacations.has(key)) {
                    groupedVacations.get(key).dates.push(vacation.date);
                }
                else {
                    groupedVacations.set(key, {
                        user: vacation.user,
                        dates: [vacation.date],
                        type: vacation.type,
                        isFullyApproved
                    });
                }
            }
            // Enviar una notificación por cada grupo (usuario/tipo/estado)
            for (const group of groupedVacations.values()) {
                try {
                    console.log('🔍 [DEBUG] Procesando grupo para notificación masiva:', {
                        userFullName: group.user.fullName,
                        userEmail: group.user.email,
                        datesCount: group.dates.length,
                        type: group.type,
                        isFullyApproved: group.isFullyApproved,
                        approverName: approver.fullName
                    });
                    // Ordenar las fechas - convertir a Date si es necesario
                    group.dates.sort((a, b) => {
                        const dateA = a instanceof Date ? a : new Date(a);
                        const dateB = b instanceof Date ? b : new Date(b);
                        return dateA.getTime() - dateB.getTime();
                    });
                    console.log('🔍 [DEBUG] Enviando notificación de aprobación masiva...');
                    await SlackNotificationService_1.slackNotificationService.sendVacationApprovedNotification(group.user, group.dates, group.type, approver.fullName, group.isFullyApproved);
                    console.log('✅ [DEBUG] Notificación masiva enviada exitosamente');
                }
                catch (error) {
                    console.error('❌ [DEBUG] Error al enviar notificación de aprobación masiva de Slack:', error);
                }
            }
            let message = `Proceso completado: `;
            if (firstApprovals > 0) {
                message += `${firstApprovals} primera(s) aprobación(es), `;
            }
            if (secondApprovals > 0) {
                message += `${secondApprovals} segunda(s) aprobación(es) (completadas), `;
            }
            if (skipped > 0) {
                message += `${skipped} omitida(s) por restricciones, `;
            }
            message = message.slice(0, -2); // Remover la última coma
            return res.json({
                message,
                firstApprovals,
                secondApprovals,
                skipped,
                totalProcessed: firstApprovals + secondApprovals + skipped
            });
        }
        catch (error) {
            console.error('Error al aprobar vacaciones múltiples:', error);
            return res.status(500).json({ message: 'Error al aprobar vacaciones múltiples' });
        }
    }
    // Aprobar días específicos de una solicitud agrupada
    async approveSelectedDaysFromRequest(req, res) {
        var _a;
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
            // Buscar las vacaciones específicas que se quieren aprobar
            const vacations = await this.vacationRepository.find({
                where: [
                    {
                        id: (0, typeorm_1.In)(vacationIds.map(id => parseInt(id))),
                        status: Vacation_1.VacationStatus.PENDING
                    },
                    {
                        id: (0, typeorm_1.In)(vacationIds.map(id => parseInt(id))),
                        status: Vacation_1.VacationStatus.FIRST_APPROVED
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
            // Procesar cada vacación individualmente
            for (const vacation of vacations) {
                // Verificar que el usuario no se esté aprobando su propia solicitud
                if (vacation.userId === currentUserId) {
                    skipped++;
                    continue;
                }
                if (vacation.status === Vacation_1.VacationStatus.PENDING) {
                    // Primera aprobación
                    vacation.status = Vacation_1.VacationStatus.FIRST_APPROVED;
                    vacation.firstApprovedBy = approver;
                    vacation.firstApprovedDate = new Date();
                    firstApprovals++;
                }
                else if (vacation.status === Vacation_1.VacationStatus.FIRST_APPROVED) {
                    // Segunda aprobación - verificar que no sea el mismo aprobador
                    if (vacation.firstApprovedBy && vacation.firstApprovedBy.id === currentUserId) {
                        skipped++;
                        continue;
                    }
                    vacation.status = Vacation_1.VacationStatus.FULLY_APPROVED;
                    vacation.secondApprovedBy = approver;
                    vacation.secondApprovedDate = new Date();
                    vacation.isApproved = true;
                    vacation.approvedBy = approver;
                    vacation.approvedDate = new Date();
                    secondApprovals++;
                }
            }
            await this.vacationRepository.save(vacations);
            // Agrupar por usuario para notificaciones
            const groupedByUser = new Map();
            for (const vacation of vacations) {
                if (vacation.userId === currentUserId)
                    continue;
                if (groupedByUser.has(vacation.userId)) {
                    groupedByUser.get(vacation.userId).dates.push(vacation.date);
                }
                else {
                    groupedByUser.set(vacation.userId, {
                        user: vacation.user,
                        dates: [vacation.date],
                        type: vacation.type
                    });
                }
            }
            // Enviar notificaciones por usuario
            for (const group of groupedByUser.values()) {
                try {
                    group.dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                    const isFullyApproved = ((_a = vacations.find(v => v.userId === group.user.id)) === null || _a === void 0 ? void 0 : _a.status) === Vacation_1.VacationStatus.FULLY_APPROVED;
                    await SlackNotificationService_1.slackNotificationService.sendVacationApprovedNotification(group.user, group.dates, group.type, approver.fullName, isFullyApproved || false);
                }
                catch (error) {
                    console.error('Error al enviar notificación de Slack:', error);
                }
            }
            let message = `Proceso completado: `;
            if (firstApprovals > 0) {
                message += `${firstApprovals} primera(s) aprobación(es), `;
            }
            if (secondApprovals > 0) {
                message += `${secondApprovals} segunda(s) aprobación(es) (completadas), `;
            }
            if (skipped > 0) {
                message += `${skipped} omitida(s) por restricciones, `;
            }
            message = message.slice(0, -2); // Remover la última coma
            return res.json({
                message,
                firstApprovals,
                secondApprovals,
                skipped,
                totalProcessed: firstApprovals + secondApprovals + skipped
            });
        }
        catch (error) {
            console.error('Error al aprobar días seleccionados:', error);
            return res.status(500).json({ message: 'Error al aprobar días seleccionados' });
        }
    }
}
exports.VacationController = VacationController;
exports.vacationController = new VacationController();
