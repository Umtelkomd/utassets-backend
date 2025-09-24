import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Comment } from '../entity/Comment';
import { UserRole } from '../entity/User';

const commentRepository = AppDataSource.getRepository(Comment);

export class CommentController {
    // Get all comments for a report
    async getByReportId(req: Request, res: Response) {
        try {
            const { reportId } = req.params;
            const comments = await commentRepository.find({
                where: { report: { id: Number(reportId) } },
                relations: ['user'],
                order: { createdAt: 'ASC' }
            });
            return res.json(comments);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching comments', error });
        }
    }

    // Update comment
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { content } = req.body;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const comment = await commentRepository.findOne({
                where: { id: Number(id) },
                relations: ['user']
            });

            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // Check if user is the owner or admin
            if (comment.user.id !== req.userId && req.userRole !== UserRole.ADMIN) {
                return res.status(403).json({ message: 'Not authorized to update this comment' });
            }

            comment.content = content;
            await commentRepository.save(comment);
            return res.json(comment);
        } catch (error) {
            return res.status(500).json({ message: 'Error updating comment', error });
        }
    }

    // Delete comment
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Verificar autenticación
            if (!req.user || !req.userId) {
                return res.status(401).json({ message: 'Usuario no autenticado' });
            }

            const comment = await commentRepository.findOne({
                where: { id: Number(id) },
                relations: ['user']
            });

            if (!comment) {
                return res.status(404).json({ message: 'Comment not found' });
            }

            // Check if user is the owner or admin
            if (comment.user.id !== req.userId && req.userRole !== UserRole.ADMIN) {
                return res.status(403).json({ message: 'Not authorized to delete this comment' });
            }

            await commentRepository.remove(comment);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: 'Error deleting comment', error });
        }
    }
} 