"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SlackNotificationService_1 = require("./services/SlackNotificationService");
const Vacation_1 = require("./entity/Vacation");
// Mock de usuario para prueba
const testUser = {
    id: 1,
    fullName: 'Juan Pérez (Prueba Aprobación)',
    email: 'juan.test@example.com'
};
async function testApprovalNotifications() {
    console.log('🧪 Probando notificaciones de APROBACIÓN de vacaciones...');
    try {
        const testDate = new Date();
        // Prueba 1: Primera aprobación
        console.log('⏳ Probando primera aprobación...');
        await SlackNotificationService_1.slackNotificationService.sendVacationApprovedNotification(testUser, [testDate], Vacation_1.VacationType.REST_DAY, 'Admin de Prueba', false // No es aprobación final
        );
        console.log('✅ Primera aprobación enviada');
        // Esperar un poco
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Prueba 2: Aprobación final
        console.log('✅ Probando aprobación final...');
        await SlackNotificationService_1.slackNotificationService.sendVacationApprovedNotification(testUser, [testDate], Vacation_1.VacationType.REST_DAY, 'Segundo Admin de Prueba', true // Es aprobación final
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
            new Date(Date.now() + 345600000) // +4 días
        ];
        await SlackNotificationService_1.slackNotificationService.sendVacationApprovedNotification(testUser, rangeDates, Vacation_1.VacationType.REST_DAY, 'Admin de Prueba - Rango', true // Es aprobación final
        );
        console.log('✅ Aprobación de rango múltiple enviada');
        console.log('🎉 ¡Todas las pruebas de aprobación completadas!');
    }
    catch (error) {
        console.error('❌ Error en las pruebas de aprobación:', error);
        // Mostrar más detalles del error
        if (error === null || error === void 0 ? void 0 : error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        if (error === null || error === void 0 ? void 0 : error.request) {
            console.error('Request data:', error.request);
        }
        console.error('Error message:', (error === null || error === void 0 ? void 0 : error.message) || 'Error desconocido');
    }
}
// Ejecutar las pruebas
testApprovalNotifications();
