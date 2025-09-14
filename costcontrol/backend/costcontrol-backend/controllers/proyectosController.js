const { AppDataSource } = require('../data-source');
const { Proyecto } = require('../entities/Proyecto');
const { CentroCosto } = require('../entities/CentroCosto');

exports.getAll = async (req, res) => {
  try {
    const proyectos = await AppDataSource.getRepository(Proyecto)
      .createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.centrosCosto', 'centrosCosto')
      .getMany();
    res.json(proyectos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const proyecto = await AppDataSource.getRepository(Proyecto)
      .createQueryBuilder('proyecto')
      .leftJoinAndSelect('proyecto.centrosCosto', 'centrosCosto')
      .where('proyecto.id = :id', { id: Number(req.params.id) })
      .getOne();
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    res.json(proyecto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Proyecto);
    const nuevo = repo.create(req.body);
    const saved = await repo.save(nuevo);
    res.status(201).json(saved);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El código del proyecto ya existe' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

exports.update = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Proyecto);
    const proyecto = await repo.findOneBy({ id: Number(req.params.id) });
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    repo.merge(proyecto, req.body);
    const updated = await repo.save(proyecto);
    res.json(updated);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'El código del proyecto ya existe' });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
};

exports.remove = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(Proyecto);
    const proyecto = await repo.findOneBy({ id: Number(req.params.id) });
    if (!proyecto) return res.status(404).json({ error: 'Proyecto no encontrado' });
    
    // Verificar si tiene centros de costo asociados
    const centrosCosto = await AppDataSource.getRepository(CentroCosto)
      .findBy({ proyectoId: Number(req.params.id) });
    
    if (centrosCosto.length > 0) {
      return res.status(400).json({ 
        error: 'No se puede eliminar el proyecto porque tiene centros de costo asociados' 
      });
    }
    
    await repo.remove(proyecto);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const { proyectoId, fechaInicio, fechaFin } = req.query;
    
    let query = `
      SELECT 
        p.id,
        p.nombre,
        p.codigo,
        p.presupuesto,
        COUNT(DISTINCT cc.id) as totalCentrosCosto,
        COUNT(DISTINCT pag.id) as totalPagos,
        COALESCE(SUM(pag.monto), 0) as totalGastado,
        CASE 
          WHEN p.presupuesto > 0 THEN ROUND((COALESCE(SUM(pag.monto), 0) / p.presupuesto) * 100, 2)
          ELSE 0 
        END as porcentajeGastado
      FROM proyectos p
      LEFT JOIN centros_costo cc ON cc.proyectoId = p.id
      LEFT JOIN pagos pag ON pag.centroCostoId = cc.id
    `;

    const params = [];
    const conditions = [];

    if (proyectoId) {
      conditions.push('p.id = ?');
      params.push(proyectoId);
    }

    if (fechaInicio && fechaFin) {
      conditions.push('(pag.fecha BETWEEN ? AND ? OR pag.fecha IS NULL)');
      params.push(fechaInicio, fechaFin);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY p.id, p.nombre, p.codigo, p.presupuesto ORDER BY p.nombre';

    const result = await AppDataSource.query(query, params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCostsByProject = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    let query = `
      SELECT 
        p.id,
        p.nombre,
        p.codigo,
        cc.nombre as centroCosto,
        COUNT(pag.id) as totalPagos,
        COALESCE(SUM(pag.monto), 0) as totalMonto
      FROM proyectos p
      LEFT JOIN centros_costo cc ON cc.proyectoId = p.id
      LEFT JOIN pagos pag ON pag.centroCostoId = cc.id
    `;

    const params = [];
    if (fechaInicio && fechaFin) {
      query += ' WHERE (pag.fecha BETWEEN ? AND ? OR pag.fecha IS NULL)';
      params.push(fechaInicio, fechaFin);
    }

    query += ' GROUP BY p.id, p.nombre, p.codigo, cc.id, cc.nombre ORDER BY p.nombre, cc.nombre';

    const result = await AppDataSource.query(query, params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};