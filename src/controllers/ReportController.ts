import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Report } from '../entity/Report';
import { Comment } from '../entity/Comment';
import { UserRole } from '../entity/User';

const reportRepository = AppDataSource.getRepository(Report);
const commentRepository = AppDataSource.getRepository(Comment);

export class ReportController {
    // Create a new report
    async create(req: Request, res: Response) {
        try {
            const { title, description, type } = req.body;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const userId = req.userId;

            const report = reportRepository.create({
                title,
                description,
                type,
                user: { id: userId }
            });

            await reportRepository.save(report);
            return res.status(201).json(report);
        } catch (error) {
            return res.status(500).json({ message: 'Error creating report', error });
        }
    }

    // Get all reports
    async getAll(req: Request, res: Response) {
        try {
            const reports = await reportRepository.find({
                relations: ['user', 'comments'],
                order: { createdAt: 'DESC' }
            });
            return res.json(reports);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching reports', error });
        }
    }

    // Get report by ID
    async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const report = await reportRepository.findOne({
                where: { id: Number(id) },
                relations: ['user', 'comments', 'comments.user']
            });

            if (!report) {
                return res.status(404).json({ message: 'Report not found' });
            }

            return res.json(report);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching report', error });
        }
    }

    // Update report
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { title, description, type, status } = req.body;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const report = await reportRepository.findOne({
                where: { id: Number(id) },
                relations: ['user']
            });

            if (!report) {
                return res.status(404).json({ message: 'Report not found' });
            }

            // Check if user is the owner or admin
            if (report.user.id !== req.userId && req.userRole !== UserRole.ADMIN) {
                return res.status(403).json({ message: 'Not authorized to update this report' });
            }

            report.title = title || report.title;
            report.description = description || report.description;
            report.type = type || report.type;
            report.status = status || report.status;

            await reportRepository.save(report);
            return res.json(report);
        } catch (error) {
            return res.status(500).json({ message: 'Error updating report', error });
        }
    }

    // Delete report
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const report = await reportRepository.findOne({
                where: { id: Number(id) },
                relations: ['user']
            });

            if (!report) {
                return res.status(404).json({ message: 'Report not found' });
            }

            // Check if user is the owner or admin
            if (report.user.id !== req.userId && req.userRole !== UserRole.ADMIN) {
                return res.status(403).json({ message: 'Not authorized to delete this report' });
            }

            await reportRepository.remove(report);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: 'Error deleting report', error });
        }
    }

    // Add comment to report
    async addComment(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { content } = req.body;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const userId = req.userId;

            const report = await reportRepository.findOne({
                where: { id: Number(id) }
            });

            if (!report) {
                return res.status(404).json({ message: 'Report not found' });
            }

            const comment = commentRepository.create({
                content,
                user: { id: userId },
                report: { id: Number(id) }
            });

            await commentRepository.save(comment);
            return res.status(201).json(comment);
        } catch (error) {
            return res.status(500).json({ message: 'Error adding comment', error });
        }
    }
} 