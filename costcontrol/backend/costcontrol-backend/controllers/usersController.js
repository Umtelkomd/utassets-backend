const { AppDataSource } = require('../data-source');
const axios = require('axios');

const usersController = {
  // Sincronizar usuario desde UTAssets
  async syncUserFromUTAssets(utassetsUser) {
    try {
      const userRepository = AppDataSource.getRepository('User');
      
      // Buscar si el usuario ya existe en CostControl
      let existingUser = await userRepository.findOne({ 
        where: { email: utassetsUser.email } 
      });

      const userData = {
        name: utassetsUser.fullName || utassetsUser.username,
        email: utassetsUser.email,
        // Mapear roles: administrador -> approver, tecnico -> creator
        role: utassetsUser.role === 'administrador' ? 'approver' : 'creator',
        active: utassetsUser.isActive !== false,
        // Usar un password dummy ya que la autenticación es externa
        password: 'SSO_USER_' + Math.random().toString(36).substring(2, 15)
      };

      if (existingUser) {
        // Actualizar usuario existente
        await userRepository.update(existingUser.id, userData);
        return await userRepository.findOne({ where: { id: existingUser.id } });
      } else {
        // Crear nuevo usuario
        const newUser = userRepository.create(userData);
        return await userRepository.save(newUser);
      }
    } catch (error) {
      console.error('Error al sincronizar usuario:', error);
      throw error;
    }
  },

  // Get all users
  async getAllUsers(req, res) {
    try {
      const userRepository = AppDataSource.getRepository('User');
      const users = await userRepository.find({
        select: ['id', 'name', 'email', 'role', 'active', 'createdAt', 'updatedAt']
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Simple login (legacy - mantenido por compatibilidad)
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const userRepository = AppDataSource.getRepository('User');
      const user = await userRepository.findOne({ 
        where: { email: email, active: true } 
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      // Simple password verification (no hash for simplicity)
      if (user.password !== password) {
        return res.status(401).json({ error: 'Incorrect password' });
      }

      // Return user data (without password)
      const { password: _, ...userWithoutPassword } = user;
      res.json({ 
        user: userWithoutPassword, 
        message: 'Login successful' 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Create user
  async createUser(req, res) {
    try {
      const userRepository = AppDataSource.getRepository('User');
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email and password are required' });
      }

      // Check if user already exists
      const existingUser = await userRepository.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }

      const newUser = userRepository.create({
        name,
        email,
        password,
        role: role || 'creator',
        active: true
      });

      const savedUser = await userRepository.save(newUser);
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = savedUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const userRepository = AppDataSource.getRepository('User');
      const { id } = req.params;
      const updateData = req.body;

      // Remove password from update if present (security)
      delete updateData.password;

      await userRepository.update(id, updateData);
      const updatedUser = await userRepository.findOne({ 
        where: { id: parseInt(id) },
        select: ['id', 'name', 'email', 'role', 'active', 'createdAt', 'updatedAt']
      });
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      const userRepository = AppDataSource.getRepository('User');
      const { id } = req.params;

      const result = await userRepository.delete(id);
      
      if (result.affected === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = usersController; 