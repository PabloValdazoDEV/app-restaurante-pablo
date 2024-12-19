const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const prisma = require('../prisma/prisma');
const bcrypt = require('bcrypt');
const GitHubStrategy = require('passport-github2').Strategy
require('dotenv').config();

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { username: username }
      });

      if (!user) {
        return done(null, false, { message: 'Usuario no encontrado' });
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

// passport.use(new GitHubStrategy(
//   {
//     clientID: process.env.GITHUB_CLIENT_ID,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET,
//     callbackURL: process.env.GITHUB_CALLBACK_URL,
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
//       const user = await prisma.user.findUnique({
//         where: { 
//           githubId: profile.id,
//         }
//       });

//       if (user) {
//         return done(null, user);
//       } else {
//         const newUser = await prisma.user.create({
//           data: {
//             githubId: profile.id,
//             username: profile.username
//           }
//         });

//         return done(null, newUser);
//       }
//     } catch (error) {
//       return done(error);
//     }
//   }
// ));

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