const { AppDataSource } = require('../data-source');
const { CuentaPorPagar } = require('../entities/CuentaPorPagar');

exports.getAll = async (req, res) => {
  try {
    const cuentas = await AppDataSource.getRepository(CuentaPorPagar).find();
    res.json(cuentas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const cuenta = await AppDataSource.getRepository(CuentaPorPagar).findOneBy({ id: Number(req.params.id) });
    if (!cuenta) return res.status(404).json({ error: 'No encontrado' });
    res.json(cuenta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CuentaPorPagar);
    const nueva = repo.create(req.body);
    const saved = await repo.save(nueva);
    res.status(201).json({ id: saved.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CuentaPorPagar);
    const cuenta = await repo.findOneBy({ id: Number(req.params.id) });
    if (!cuenta) return res.status(404).json({ error: 'No encontrado' });
    repo.merge(cuenta, req.body);
    await repo.save(cuenta);
    res.json({ id: cuenta.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const repo = AppDataSource.getRepository(CuentaPorPagar);
    const cuenta = await repo.findOneBy({ id: Number(req.params.id) });
    if (!cuenta) return res.status(404).json({ error: 'No encontrado' });
    await repo.remove(cuenta);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 