const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const prisma = require('../prisma/prisma');
const bcrypt = require('bcrypt');
require('dotenv').config();

passport.use(new LocalStrategy(
  async (username, password, done) => {
    const regex = /^(?=.*[A-Z]).{7,}$/;
    try {
      const user = await prisma.user.findUnique({
        where: { username: username }
      });
      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
      }
      if(!regex.test(password)){
        return done(null, false, { message: 'Contraseña insegura' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Contraseña incorrecta' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});