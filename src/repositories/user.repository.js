const prisma = require("../config/database");

class UserRepository {
  findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      // select: nunca devolvemos el password, ni por error
    });
  }

  create(data) {
    return prisma.user.create({ data });
  }
}

module.exports = new UserRepository();
