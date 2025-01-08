const prisma = require('../prisma/prisma')
const express = require('express');
const router = express.Router();
const passport = require('passport')
const bcrypt = require('bcrypt');
const isAdmin = require('../middelware/isAdmin');
const isLogin = require('../middelware/isLogin')

router.get('/create', isAdmin, (req, res)=>{
    try {
        res.render('create',{
            isAdmin: req.user.role === "ADMIN" ? true : false
        })
    } catch (error) {
        res.status(500).redirect('/error-404')
    }
})

router.post('/create', isAdmin ,  async (req, res)=>{
    const { username, password, role } = req.body
    try {
        if(!username && !password){
            res.status(500)
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data:{
                username: username,
                password: hashedPassword,
                role: role
                
            }
        });
        res.redirect('/auth/login')
    } catch (error) {
        console.error(`El error es ${error}`)
        res.status(500).redirect('/error-404')
    }
})

router.get('/login', isLogin,  (req, res)=>{
    res.render('login',{
        layout: 'cliente'
    })
})

router.post('/login', isLogin,  passport.authenticate('local', {
    successRedirect: '/order/queue',
    failureRedirect: '/auth/logout',
    failureFlash: false,
  }));

  

  router.get('/logout', function(req, res, next){
    try {
        req.logout(function(err) {
          if (err) { return next(err); }
          res.redirect('/auth/login');
        });
        
    } catch (error) {
        console.error(`El error es ${error}`)
        res.status(500).redirect('/error-404')
    }
  });

  router.get('/users', isAdmin, (req, res)=>{

    res.render('users',{
        isAdmin: req.user.role === "ADMIN" ? true : false
    })
  })

module.exports = router