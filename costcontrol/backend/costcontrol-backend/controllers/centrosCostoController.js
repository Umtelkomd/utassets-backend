const { AppDataSource } = require('../data-source');
const { CentroCosto } = require('../entities/CentroCosto');

exports.getAll = async (req, res) => {
  try {
    const centros = await AppDataSource.getRepository(CentroCosto)
      .createQueryBuilder('centro')
      .leftJoinAndSelect('centro.proyecto', 'proyecto')
      .getMany();
    res.json(centros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const centro = await AppDataSource.getRepository(CentroCosto)
      .createQueryBuilder('centro')
      .leftJoinAndSelect('centro.proyecto', 'proyecto')
      .where('centro.id = :id', { id: Number(req.params.id) })
      .getOne();
    if (!centro) return res.status(404).json({ error: 'No encontrado' });
    res.json(centro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CentroCosto);
    const nuevo = repo.create(req.body);
    const saved = await repo.save(nuevo);
    
    // Cargar con la relación del proyecto para la respuesta
    const centroCostoCompleto = await repo
      .createQueryBuilder('centro')
      .leftJoinAndSelect('centro.proyecto', 'proyecto')
      .where('centro.id = :id', { id: saved.id })
      .getOne();
      
    res.status(201).json(centroCostoCompleto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CentroCosto);
    const centro = await repo.findOneBy({ id: Number(req.params.id) });
    if (!centro) return res.status(404).json({ error: 'No encontrado' });
    repo.merge(centro, req.body);
    await repo.save(centro);
    
    // Cargar con la relación del proyecto para la respuesta
    const centroCostoCompleto = await repo
      .createQueryBuilder('centro')
      .leftJoinAndSelect('centro.proyecto', 'proyecto')
      .where('centro.id = :id', { id: centro.id })
      .getOne();
      
    res.json(centroCostoCompleto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CentroCosto);
    const centro = await repo.findOneBy({ id: Number(req.params.id) });
    if (!centro) return res.status(404).json({ error: 'No encontrado' });
    await repo.remove(centro);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 