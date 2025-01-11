const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const morgan = require('morgan')
const methodOverride = require('method-override');
const { create } = require('express-handlebars');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const passport = require('passport');
const hbs = create({
    extname: 'hbs',
    defaultLayout: 'main',
    partialsDir: 'views/partials',
    helpers: require('./utils/helpers')
});
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const nodemailer = require('nodemailer');
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true'
  });
  
 app.use(
  session({
    store: new pgSession({
      pool: pool,
      tableName: 'Session',
    }),
    secret: process.env.SESSION_SECRET || 'SECRET',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000
    },
  })
);

app.use(morgan('dev'));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport');
app.use(methodOverride('_method'));
app.use(express.static('public'));

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

const router = require('./router');
app.use('/', router);

app.listen(PORT,()=>{
    console.log(`El servidor esta activo y esta escuchando por el puerto ${PORT}`)
})