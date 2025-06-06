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
    // Crear una nueva solicitud de vacación
    async createVacation(req, res) {
        var _a;
        try {
            const { userId, date, type, description } = req.body;
            const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
            // Verificar si ya existe una vacación para esa fecha y usuario
            const existingVacation = await this.vacationRepository.findOne({
                where: {
                    userId: parseInt(userId),
                    date: new Date(date)
                }
            });
            if (existingVacation) {
                return res.status(400).json({
                    message: 'Ya existe una solicitud de vacación para esta fecha'
                });
            }
            // Crear la vacación
            const vacation = this.vacationRepository.create({
                userId: parseInt(userId),
                date: new Date(date),
                type,
                description,
                isApproved: true, // Los administradores pueden aprobar automáticamente
                approvedDate: new Date(),
                approvedBy: { id: currentUserId }
            });
            await this.vacationRepository.save(vacation);
            // Obtener la vacación con las relaciones
            const savedVacation = await this.vacationRepository.findOne({
                where: { id: vacation.id },
                relations: ['user', 'approvedBy']
            });
            return res.status(201).json(savedVacation);
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
}
exports.VacationController = VacationController;
exports.vacationController = new VacationController();
