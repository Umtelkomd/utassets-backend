import { AppDataSource } from '../config/data-source';
import { User, UserRole } from '../entity/User';
import bcrypt from 'bcrypt';

class UserRepository {
    private repository = AppDataSource.getRepository(User);

    async createUser(userData: Partial<User>): Promise<User> {
        // Hash de la contraseña antes de guardarla
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        const user = this.repository.create(userData);
        return this.repository.save(user);
    }

    async getAllUsers(): Promise<User[]> {
        return this.repository.find();
    }

    async getUsersByRole(role: UserRole): Promise<User[]> {
        return this.repository.find({
            where: { role }
        });
    }

    async getUserById(id: number): Promise<User | null> {
        return this.repository.findOneBy({ id });
    }

    async getUserByUsername(username: string): Promise<User | null> {
        return this.repository.findOneBy({ username });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return this.repository.findOneBy({ email });
    }

    async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
        // Hash de la contraseña si se está actualizando
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }

        await this.repository.update(id, userData);
        return this.getUserById(id);
    }

    async deleteUser(id: number): Promise<User | null> {
        const userToDelete = await this.getUserById(id);
        if (!userToDelete) {
            return null;
        }

        await this.repository.delete(id);
        return userToDelete;
    }

    async verifyPassword(user: User, password: string): Promise<boolean> {
        return bcrypt.compare(password, user.password);
    }

    async updateLastLogin(id: number, ip?: string): Promise<void> {
        await this.repository.update(id, {
            lastLoginDate: new Date(),
            lastLoginIp: ip
        });
    }
}

export const userRepository = new UserRepository(); 