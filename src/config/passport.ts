import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { userRepository } from '../repositories/UserRepository';
import { UserRole } from '../entity/User';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5050';

// Log de configuración para debug
console.log('🔧 Configuración OAuth:');
console.log('- BACKEND_URL:', BACKEND_URL);
console.log('- Callback URL será:', `${BACKEND_URL}/api/auth/google/callback`);
console.log('- NODE_ENV:', process.env.NODE_ENV);


// Solo configurar la estrategia si las credenciales están presentes
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET &&
    GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
    GOOGLE_CLIENT_SECRET !== 'your_google_client_secret_here') {

    console.log('✅ Configurando Google OAuth Strategy...');

    // Configurar la estrategia de Google OAuth
    passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('Google Profile:', profile);

            // Buscar usuario existente por email
            let existingUser = await userRepository.getUserByEmail(profile.emails![0].value);

            if (existingUser) {
                // Usuario ya existe, actualizamos algunos datos si es necesario
                if (!existingUser.photoUrl && profile.photos && profile.photos.length > 0) {
                    existingUser = await userRepository.updateUser(existingUser.id, {
                        photoUrl: profile.photos[0].value
                    });
                }
                return done(null, existingUser || false);
            }

            // Crear nuevo usuario
            const newUserData = {
                username: profile.emails![0].value.split('@')[0], // Usar la parte del email antes del @
                email: profile.emails![0].value,
                password: Math.random().toString(36).substring(2, 15), // Contraseña temporal aleatoria
                fullName: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
                role: UserRole.TECH,
                isActive: true,
                isEmailConfirmed: true, // Google OAuth confirma automáticamente el email
                photoUrl: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : undefined,
                googleId: profile.id
            };

            // Verificar si el username ya existe y generar uno único si es necesario
            let username = newUserData.username;
            let counter = 1;
            while (await userRepository.getUserByUsername(username)) {
                username = `${newUserData.username}${counter}`;
                counter++;
            }
            newUserData.username = username;

            const newUser = await userRepository.createUser(newUserData);
            return done(null, newUser || false);

        } catch (error) {
            console.error('Error en autenticación de Google:', error);
            return done(error, false);
        }
    }));

    // Serializar usuario para la sesión
    passport.serializeUser((user: any, done) => {
        done(null, user.id);
    });

    // Deserializar usuario de la sesión
    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await userRepository.getUserById(id);
            done(null, user || false);
        } catch (error) {
            done(error, false);
        }
    });
} else {
    console.warn('⚠️  Google OAuth no configurado - las credenciales no están disponibles');
    console.warn('📝 Las rutas de Google OAuth estarán disponibles pero no funcionarán hasta configurar las credenciales');
}

export default passport; 