import { UserRole } from '../entity/User';

declare global {
    namespace Express {
        interface Request {
            user: {
                id: number;
                role: UserRole;
                // otros campos que puedas necesitar
            }
        }
    }
}

export { }; 