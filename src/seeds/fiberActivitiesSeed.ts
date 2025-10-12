import { AppDataSource } from '../config/data-source';
import { FiberActivity } from '../entity/FiberActivity';

export async function seedFiberActivities() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const activityRepository = AppDataSource.getRepository(FiberActivity);

        // Check if activities already exist
        const existingActivities = await activityRepository.find();

        if (existingActivities.length > 0) {
            console.log('✅ Activities already exist, skipping seed...');
            return;
        }

        console.log('🌱 Seeding Fiber Activities...');

        const defaultActivities = [
            { id: 'DGF_ACT_001', description: 'HÜP-GFTA-ONT, FUSION + ACTIVAC.+ BOHRUNG', unit: 'UDS', price: 230.00 },
            { id: 'DGF_ACT_003', description: 'HÜP-GFTA-ONT, FUSION + BOHRUNG', unit: 'UDS', price: 184.00 },
            { id: 'DGF_ACT_004', description: 'HÜP-GFTA-ONT, ACTIVATION PART', unit: 'UDS', price: 46.00 },
            { id: 'DGF_BLOW_001', description: 'Blow 6/12/24 Glasfaserkabel (RD)', unit: 'ML', price: 0.43 },
            { id: 'DGF_BLOW_002', description: 'Blow 48/96/144 Glasfaserkabel (RA)', unit: 'ML', price: 0.62 },
            { id: 'DGF_BLOW_003', description: 'DP INSTALLATIONDP (TRAY, ROUTING PIPES INCL.)', unit: 'UDS', price: 705.00 },
            { id: 'DGF_BLOW_004', description: 'POP INSTALATION POP +CONECTING TRAYS', unit: 'UDS', price: 1300.00 },
            { id: 'GVG_BLOW_004', description: 'POP INSTALATION POP +CONECTING TRAYS', unit: 'UDS', price: 2500.00 },
            { id: 'DGF_CW_204', description: 'zusätzliche Kopflöcher Einblasen (ÜB)', unit: 'M3', price: 78.00 },
            { id: 'DGF_CW_205', description: 'zusätz. Kopflöcher Einblasen (Pflaster)', unit: 'M3', price: 110.00 },
            { id: 'DGF_CW_206', description: 'zusätz. Kopflöcher Einblasen (Asphalt)', unit: 'M3', price: 136.00 },
            { id: 'ING_FIX_003', description: 'HAUSBEGEHUNG INDIVIDUELLER POP GEBIET', unit: 'Units', price: 36.00 },
            { id: 'ING_FIX_010', description: 'HAUSANSCHLUSS TERMIN', unit: 'Termin', price: 2.60 },
            { id: 'ING_FIX_011', description: 'HAUSBEGEHUNG POP GEBIET KOMPLETER PAKET 35-45', unit: 'Termin', price: 21.00 },
            { id: 'ING_FIX_012', description: 'CLAUSULA PROTECCION EXCESO +45% HBG', unit: 'Termin', price: 33.00 },
            { id: 'ING_FIX_015', description: 'HAUSBEGEHUNG POP GEBIET KOMPLETER PAKET 35-45 GF+', unit: 'Termin', price: 26.00 }
        ];

        for (const activityData of defaultActivities) {
            const activity = activityRepository.create(activityData);
            await activityRepository.save(activity);
            console.log(`✅ Created activity: ${activity.id} - ${activity.description}`);
        }

        console.log('✅ Fiber Activities seeded successfully!');
    } catch (error) {
        console.error('❌ Error seeding Fiber Activities:', error);
        throw error;
    }
}

// Run seed if this file is executed directly
if (require.main === module) {
    seedFiberActivities()
        .then(() => {
            console.log('🎉 Seed completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Seed failed:', error);
            process.exit(1);
        });
}
