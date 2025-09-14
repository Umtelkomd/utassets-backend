const validateItem = (req, res, next) => {
    const { item_name, item_code, category, quantity, condition, location, responsible_person } = req.body;
    if (!item_name || !item_code || !category || !quantity || !condition || !location || !responsible_person) {
        console.log(req.body)
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    if (quantity <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }
    next();
  };
  
  module.exports = { validateItem };