const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/user.repository");
const ApiError = require("../utils/ApiError");

class AuthService {
  // Genera el token con el id y rol del usuario dentro
  generateToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  }

  async register(data) {
    const { name, email, password } = data;

    if (!name || name.trim() === "")
      throw new ApiError(400, "El nombre es obligatorio");
    if (!email || !email.includes("@"))
      throw new ApiError(400, "Email inválido");
    if (!password || password.length < 6)
      throw new ApiError(400, "La contraseña debe tener al menos 6 caracteres");

    // Verificar que el email no esté en uso
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ApiError(409, "Ya existe una cuenta con ese email");

    // Hashear la contraseña (10 = nivel de "dificultad" del hash, 10 es el estándar)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
    });

    // No devolvemos el password hasheado en la respuesta
    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(data) {
    const { email, password } = data;

    if (!email || !password)
      throw new ApiError(400, "Email y contraseña son obligatorios");

    // Buscar usuario (necesitamos el password hasheado para comparar)
    const user = await userRepository.findByEmail(email);

    // Mismo mensaje si el email no existe O si la contraseña es incorrecta
    // (no le damos pistas al atacante sobre cuál de los dos falló)
    if (!user) throw new ApiError(401, "Credenciales incorrectas");

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new ApiError(401, "Credenciales incorrectas");

    const token = this.generateToken(user);
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, "Usuario no encontrado");
    return user;
  }
}

module.exports = new AuthService();
