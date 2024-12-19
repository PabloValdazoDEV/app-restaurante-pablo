const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const morgan = require('morgan')
const methodOverride = require('method-override');
const { create } = require('express-handlebars');
const session = require('express-session');
const passport = require('passport');
const hbs = create({
    extname: 'hbs',
    defaultLayout: 'main',
    partialsDir: 'views/partials',
    helpers: require('./utils/helpers')
});
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(session({
    secret: process.env.SECRET_KEY || 'clave_secreta',
    resave: false,
    saveUninitialized: false
}));
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