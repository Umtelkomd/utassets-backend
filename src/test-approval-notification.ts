import { slackNotificationService } from './services/SlackNotificationService';
import { VacationType } from './entity/Vacation';
import { User } from './entity/User';

// Mock de usuario para prueba
const testUser: User = {
    id: 1,
    fullName: 'Juan Pérez (Prueba Aprobación)',
    email: 'juan.test@example.com'
} as User;

async function testApprovalNotifications() {
    console.log('🧪 Probando notificaciones de APROBACIÓN de vacaciones...');

    try {
        const testDate = new Date();

        // Prueba 1: Primera aprobación
        console.log('⏳ Probando primera aprobación...');
        await slackNotificationService.sendVacationApprovedNotification(
            testUser,
            [testDate],
            VacationType.REST_DAY,
            'Admin de Prueba',
            false // No es aprobación final
        );
        console.log('✅ Primera aprobación enviada');

        // Esperar un poco
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Prueba 2: Aprobación final
        console.log('✅ Probando aprobación final...');
        await slackNotificationService.sendVacationApprovedNotification(
            testUser,
            [testDate],
            VacationType.REST_DAY,
            'Segundo Admin de Prueba',
            true // Es aprobación final
        );
        console.log('✅ Aprobación final enviada');

        // Esperar un poco
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Prueba 3: Rango de fechas múltiples
        console.log('📅 Probando aprobación de rango múltiple...');
        const rangeDates = [
            new Date(),
            new Date(Date.now() + 86400000), // +1 día
            new Date(Date.now() + 172800000), // +2 días
            new Date(Date.now() + 259200000), // +3 días
            new Date(Date.now() + 345600000)  // +4 días
        ];

        await slackNotificationService.sendVacationApprovedNotification(
            testUser,
            rangeDates,
            VacationType.REST_DAY,
            'Admin de Prueba - Rango',
            true // Es aprobación final
        );
        console.log('✅ Aprobación de rango múltiple enviada');

        console.log('🎉 ¡Todas las pruebas de aprobación completadas!');

    } catch (error: any) {
        console.error('❌ Error en las pruebas de aprobación:', error);

        // Mostrar más detalles del error
        if (error?.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        if (error?.request) {
            console.error('Request data:', error.request);
        }
        console.error('Error message:', error?.message || 'Error desconocido');
    }
}

// Ejecutar las pruebas
testApprovalNotifications(); 