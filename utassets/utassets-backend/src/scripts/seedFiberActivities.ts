import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';
import { FiberActivity } from '../entity/FiberActivity';

const initialActivities = [
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

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Conexión a la base de datos establecida');

    const activityRepository = AppDataSource.getRepository(FiberActivity);

    for (const activityData of initialActivities) {
      // Verificar si la actividad ya existe
      const existing = await activityRepository.findOne({
        where: { id: activityData.id }
      });

      if (existing) {
        console.log(`Actividad ${activityData.id} ya existe, actualizando...`);
        await activityRepository.update(activityData.id, activityData);
      } else {
        console.log(`Insertando actividad ${activityData.id}...`);
        const activity = activityRepository.create(activityData);
        await activityRepository.save(activity);
      }
    }

    console.log('✅ Todas las actividades han sido insertadas/actualizadas exitosamente');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al insertar actividades:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

seed();
