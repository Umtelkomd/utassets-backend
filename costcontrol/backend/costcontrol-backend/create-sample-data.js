require('reflect-metadata');
require('dotenv').config();
const { AppDataSource } = require('./data-source');
const { User } = require('./entities/User');
const { Proyecto } = require('./entities/Proyecto');
const { CentroCosto } = require('./entities/CentroCosto');
const { Budget } = require('./entities/Budget');
const bcrypt = require('bcrypt');

async function createSampleData() {
  try {
    await AppDataSource.initialize();
    console.log('🔌 Connected to database');

    // Create Users
    const userRepo = AppDataSource.getRepository(User);
    const proyectoRepo = AppDataSource.getRepository(Proyecto);
    const centroCostoRepo = AppDataSource.getRepository(CentroCosto);
    const budgetRepo = AppDataSource.getRepository(Budget);

    // Check if users already exist
    const existingUsers = await userRepo.count();
    if (existingUsers > 0) {
      console.log('👥 Users already exist, skipping user creation');
    } else {
      // Create admin user
      const adminUser = userRepo.create({
        name: 'Administrador',
        email: 'admin@costcontrol.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      });
      await userRepo.save(adminUser);

      // Create approver user
      const approverUser = userRepo.create({
        name: 'Aprobador',
        email: 'approver@costcontrol.com',
        password: await bcrypt.hash('approver123', 10),
        role: 'approver'
      });
      await userRepo.save(approverUser);

      // Create creator user
      const creatorUser = userRepo.create({
        name: 'Creador',
        email: 'creator@costcontrol.com',
        password: await bcrypt.hash('creator123', 10),
        role: 'creator'
      });
      await userRepo.save(creatorUser);

      console.log('👥 Sample users created:');
      console.log('   📧 admin@costcontrol.com / admin123');
      console.log('   📧 approver@costcontrol.com / approver123');
      console.log('   📧 creator@costcontrol.com / creator123');
    }

    // Create sample projects
    const existingProjects = await proyectoRepo.count();
    if (existingProjects > 0) {
      console.log('📁 Projects already exist, skipping project creation');
    } else {
      const project1 = proyectoRepo.create({
        nombre: 'Sistema ERP',
        descripcion: 'Implementación del nuevo sistema ERP corporativo',
        codigo: 'ERP-2024',
        fechaInicio: new Date('2024-01-01'),
        fechaFin: new Date('2024-12-31'),
        presupuesto: 150000,
        estado: 'activo',
        cliente: 'Departamento de IT'
      });
      await proyectoRepo.save(project1);

      const project2 = proyectoRepo.create({
        nombre: 'Renovación Oficina',
        descripcion: 'Renovación completa de las oficinas corporativas',
        codigo: 'OFFICE-2024',
        fechaInicio: new Date('2024-03-01'),
        fechaFin: new Date('2024-06-30'),
        presupuesto: 80000,
        estado: 'activo',
        cliente: 'Recursos Humanos'
      });
      await proyectoRepo.save(project2);

      console.log('📁 Sample projects created');
    }

    // Create sample cost centers
    const existingCostCenters = await centroCostoRepo.count();
    if (existingCostCenters > 0) {
      console.log('🏢 Cost centers already exist, skipping creation');
    } else {
      const projects = await proyectoRepo.find();
      
      const costCenter1 = centroCostoRepo.create({
        nombre: 'Desarrollo de Software',
        descripcion: 'Centro de costos para desarrollo y programación',
        proyectoId: projects[0]?.id || null
      });
      await centroCostoRepo.save(costCenter1);

      const costCenter2 = centroCostoRepo.create({
        nombre: 'Marketing y Publicidad',
        descripcion: 'Gastos de marketing y campañas publicitarias',
        proyectoId: null
      });
      await centroCostoRepo.save(costCenter2);

      const costCenter3 = centroCostoRepo.create({
        nombre: 'Infraestructura',
        descripcion: 'Gastos de infraestructura y equipamiento',
        proyectoId: projects[1]?.id || null
      });
      await centroCostoRepo.save(costCenter3);

      console.log('🏢 Sample cost centers created');
    }

    // Create sample budgets
    const existingBudgets = await budgetRepo.count();
    if (existingBudgets > 0) {
      console.log('💰 Budgets already exist, skipping creation');
    } else {
      const costCenters = await centroCostoRepo.find();
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const periodo = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

      for (const costCenter of costCenters) {
        const budget = budgetRepo.create({
          centroCostoId: costCenter.id,
          proyectoId: costCenter.proyectoId,
          periodo: periodo,
          year: currentYear,
          month: currentMonth,
          montoAprobado: 10000,
          montoGastado: Math.random() * 3000, // Random amount spent
          montoComprometido: Math.random() * 2000, // Random committed amount
          estado: 'active',
          notas: `Presupuesto mensual para ${costCenter.nombre}`
        });
        await budgetRepo.save(budget);
      }

      console.log('💰 Sample budgets created');
    }

    console.log('✅ Sample data creation completed!');
    console.log('🚀 You can now access the application at: http://localhost:3000/costcontrol/');
    console.log('🔐 Login with: admin@costcontrol.com / admin123');

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await AppDataSource.destroy();
    process.exit(0);
  }
}

createSampleData();